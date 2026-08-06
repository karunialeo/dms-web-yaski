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

test('authenticated users can create folders when permitted', function () {
    $user = User::factory()->create();
    $driveService = \Mockery::mock(GoogleDriveService::class);

    $driveService->shouldReceive('getSharedDrive')
        ->once()
        ->with('drive-1')
        ->andReturn([
            'id' => 'drive-1',
            'name' => 'DMS Drive',
        ]);

    $driveService->shouldReceive('canUploadToLocation')
        ->once()
        ->with('drive-1', 'folder-1')
        ->andReturn(true);

    $driveService->shouldReceive('createFolder')
        ->once()
        ->with('drive-1', 'folder-1', 'Folder Baru')
        ->andReturn('new-folder-id');

    app()->instance(GoogleDriveService::class, $driveService);

    $response = actingAs($user)->post(route('documents.folders.store', [], false), [
        'drive_id' => 'drive-1',
        'folder_id' => 'folder-1',
        'folder_name' => 'Folder Baru',
    ]);

    $response
        ->assertRedirect('/documents?drive_id=drive-1&folder_id=folder-1')
        ->assertSessionHas('success', 'Folder berhasil ditambahkan.');
});

test('authenticated users can not create folders without permission', function () {
    $user = User::factory()->create();
    $driveService = \Mockery::mock(GoogleDriveService::class);

    $driveService->shouldReceive('getSharedDrive')
        ->once()
        ->with('drive-1')
        ->andReturn([
            'id' => 'drive-1',
            'name' => 'DMS Drive',
        ]);

    $driveService->shouldReceive('canUploadToLocation')
        ->once()
        ->with('drive-1', 'folder-1')
        ->andReturn(false);

    $driveService->shouldNotReceive('createFolder');

    app()->instance(GoogleDriveService::class, $driveService);

    $response = actingAs($user)->post(route('documents.folders.store', [], false), [
        'drive_id' => 'drive-1',
        'folder_id' => 'folder-1',
        'folder_name' => 'Folder Baru',
    ]);

    $response
        ->assertRedirect('/documents?drive_id=drive-1&folder_id=folder-1')
        ->assertSessionHas('error', 'Anda tidak memiliki izin untuk menambah folder di lokasi ini.');
});

test('root search returns matching files across shared drives', function () {
    $user = User::factory()->create();
    $matchingFile = \Mockery::mock();
    $matchingFile->shouldReceive('getCapabilities')->andReturn(null);
    $matchingFile->shouldReceive('getId')->andReturn('file-1');
    $matchingFile->shouldReceive('getName')->andReturn('Kontrak Vendor');
    $matchingFile->shouldReceive('getMimeType')->andReturn('application/pdf');
    $matchingFile->shouldReceive('getSize')->andReturn('2048');
    $matchingFile->shouldReceive('getModifiedTime')->andReturn('2026-08-06T10:00:00Z');
    $matchingFile->shouldReceive('getWebViewLink')->andReturn('https://example.com/view/file-1');
    $matchingFile->shouldReceive('getWebContentLink')->andReturn('https://example.com/download/file-1');
    $matchingFile->shouldReceive('getDriveId')->andReturn('drive-1');

    $driveService = \Mockery::mock(GoogleDriveService::class);
    $driveService->shouldReceive('searchFilesAcrossSharedDrives')
        ->once()
        ->with('kontrak', 'DMS')
        ->andReturn([$matchingFile]);
    $driveService->shouldNotReceive('listSharedDrives');

    app()->instance(GoogleDriveService::class, $driveService);

    $response = actingAs($user)->get(route('documents.index', ['search' => 'kontrak'], false));

    $response
        ->assertOk()
        ->assertInertia(fn($page) => $page
            ->where('isGlobalSearch', true)
            ->where('filters.search', 'kontrak')
            ->has('files', 1)
            ->where('files.0.id', 'file-1')
            ->where('files.0.driveId', 'drive-1')
            ->where('sharedDrives', []));
});
