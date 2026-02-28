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
        return Tag::orderByDesc('usage_count')
            ->limit(5)
            ->pluck('name');
    }
}