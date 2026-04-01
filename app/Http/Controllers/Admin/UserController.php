<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');

        // Ищем по имени или почте, пагинируем по 10 человек
        $users = User::when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($users);
    }

    public function updateRole(Request $request, User $user)
    {
        // Только админ может менять роли другим
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'role' => 'required|string|max:50'
        ]);

        $user->update(['role' => $request->role]);

        return response()->json(['message' => 'Role updated', 'user' => $user]);
    }

    // --- НОВЫЕ МЕТОДЫ МОДЕРАЦИИ ---

    public function ban(Request $request, User $user)
    {
        // 1. numeric вместо integer — разрешаем 0.05
        $request->validate([
            'hours' => 'required|numeric|min:0'
        ]);

        $hours = (float) $request->hours;

        if ($hours <= 0) {
            // Ставим 2037 год (максимум для TIMESTAMP в MySQL)
            $until = now()->setYear(2037);
        } else {
            // Считаем минуты. 0.05 часа * 60 = 3 минуты.
            // Используем round, чтобы не было дробных минут
            $minutes = max(1, (int)round($hours * 60));
            $until = now()->addMinutes($minutes);
        }

        $user->update(['banned_until' => $until]);

        return response()->json([
            'message' => 'Пользователь заблокирован',
            'until' => $until->toDateTimeString()
        ]);
    }

    public function unban(User $user)
    {
        $user->update(['banned_until' => null]);
        return response()->json(['message' => 'Пользователь разблокирован']);
    }
}