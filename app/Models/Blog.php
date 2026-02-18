<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Blog extends Model
{
    // Поля, которые можно заполнять массово (как в твоем сидере)
    protected $fillable = ['user_id', 'title', 'description', 'is_portfolio'];

    // Связь: Блог принадлежит пользователю
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Связь: В блоге может быть много статей
    public function articles(): HasMany
    {
        return $this->hasMany(Article::class);
    }
}