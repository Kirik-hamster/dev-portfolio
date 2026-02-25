<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model {
    protected $fillable = [
        'article_id', 
        'user_id', 
        'content', 
        'parent_id', 
        'is_edited', 
        'edited_at'
    ];

    // Кто написал?
    public function user() {
        return $this->belongsTo(User::class);
    }

    // Связь для получения ответов на этот комментарий
    public function replies() {
        return $this->hasMany(Comment::class, 'parent_id')
            ->with(['user:id,name,role', 'replies'])
            ->withCount('likes');
    }

    // Связь для получения родительского комментария
    public function parent() {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    // Кто лайкнул?
    public function likes() {
        return $this->hasMany(CommentLike::class);
    }

    // Связь со статьей (чтобы знать, под каким постом комент)
    public function article()
    {
        return $this->belongsTo(Article::class);
    }
}