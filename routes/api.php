<?php

use App\Http\Controllers\ArticleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// 1. Открытые маршруты (видят все)
Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/{article}', [ArticleController::class, 'show']);

// 2. Закрытые маршруты (только после логина)
Route::middleware(['auth:sanctum'])->group(function () {
    // Получение данных текущего юзера
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Управление статьями
    Route::post('/articles', [ArticleController::class, 'store']);
    Route::put('/articles/{article}', [ArticleController::class, 'update']);
    Route::delete('/articles/{article}', [ArticleController::class, 'destroy']);
    
    // Комментарии (если они требуют авторизации)
    Route::post('/articles/{article}/comments', [ArticleController::class, 'storeComment']);

    Route::post('/logout', function (Request $request) {
        Auth::guard('web')->logout(); // Выходим из сессии
        $request->session()->invalidate(); // Уничтожаем сессию
        $request->session()->regenerateToken(); // Сбрасываем CSRF токен
        return response()->json(['message' => 'Logged out']);
    });
});