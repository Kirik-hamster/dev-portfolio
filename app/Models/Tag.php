<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Tag extends Model
{
    protected $fillable = ['name', 'slug', 'usage_count'];

    // Автоматически создаем slug из имени при создании тега
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($tag) {
            $tag->slug = Str::slug($tag->name);
        });
    }

    public function articles()
    {
        return $this->belongsToMany(Article::class);
    }

    public function blogs()
    {
        return $this->belongsToMany(Blog::class, 'blog_tag');
    }
}