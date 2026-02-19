<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommentLike extends Model
{
    // Отключаем таймстампы, если в миграции их нет
    public $timestamps = false;
    
    protected $fillable = ['comment_id', 'user_id'];
}