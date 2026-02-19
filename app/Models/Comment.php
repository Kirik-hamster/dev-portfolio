<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model {
    protected $fillable = ['article_id', 'user_id', 'content'];

    // Кто написал?
    public function user() {
        return $this->belongsTo(User::class);
    }

    // Кто лайкнул?
    public function likes() {
        return $this->hasMany(CommentLike::class);
    }
}