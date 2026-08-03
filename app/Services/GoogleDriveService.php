<?php

namespace App\Services;

use App\Models\User;
use Google\Client;
use Google\Service\Drive;
use Google\Service\Drive\DriveFile;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;

class GoogleDriveService
{
    protected $client;
    protected $drive;

    public function __construct()
    {
        /** @var User $user */
        $user = Auth::user();

        $this->client = new Client();
        $this->client->setClientId(config('services.google.client_id'));
        $this->client->setClientSecret(config('services.google.client_secret'));

        // Setup token
        $this->client->setAccessToken($user->google_access_token);

        // Otomatis refresh token kalo expired
        if ($this->client->isAccessTokenExpired() && $user->google_refresh_token) {
            $newToken = $this->client->fetchAccessTokenWithRefreshToken($user->google_refresh_token);
            $user->update(['google_access_token' => $newToken]);
        }

        $this->drive = new Drive($this->client);
    }

    public function listFiles($sharedDriveId, $folderId = null)
    {
        // Kalo ga ada folderId spesifik, tampilin root dari Shared Drive
        $parentId = $folderId ?? $sharedDriveId;

        $optParams = [
            'q' => "'{$parentId}' in parents and trashed = false",
            'corpora' => 'drive', // Wajib diset buat Shared Drive
            'driveId' => $sharedDriveId,
            'includeItemsFromAllDrives' => true, // Wajib diset buat Shared Drive
            'supportsAllDrives' => true, // Wajib diset buat Shared Drive
            'fields' => 'files(id, name, mimeType, size, modifiedTime, webViewLink, webContentLink, capabilities(canTrash, canDelete))',
            'orderBy' => 'folder, name'
        ];

        return $this->drive->files->listFiles($optParams)->getFiles();
    }

    public function listSharedDrives($namePrefix = null)
    {
        $drives = [];
        $pageToken = null;

        do {
            $optParams = [
                'pageSize' => 100,
                'fields' => 'nextPageToken, drives(id, name)',
            ];

            if ($pageToken) {
                $optParams['pageToken'] = $pageToken;
            }

            $response = $this->drive->drives->listDrives($optParams);

            foreach ($response->getDrives() ?? [] as $drive) {
                $driveName = $drive->getName();

                if ($namePrefix !== null && !str_starts_with($driveName, $namePrefix)) {
                    continue;
                }

                $drives[] = [
                    'id' => $drive->getId(),
                    'name' => $driveName,
                ];
            }

            $pageToken = $response->getNextPageToken();
        } while ($pageToken);

        return $drives;
    }

    public function getSharedDrive($sharedDriveId)
    {
        if (!$sharedDriveId) {
            return null;
        }

        try {
            $drive = $this->drive->drives->get($sharedDriveId, [
                'fields' => 'id, name',
            ]);

            return [
                'id' => $drive->getId(),
                'name' => $drive->getName(),
            ];
        } catch (\Throwable $exception) {
            return null;
        }
    }

    public function canUploadToLocation($sharedDriveId, $folderId = null)
    {
        if (!$sharedDriveId) {
            return false;
        }

        try {
            if ($folderId) {
                $folder = $this->drive->files->get($folderId, [
                    'supportsAllDrives' => true,
                    'fields' => 'id, capabilities(canAddChildren)',
                ]);

                return (bool) $folder->getCapabilities()?->getCanAddChildren();
            }

            $drive = $this->drive->drives->get($sharedDriveId, [
                'fields' => 'id, capabilities(canAddChildren)',
            ]);

            return (bool) $drive->getCapabilities()?->getCanAddChildren();
        } catch (\Throwable $exception) {
            return false;
        }
    }

    public function getFolderBreadcrumbs($sharedDriveId, $folderId = null)
    {
        if (!$folderId || $folderId === $sharedDriveId) {
            return [];
        }

        $breadcrumbs = [];
        $currentId = $folderId;
        $safetyCounter = 0;

        while ($currentId && $currentId !== $sharedDriveId && $safetyCounter < 30) {
            try {
                $folder = $this->drive->files->get($currentId, [
                    'supportsAllDrives' => true,
                    'fields' => 'id, name, mimeType, parents',
                ]);
            } catch (\Throwable $exception) {
                break;
            }

            $breadcrumbs[] = [
                'id' => $folder->getId(),
                'name' => $folder->getName(),
            ];

            $parents = $folder->getParents();
            $currentId = is_array($parents) && count($parents) > 0 ? $parents[0] : null;
            $safetyCounter++;
        }

        return array_reverse($breadcrumbs);
    }

    public function uploadFile($sharedDriveId, $folderId, UploadedFile $uploadedFile)
    {
        $parentId = $folderId ?? $sharedDriveId;

        $driveFileMetadata = new DriveFile([
            'name' => $uploadedFile->getClientOriginalName(),
            'parents' => [$parentId],
        ]);

        return $this->drive->files->create($driveFileMetadata, [
            'data' => file_get_contents($uploadedFile->getRealPath()),
            'mimeType' => $uploadedFile->getMimeType(),
            'uploadType' => 'multipart',
            'supportsAllDrives' => true,
            'fields' => 'id, name, mimeType, size, modifiedTime, webViewLink, webContentLink',
        ]);
    }

    public function canDeleteFile($fileId)
    {
        if (!$fileId) {
            return false;
        }

        try {
            $file = $this->drive->files->get($fileId, [
                'supportsAllDrives' => true,
                'fields' => 'id, capabilities(canTrash, canDelete)',
            ]);

            $capabilities = $file->getCapabilities();

            return (bool) ($capabilities?->getCanTrash() || $capabilities?->getCanDelete());
        } catch (\Throwable $exception) {
            return false;
        }
    }

    public function deleteFile($fileId)
    {
        $file = $this->drive->files->get($fileId, [
            'supportsAllDrives' => true,
            'fields' => 'id, capabilities(canTrash, canDelete)',
        ]);

        $capabilities = $file->getCapabilities();
        $canTrash = (bool) $capabilities?->getCanTrash();
        $canDelete = (bool) $capabilities?->getCanDelete();

        if ($canTrash) {
            return $this->drive->files->update($fileId, new DriveFile([
                'trashed' => true,
            ]), [
                'supportsAllDrives' => true,
                'fields' => 'id, trashed',
            ]);
        }

        if ($canDelete) {
            return $this->drive->files->delete($fileId, [
                'supportsAllDrives' => true,
            ]);
        }

        throw new \RuntimeException('User has no permission to delete or trash this file.');
    }
}
