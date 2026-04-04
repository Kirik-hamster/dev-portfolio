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
            'hours' => 'required|numeric|min:0',
            'reason' => 'required|string|max:500',
        ]);

        $hours = (float) $request->hours;
        $until = $hours <= 0 ? now()->setYear(2037) : now()->addMinutes(max(1, (int)round($hours * 60)));

        $user->update([
            'banned_until' => $until,
            'ban_reason' => $request->reason,
        ]);

        return response()->json([
            'message' => 'Пользователь заблокирован',
            'until' => $until->toDateTimeString(),
            'reason' => $request->reason,
        ]);
    }

    public function unban(User $user)
    {
        $user->update(['banned_until' => null]);
        return response()->json(['message' => 'Пользователь разблокирован']);
    }
}