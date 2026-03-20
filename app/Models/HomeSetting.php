<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomeSetting extends Model
{
    // Разрешаем записывать эти поля в базу
    protected $fillable = [
        'name', 
        'specialization', 
        'about_text', 
        'photo_url', 
        'stack_current', 
        'stack_learning'
    ];
}