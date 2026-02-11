<?php

use Illuminate\Support\Facades\Route;
use App\Models\Article;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/get-projects', function () {
    return Article::all();
});