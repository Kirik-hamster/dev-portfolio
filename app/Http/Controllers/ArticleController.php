<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    // Поиск + Список
    public function index(Request $request) {
        $query = $request->input('search');
        return Article::withCount('comments') // <--- Добавляет поле comments_count
            ->when($query, function($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                ->orWhere('content', 'like', "%{$query}%");
            })
            ->latest()
            ->get();
    }

    // Получение одной статьи с комментариями
    public function show(Article $article) {
        return $article->load('comments');
    }

    // Сохранение комментария
    public function storeComment(Request $request, Article $article) {
        $data = $request->validate([
            'author_name' => 'required|string|max:255',
            'content' => 'required|string',
        ]);
        return $article->comments()->create($data);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:blog,portfolio',
            'tech_stack' => 'nullable|string',
            'slug' => 'required|string|unique:articles,slug',
        ]);

        return Article::create($data);
    }

    public function update(Request $request, Article $article)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:blog,portfolio',
            'tech_stack' => 'nullable|string',
            'slug' => 'required|string|unique:articles,slug,' . $article->id,
        ]);

        $article->update($data);
        return $article;
    }

    public function destroy(Article $article) {
        $article->delete();
        return response()->json(['message' => 'Deleted']);
    }
}