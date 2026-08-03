<?php

use App\Models\User;
use App\Services\GoogleDriveService;
use function Pest\Laravel\actingAs;

test('authenticated users can delete documents when permitted', function () {
    $user = User::factory()->create();
    $driveService = \Mockery::mock(GoogleDriveService::class);

    $driveService->shouldReceive('getSharedDrive')
        ->once()
        ->with('drive-1')
        ->andReturn([
            'id' => 'drive-1',
            'name' => 'DMS Drive',
        ]);

    $driveService->shouldReceive('canDeleteFile')
        ->once()
        ->with('file-1')
        ->andReturn(true);

    $driveService->shouldReceive('deleteFile')
        ->once()
        ->with('file-1');

    app()->instance(GoogleDriveService::class, $driveService);

    $response = actingAs($user)->delete(route('documents.destroy', ['fileId' => 'file-1'], false), [
        'drive_id' => 'drive-1',
        'folder_id' => 'folder-1',
    ]);

    $response
        ->assertRedirect('/documents?drive_id=drive-1&folder_id=folder-1')
        ->assertSessionHas('success', 'File berhasil dihapus.');
});

test('authenticated users can not delete documents without permission', function () {
    $user = User::factory()->create();
    $driveService = \Mockery::mock(GoogleDriveService::class);

    $driveService->shouldReceive('getSharedDrive')
        ->once()
        ->with('drive-1')
        ->andReturn([
            'id' => 'drive-1',
            'name' => 'DMS Drive',
        ]);

    $driveService->shouldReceive('canDeleteFile')
        ->once()
        ->with('file-1')
        ->andReturn(false);

    $driveService->shouldNotReceive('deleteFile');

    app()->instance(GoogleDriveService::class, $driveService);

    $response = actingAs($user)->delete(route('documents.destroy', ['fileId' => 'file-1'], false), [
        'drive_id' => 'drive-1',
        'folder_id' => 'folder-1',
    ]);

    $response
        ->assertRedirect('/documents?drive_id=drive-1&folder_id=folder-1')
        ->assertSessionHas('error', 'Anda tidak memiliki izin untuk menghapus file ini.');
});
