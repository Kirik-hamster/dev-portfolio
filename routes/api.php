<?php
use App\Http\Controllers\ArticleController;
use Illuminate\Support\Facades\Route;

Route::get('/api/articles', [ArticleController::class, 'index']);
Route::get('/api/articles/{article}', [ArticleController::class, 'show']);
Route::post('/api/articles', [ArticleController::class, 'store']);
Route::post('/api/articles/{article}/comments', [ArticleController::class, 'storeComment']);