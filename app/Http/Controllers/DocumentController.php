<?php

namespace App\Http\Controllers;

use App\Models\DocumentMetadata;
use App\Services\GoogleDriveService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public function index(Request $request, GoogleDriveService $driveService)
    {
        $driveId = $request->query('drive_id');
        $folderId = $request->query('folder_id');
        $search = $request->query('search');
        $category = $request->query('category');
        $department = $request->query('department');

        if ($folderId === '') {
            $folderId = null;
        }

        if (is_string($search)) {
            $search = trim($search);

            if ($search === '') {
                $search = null;
            }
        }

        if ($category === 'all') {
            $category = null;
        }

        if ($department === 'all') {
            $department = null;
        }

        $sharedDrives = [];

        $selectedDrive = null;
        $files = [];
        $folderBreadcrumbs = [];
        $canUpload = false;
        $validGoogleFileIds = [];
        $hasMetadataFilter = !empty($category) || !empty($department);
        $isGlobalSearch = !$driveId && !empty($search);

        if ($hasMetadataFilter) {
            $metadataQuery = DocumentMetadata::query();

            if (!empty($category)) {
                $metadataQuery->where('category', $category);
            }

            if (!empty($department)) {
                $metadataQuery->where('department', $department);
            }

            $validGoogleFileIds = $metadataQuery->pluck('google_file_id')->toArray();
        }

        if ($driveId) {
            $selectedDrive = $driveService->getSharedDrive($driveId);

            if ($selectedDrive) {
                $driveFiles = $driveService->listFiles($driveId, $folderId, $search);

                if ($hasMetadataFilter) {
                    $driveFiles = array_filter($driveFiles, function ($file) use ($validGoogleFileIds) {
                        return in_array($file->getId(), $validGoogleFileIds, true);
                    });
                }

                $fileIds = array_map(fn($file) => $file->getId(), $driveFiles);
                $metadataByGoogleFileId = DocumentMetadata::query()
                    ->whereIn('google_file_id', $fileIds)
                    ->get()
                    ->keyBy('google_file_id');

                $files = array_map(function ($file) use ($metadataByGoogleFileId) {
                    $capabilities = $file->getCapabilities();
                    $metadata = $metadataByGoogleFileId->get($file->getId());

                    return [
                        'id' => $file->getId(),
                        'name' => $file->getName(),
                        'mimeType' => $file->getMimeType(),
                        'size' => $file->getSize(),
                        'modifiedTime' => $file->getModifiedTime(),
                        'webViewLink' => $file->getWebViewLink(),
                        'webContentLink' => $file->getWebContentLink(),
                        'canDelete' => (bool) ($capabilities?->getCanTrash() || $capabilities?->getCanDelete()),
                        'metadata' => $metadata ? [
                            'category' => $metadata->category,
                            'department' => $metadata->department,
                            'status' => $metadata->status,
                            'issue_at' => $metadata->issue_at?->toDateString(),
                            'expired_at' => $metadata->expired_at?->toDateString(),
                            'pic_emails' => $metadata->pic_emails ?? [],
                        ] : null,
                    ];
                }, $driveFiles);
                $folderBreadcrumbs = $driveService->getFolderBreadcrumbs($driveId, $folderId);
                $canUpload = $driveService->canUploadToLocation($driveId, $folderId);
            }
        } elseif ($isGlobalSearch) {
            $driveFiles = $driveService->searchFilesAcrossSharedDrives($search, 'DMS');

            if ($hasMetadataFilter) {
                $driveFiles = array_filter($driveFiles, function ($file) use ($validGoogleFileIds) {
                    return in_array($file->getId(), $validGoogleFileIds, true);
                });
            }

            $fileIds = array_map(fn($file) => $file->getId(), $driveFiles);
            $metadataByGoogleFileId = DocumentMetadata::query()
                ->whereIn('google_file_id', $fileIds)
                ->get()
                ->keyBy('google_file_id');

            $files = array_map(function ($file) use ($metadataByGoogleFileId) {
                $capabilities = $file->getCapabilities();
                $metadata = $metadataByGoogleFileId->get($file->getId());

                return [
                    'id' => $file->getId(),
                    'name' => $file->getName(),
                    'mimeType' => $file->getMimeType(),
                    'size' => $file->getSize(),
                    'modifiedTime' => $file->getModifiedTime(),
                    'webViewLink' => $file->getWebViewLink(),
                    'webContentLink' => $file->getWebContentLink(),
                    'canDelete' => (bool) ($capabilities?->getCanTrash() || $capabilities?->getCanDelete()),
                    'driveId' => $file->getDriveId(),
                    'metadata' => $metadata ? [
                        'category' => $metadata->category,
                        'department' => $metadata->department,
                        'status' => $metadata->status,
                        'issue_at' => $metadata->issue_at?->toDateString(),
                        'expired_at' => $metadata->expired_at?->toDateString(),
                        'pic_emails' => $metadata->pic_emails ?? [],
                    ] : null,
                ];
            }, $driveFiles);
        } else {
            $sharedDrives = $driveService->listSharedDrives('DMS');
        }

        return Inertia::render('documents/index', [
            'sharedDrives' => $sharedDrives,
            'selectedDrive' => $selectedDrive,
            'canUpload' => $canUpload,
            'files' => $files,
            'folderBreadcrumbs' => $folderBreadcrumbs,
            'isGlobalSearch' => $isGlobalSearch,
            'filters' => [
                'search' => $search,
                'category' => $category,
                'department' => $department,
            ],
        ]);
    }

    public function upload(Request $request, GoogleDriveService $driveService)
    {
        $validated = $request->validate([
            'drive_id' => ['required', 'string'],
            'folder_id' => ['nullable', 'string'],
            'file' => ['required', 'file', 'max:102400'],
            'category' => ['required', 'string'],
            'department' => ['required', 'string'],
            'status' => ['required', 'string'],
            'issue_at' => ['nullable', 'date'],
            'expired_at' => ['nullable', 'date'],
            'pic_emails' => ['nullable', 'string'],
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

            $picEmails = null;
            if (!empty($validated['pic_emails'])) {
                $picEmails = array_map('trim', explode(',', $validated['pic_emails']));
            }

            DocumentMetadata::create([
                'google_file_id' => $uploadedFileId,
                'document_number' => null,
                'category' => $validated['category'],
                'department' => $validated['department'],
                'status' => $validated['status'],
                'issue_at' => $validated['issue_at'] ?? null,
                'expired_at' => $validated['expired_at'] ?? null,
                'pic_emails' => $picEmails,
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

    public function storeFolder(Request $request, GoogleDriveService $driveService)
    {
        $validated = $request->validate([
            'drive_id' => ['required', 'string'],
            'folder_id' => ['nullable', 'string'],
            'folder_name' => ['required', 'string', 'max:255'],
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
                ->with('error', 'Anda tidak memiliki izin untuk menambah folder di lokasi ini.');
        }

        try {
            $driveService->createFolder(
                $validated['drive_id'],
                $validated['folder_id'] ?? null,
                $validated['folder_name'],
            );
        } catch (\Throwable $exception) {
            report($exception);

            return redirect()
                ->route('documents.index', [
                    'drive_id' => $validated['drive_id'],
                    'folder_id' => $validated['folder_id'] ?? null,
                ])
                ->with('error', 'Tambah folder gagal. Silakan coba lagi.');
        }

        return redirect()
            ->route('documents.index', [
                'drive_id' => $validated['drive_id'],
                'folder_id' => $validated['folder_id'] ?? null,
            ])
            ->with('success', 'Folder berhasil ditambahkan.');
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

    public function expiringAlerts()
    {
        $thresholds = [365, 180, 90, 30, 14, 7];
        $today = Carbon::now()->startOfDay();

        $documents = DocumentMetadata::whereNotNull('expired_at')->get();

        $results = [];

        foreach ($documents as $document) {
            $diffDays = (int) $today->diffInDays($document->expired_at, false);

            if (in_array($diffDays, $thresholds, true)) {
                $results[] = [
                    'id' => $document->id,
                    'google_file_id' => $document->google_file_id,
                    'document_number' => $document->document_number,
                    'category' => $document->category,
                    'department' => $document->department,
                    'status' => $document->status,
                    'expired_at' => $document->expired_at->toDateString(),
                    'pic_emails' => $document->pic_emails,
                    'alert_type' => "{$diffDays} hari",
                ];
            }
        }

        return response()->json($results);
    }
}
