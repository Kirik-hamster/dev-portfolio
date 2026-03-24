<?php

use App\Http\Controllers\ArticleController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Auth\VerifyCodeController;
use App\Http\Controllers\Auth\PasswordUpdateController;
use App\Http\Controllers\HomeSettingController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Api\ResumeUploadController;
use App\Http\Controllers\Api\ImageUploadController;
use App\Http\Controllers\TagController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/blogs', [BlogController::class, 'index']); // Список всех "папок" (блогов пользователей)
Route::get('/blogs/{blog}', [BlogController::class, 'show']);
Route::get('/blogs/{blog}/articles', [ArticleController::class, 'index']); // Все статьи конкретного блога
Route::get('/articles/{article}', [ArticleController::class, 'show']); // Деталка статьи

// Публичный роут для получения комментариев
Route::get('/articles/{article}/comments', [CommentController::class, 'index']);
// Публичный роут для получения веток ответов
Route::get('/comments/{comment}/replies', [CommentController::class, 'replies']);

// Публичная лента всех блогов сообщества
Route::get('/community-articles', [ArticleController::class, 'community']);
Route::get('/portfolio', [ArticleController::class, 'portfolio']);

Route::get('/top-tags', [TagController::class, 'top']);

Route::post('/verify-code', VerifyCodeController::class)->middleware('auth:sanctum');
Route::post('/verify-resend', [VerifyCodeController::class, 'resend'])
    ->middleware('auth:sanctum', 'throttle:1,1');
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/home-settings', [HomeSettingController::class, 'show']);

// 2. Закрытые маршруты (только после логина)
Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    // Получение данных текущего юзера
    
    // Обновление пароля
    // Этап 1: Запрос кода на почту
    Route::post('/password/request-code', [PasswordUpdateController::class, 'requestCode']);
    // Этап 2: Обновление пароля по коду
    Route::post('/password/update', [PasswordUpdateController::class, 'update']);

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
    Route::get('/user/comments', [CommentController::class, 'userHistory']);

    Route::post('/logout', function (Request $request) {
        Auth::guard('web')->logout(); // Выходим из сессии
        $request->session()->invalidate(); // Уничтожаем сессию
        $request->session()->regenerateToken(); // Сбрасываем CSRF токен
        return response()->json(['message' => 'Logged out']);
    });

    Route::prefix('admin/settings')->group(function () {
        Route::get('/mail', [SettingController::class, 'getMail']);
        Route::post('/mail', [SettingController::class, 'updateMail']);
        Route::post('/mail-test', [SettingController::class, 'testMail']);

        Route::post('/resume', [SettingController::class, 'uploadResume']);
        Route::delete('/resume', [SettingController::class, 'deleteResume']);
    });

    Route::prefix('admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::patch('/users/{user}/role', [UserController::class, 'updateRole']);
    });

    // Роуты для лайков и избранного постов/блогов
    Route::post('/articles/{article}/toggle-like', [ArticleController::class, 'toggleLike']);
    Route::post('/articles/{article}/toggle-favorite', [ArticleController::class, 'toggleFavorite']);
    
    Route::post('/blogs/{blog}/toggle-like', [BlogController::class, 'toggleLike']);
    Route::post('/blogs/{blog}/toggle-favorite', [BlogController::class, 'toggleFavorite']);

    Route::post('/upload', [ImageUploadController::class, 'upload']);
    Route::post('/upload/delete', [ImageUploadController::class, 'destroy']);

    Route::put('/home-settings', [HomeSettingController::class, 'update']);
});