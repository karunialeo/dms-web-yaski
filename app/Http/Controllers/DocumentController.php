<?php

namespace App\Http\Controllers;

use App\Models\DocumentMetadata;
use App\Services\GoogleDriveService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public function index(Request $request, GoogleDriveService $driveService)
    {
        $driveId = $request->query('drive_id');
        $folderId = $request->query('folder_id');
        $sharedDrives = [];

        $selectedDrive = null;
        $files = [];
        $folderBreadcrumbs = [];
        $canUpload = false;

        if ($driveId) {
            $selectedDrive = $driveService->getSharedDrive($driveId);

            if ($selectedDrive) {
                $files = array_map(function ($file) {
                    $capabilities = $file->getCapabilities();

                    return [
                        'id' => $file->getId(),
                        'name' => $file->getName(),
                        'mimeType' => $file->getMimeType(),
                        'size' => $file->getSize(),
                        'modifiedTime' => $file->getModifiedTime(),
                        'webViewLink' => $file->getWebViewLink(),
                        'webContentLink' => $file->getWebContentLink(),
                        'canDelete' => (bool) ($capabilities?->getCanTrash() || $capabilities?->getCanDelete()),
                    ];
                }, $driveService->listFiles($driveId, $folderId));
                $folderBreadcrumbs = $driveService->getFolderBreadcrumbs($driveId, $folderId);
                $canUpload = $driveService->canUploadToLocation($driveId, $folderId);
            }
        } else {
            $sharedDrives = $driveService->listSharedDrives('DMS');
        }

        return Inertia::render('documents/index', [
            'sharedDrives' => $sharedDrives,
            'selectedDrive' => $selectedDrive,
            'canUpload' => $canUpload,
            'files' => $files,
            'folderBreadcrumbs' => $folderBreadcrumbs,
        ]);
    }

    public function upload(Request $request, GoogleDriveService $driveService)
    {
        $validated = $request->validate([
            'drive_id' => ['required', 'string'],
            'folder_id' => ['nullable', 'string'],
            'file' => ['required', 'file', 'max:102400'],
            'category' => ['required', 'string'],
            'status' => ['required', 'string'],
        ]);

        $drive = $driveService->getSharedDrive($validated['drive_id']);

        if (!$drive) {
            return redirect()->route('documents.index')->with('error', 'Shared Drive tidak ditemukan atau tidak bisa diakses.');
        }

        if (!$driveService->canUploadToLocation($validated['drive_id'], $validated['folder_id'] ?? null)) {
            return redirect()
                ->route('documents.index', [
                    'drive_id' => $validated['drive_id'],
                    'folder_id' => $validated['folder_id'] ?? null,
                ])
                ->with('error', 'Anda tidak memiliki izin upload ke folder ini.');
        }

        try {
            $uploadedFileId = $driveService->uploadFile($validated['drive_id'], $validated['folder_id'] ?? null, $validated['file']);

            DocumentMetadata::create([
                'google_file_id' => $uploadedFileId,
                'document_number' => null,
                'category' => $validated['category'],
                'status' => $validated['status'],
            ]);
        } catch (\Throwable $exception) {
            return redirect()
                ->route('documents.index', [
                    'drive_id' => $validated['drive_id'],
                    'folder_id' => $validated['folder_id'] ?? null,
                ])
                ->with('error', 'Upload gagal. Silakan coba lagi.');
        }

        return redirect()
            ->route('documents.index', [
                'drive_id' => $validated['drive_id'],
                'folder_id' => $validated['folder_id'] ?? null,
            ])
            ->with('uploaded_file_id', $uploadedFileId)
            ->with('success', 'Upload selesai. File berhasil ditambahkan.');
    }

    public function destroy(Request $request, GoogleDriveService $driveService, string $fileId)
    {
        $validated = $request->validate([
            'drive_id' => ['required', 'string'],
            'folder_id' => ['nullable', 'string'],
        ]);

        $drive = $driveService->getSharedDrive($validated['drive_id']);

        if (!$drive) {
            return redirect()->route('documents.index')->with('error', 'Shared Drive tidak ditemukan atau tidak bisa diakses.');
        }

        if (!$driveService->canDeleteFile($fileId)) {
            return redirect()
                ->route('documents.index', [
                    'drive_id' => $validated['drive_id'],
                    'folder_id' => $validated['folder_id'] ?? null,
                ])
                ->with('error', 'Anda tidak memiliki izin untuk menghapus file ini.');
        }

        try {
            $driveService->deleteFile($fileId);

            DocumentMetadata::where('google_file_id', $fileId)->delete();
        } catch (\Throwable $exception) {
            report($exception);

            return redirect()
                ->route('documents.index', [
                    'drive_id' => $validated['drive_id'],
                    'folder_id' => $validated['folder_id'] ?? null,
                ])
                ->with('error', 'Hapus file gagal. Silakan coba lagi.');
        }

        return redirect()
            ->route('documents.index', [
                'drive_id' => $validated['drive_id'],
                'folder_id' => $validated['folder_id'] ?? null,
            ])
            ->with('success', 'File berhasil dihapus.');
    }
}
