<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Notifications\VerifyEmailCode;

class VerifyCodeController extends Controller
{
    public function __invoke(Request $request)
    {
        $request->validate(['code' => 'required|string|size:6']);
        $user = $request->user();

        if ($user->isValidOtp($request->code)) {
            $user->markEmailAsVerified();
            $user->clearOtp(); // Используем метод трейта
            return response()->json(['message' => 'Почта подтверждена!']);
        }

        return response()->json(['message' => 'Код неверен или истек'], 422);
    }

    public function resend(Request $request)
    {
        $user = $request->user();
        
        if (!$user->canResendOtp()) {
            return response()->json(['message' => 'Подождите минуту.'], 429);
        }

        $user->sendOtp(); // Используем метод трейта
        
        return response()->json(['message' => 'Новый код отправлен!']);
    }

    public function destroy(Request $request)
    {
        $user = $request->user();

        // 🛡 ЗАЩИТА 1: Если почта уже подтверждена — удалять нельзя!
        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Этот аккаунт уже подтвержден. Используйте стандартный вход.'
            ], 403);
        }

        // 🛡 ЗАЩИТА 2: Если аккаунт создан более 24 часов назад — удалять нельзя!
        // Это гарантирует, что мы удаляем только "свежих" пользователей, которые ошиблись при регистрации.
        if ($user->created_at->diffInHours(now()) > 24) {
            return response()->json([
                'message' => 'Время для автоматической отмены регистрации истекло.'
            ], 403);
        }

        // Если все проверки пройдены — удаляем
        $user->delete();

        // Очищаем сессию (выходим из системы)
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Данные регистрации очищены. Вы можете создать новый аккаунт.']);
    }
}