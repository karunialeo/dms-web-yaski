<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DocumentController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('documents', [DocumentController::class, 'index'])->name('documents.index');
    Route::post('documents/upload', [DocumentController::class, 'upload'])->name('documents.upload');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
