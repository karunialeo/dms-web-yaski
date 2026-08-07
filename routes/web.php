<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('documents', [DocumentController::class, 'index'])->name('documents.index');
    Route::post('documents/folders', [DocumentController::class, 'storeFolder'])->name('documents.folders.store');
    Route::post('documents/upload', [DocumentController::class, 'upload'])->name('documents.upload');
    Route::delete('documents/{fileId}', [DocumentController::class, 'destroy'])->name('documents.destroy');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
