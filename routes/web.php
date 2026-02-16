<?php
use Illuminate\Support\Facades\Route;

// Роуты авторизации теперь будут доступны по /api/login, /api/register и т.д.
Route::prefix('api')->group(function () {
    require __DIR__.'/auth.php';
});

// Этот роут всегда должен быть ПОСЛЕДНИМ
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '.*');