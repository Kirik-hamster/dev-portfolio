<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    // Это "белый список" полей, которые можно заполнять через Article::create
    protected $fillable = 
    [
        'title', 
        'content', 
        'slug', 
        'type', 
        'user_id', 
        'is_main', 
        'tech_stack', 
        'github_url'
    ];

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}