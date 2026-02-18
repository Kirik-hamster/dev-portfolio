<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BlogController extends Controller
{
    public function index(Request $request) 
    {
        $query = Blog::query()->with('user')->withCount('articles');

        // Для профиля (свои)
        if ($request->has('my_only')) {
            return $query->where('user_id', Auth::id())->latest()->get();
        }

        // Для Сообщества (все чужие + свои, НО БЕЗ системного портфолио)
        return $query->where('is_portfolio', false)->latest()->get();
    }

    public function update(Request $request, Blog $blog)
    {
        // Проверка: может ли этот юзер менять этот блог?
        if ($blog->user_id !== Auth::id()) return response()->json(['message' => 'Forbidden'], 403);

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $blog->update($data);
        return $blog;
    }

    public function destroy(Blog $blog)
    {
        if ($blog->user_id !== Auth::id()) return response()->json(['message' => 'Forbidden'], 403);
        
        // 1. Сначала удаляем все статьи, принадлежащие этому блогу
        $blog->articles()->delete(); 
        
        // 2. Теперь удаляем саму папку
        $blog->delete();
        
        return response()->json(['message' => 'Deleted']);
    }

    public function store(Request $request) {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $data['user_id'] = Auth::id();
        $data['is_portfolio'] = false; // Обычные блоги пользователей

        return Blog::create($data);
    }
}