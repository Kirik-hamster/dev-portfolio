<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ArticleController;
use App\Models\Article;

// Отдача главной страницы React
Route::get('/', function () {
    return view('welcome');
});
