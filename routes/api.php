<?php

use App\Http\Controllers\DocumentController;
use Illuminate\Support\Facades\Route;

Route::get('/documents/expiring-alerts', [DocumentController::class, 'expiringAlerts'])
    ->name('documents.expiring-alerts');
