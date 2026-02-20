<?php

use App\Http\Controllers\ArticleController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\CommentController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/blogs', [BlogController::class, 'index']); // Список всех "папок" (блогов пользователей)
Route::get('/blogs/{blog}/articles', [ArticleController::class, 'index']); // Все статьи конкретного блога
Route::get('/articles/{article}', [ArticleController::class, 'show']); // Деталка статьи
// Публичная лента всех блогов сообщества
Route::get('/community-articles', [ArticleController::class, 'community']);
Route::get('/portfolio', [ArticleController::class, 'portfolio']);

// 2. Закрытые маршруты (только после логина)
Route::middleware(['auth:sanctum'])->group(function () {
    // Получение данных текущего юзера
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/blogs', [BlogController::class, 'store']);
    Route::put('/blogs/{blog}', [BlogController::class, 'update']); // Обновление
    Route::delete('/blogs/{blog}', [BlogController::class, 'destroy']); // Удаление
    
    Route::post('/blogs/{blog}/articles', [ArticleController::class, 'store']);
    Route::put('/articles/{article}', [ArticleController::class, 'update']);
    Route::delete('/articles/{article}', [ArticleController::class, 'destroy']);
    
    // Комментарии (если они требуют авторизации)
    Route::post('/articles/{article}/comments', [CommentController::class, 'store']);
    Route::post('/comments/{comment}/toggle-like', [CommentController::class, 'toggleLike']);
    Route::put('/comments/{comment}', [CommentController::class, 'update']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);

    Route::post('/logout', function (Request $request) {
        Auth::guard('web')->logout(); // Выходим из сессии
        $request->session()->invalidate(); // Уничтожаем сессию
        $request->session()->regenerateToken(); // Сбрасываем CSRF токен
        return response()->json(['message' => 'Logged out']);
    });
});