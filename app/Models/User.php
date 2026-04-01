<?php

namespace App\Models;

use App\Models\Article;
use App\Models\Blog;
use App\Models\Comment;
use App\Models\Report;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Traits\HasOtp;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens, HasOtp;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'verification_code',
        'verification_code_expires_at',
        'banned_until'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'verification_code',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'banned_until' => 'datetime',
        ];
    }

    public function blogs(): HasMany
    {
        return $this->hasMany(Blog::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function favoriteArticles() 
    {
        return $this->belongsToMany(Article::class, 'article_favorites');
    }

    public function favoriteBlogs() 
    {
        return $this->belongsToMany(Blog::class, 'blog_favorites');
    }

    public function articles(): HasMany
    {
        return $this->hasMany(Article::class);
    }

    public function receivedReports()
    {
        return $this->hasMany(Report::class, 'reported_id');
    }

    // Удобный метод для проверки, забанен ли юзер прямо сейчас
    public function isBanned(): bool
    {
        return $this->banned_until && $this->banned_until->isFuture();
    }
}
