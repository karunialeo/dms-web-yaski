<?php

namespace App\Http\Controllers;

use App\Models\DocumentMetadata;
use App\Services\GoogleDriveService;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(GoogleDriveService $driveService): Response
    {
        $today = Carbon::today();

        $stats = [
            'totalDocuments' => DocumentMetadata::count(),
            'pendingReview' => DocumentMetadata::where('status', 'review')->count(),
            'expiredDocuments' => DocumentMetadata::whereDate('expired_at', '<', $today)->count(),
        ];

        $expiringSoonMetadata = DocumentMetadata::query()
            ->whereNotNull('expired_at')
            ->whereDate('expired_at', '>=', $today)
            ->orderBy('expired_at', 'asc')
            ->limit(5)
            ->get([
                'id',
                'google_file_id',
                'category',
                'department',
                'status',
                'expired_at',
                'created_at',
            ]);

        $recentUploadsMetadata = DocumentMetadata::query()
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get([
                'id',
                'google_file_id',
                'category',
                'department',
                'status',
                'expired_at',
                'created_at',
            ]);

        $googleFileIds = $expiringSoonMetadata
            ->pluck('google_file_id')
            ->merge($recentUploadsMetadata->pluck('google_file_id'))
            ->filter()
            ->unique()
            ->values()
            ->all();

        $fileDetailsById = $driveService->getFileDetailsByIds($googleFileIds);

        $mapMetadata = static function (DocumentMetadata $metadata) use ($fileDetailsById): array {
            $fileDetails = $fileDetailsById[$metadata->google_file_id] ?? null;

            return [
                'id' => $metadata->id,
                'google_file_id' => $metadata->google_file_id,
                'fileName' => $fileDetails['name'] ?? 'File tidak ditemukan',
                'webViewLink' => $fileDetails['webViewLink'] ?? null,
                'category' => $metadata->category,
                'department' => $metadata->department,
                'status' => $metadata->status,
                'expired_at' => $metadata->expired_at?->toDateString(),
                'created_at' => $metadata->created_at?->toDateString(),
            ];
        };

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'expiringDocs' => $expiringSoonMetadata->map($mapMetadata)->values(),
            'recentDocs' => $recentUploadsMetadata->map($mapMetadata)->values(),
        ]);
    }
}
