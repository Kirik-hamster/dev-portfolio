<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo; 
use Illuminate\Database\Eloquent\Relations\HasMany;

class Article extends Model
{
    use HasFactory;
    // Это "белый список" полей, которые можно заполнять через Article::create
    protected $fillable = [
        'blog_id',    // ДОБАВИТЬ ОБЯЗАТЕЛЬНО
        'user_id', 
        'title', 
        'content', 
        'slug', 
        'tech_stack', 
        'github_url'
    ];


    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function blog(): BelongsTo
    {
        return $this->belongsTo(Blog::class);
    }
}