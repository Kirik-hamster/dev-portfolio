<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PageView extends Model
{
    protected $fillable = [
        'user_id', 
        'page_path', 
        'ip_address', 
        'is_guest', 
        'viewed_at', 
        'views_count'
    ];

    protected $casts = [
        'viewed_at' => 'date',
        'is_guest' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}