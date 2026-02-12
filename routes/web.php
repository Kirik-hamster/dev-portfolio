<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ArticleController;
use App\Models\Article;

// Отдача главной страницы React
Route::get('/', function () {
    return view('welcome');
});

// Группируем роуты под префикс /api для соответствия ТЗ
Route::prefix('api')->group(function () {
    // Список статей + Поиск (метод index уже умеет в ?search=)
    Route::get('/articles', [ArticleController::class, 'index']);
    
    // Одна статья с комментариями
    Route::get('/articles/{article}', [ArticleController::class, 'show']);
    
    // Создание, Обновление, Удаление
    Route::post('/articles', [ArticleController::class, 'store']);
    Route::put('/articles/{article}', [ArticleController::class, 'update']);
    Route::delete('/articles/{article}', [ArticleController::class, 'destroy']);
    
    // Добавление комментария (ТЗ: POST /api/articles/{id}/comments)
    Route::post('/articles/{article}/comments', [ArticleController::class, 'storeComment']);
});