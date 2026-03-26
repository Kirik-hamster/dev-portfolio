<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;

class TagController extends Controller
{
    /**
     * Получить список самых популярных тегов для фильтра.
     */
    public function top()
    {
        return Tag::whereHas('articles.blog', function ($query) {
                $query->where('is_portfolio', false);
            })
            ->orderByDesc('usage_count')
            ->limit(15)
            ->pluck('name');
    }
}