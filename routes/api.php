<?php
use App\Http\Controllers\ArticleController;
use Illuminate\Support\Facades\Route;

// Это создаст маршруты: GET /api/articles, POST /api/articles и т.д.
Route::apiResource('articles', ArticleController::class);
Route::post('articles/{article}/comments', [ArticleController::class, 'storeComment']);