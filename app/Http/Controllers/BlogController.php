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