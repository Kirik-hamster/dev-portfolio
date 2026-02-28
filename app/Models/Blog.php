<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Blog extends Model
{
    use HasFactory;
    // Поля, которые можно заполнять массово (как в твоем сидере)
    protected $fillable = ['user_id', 'title', 'description', 'is_portfolio', 'top_tags'];

    protected $casts = [
        'top_tags' => 'array', // Авто-превращение JSON из базы в массив для фронта
    ];

    public function tags() {
        return $this->belongsToMany(Tag::class, 'blog_tag');
    }

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

    public function updateTopTags()
    {
        $tags = \DB::table('article_tag')
            ->join('articles', 'article_tag.article_id', '=', 'articles.id')
            ->join('tags', 'article_tag.tag_id', '=', 'tags.id')
            ->where('articles.blog_id', $this->id)
            ->select('tags.name', \DB::raw('count(*) as total'))
            ->groupBy('tags.id', 'tags.name')
            ->orderByDesc('total')
            ->limit(5)
            ->pluck('name');

        $this->update(['top_tags' => $tags]);
    }
}