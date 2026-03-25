<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo; 
use Illuminate\Database\Eloquent\Relations\HasMany;

class Article extends Model
{
    use HasFactory;

    protected $appends = ['is_liked', 'is_favorited'];

    // Это "белый список" полей, которые можно заполнять через Article::create
    protected $fillable = [
        'blog_id',    // ДОБАВИТЬ ОБЯЗАТЕЛЬНО
        'user_id', 
        'title', 
        'content', 
        'slug', 
        'tech_stack', 
        'github_url',
        'views_count',
        'image_url'
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

    public function tags() {
        return $this->belongsToMany(Tag::class);
    }

    public function likes() {
        return $this->belongsToMany(User::class, 'article_likes');
    }

    public function favorites() {
        return $this->belongsToMany(User::class, 'article_favorites');
    }

    // Виртуальные поля: возвращают true/false для текущего юзера
    public function getIsLikedAttribute() {
        if (!auth()->check()) return false;
        return $this->likes()->where('user_id', auth()->id())->exists();
    }

    public function getIsFavoritedAttribute() {
        if (!auth()->check()) return false;
        return $this->favorites()->where('user_id', auth()->id())->exists();
    }
}