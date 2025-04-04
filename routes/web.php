<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboarController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\UploadController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', DashboarController::class)->name('dashboard');
    Route::resource('categories', CategoryController::class);
    Route::resource('articles', PostController::class);
    Route::post('/upload', [UploadController::class, 'uploadImage']);
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
