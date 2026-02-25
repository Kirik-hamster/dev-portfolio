<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Notifications\VerifyEmailCode;
use App\Traits\HasOtp;

class PasswordUpdateController extends Controller
{
    public function requestCode(Request $request) 
    {
        $user = $request->user();
        
        // Используем чистую логику из Трейта HasOtp
        if (!$user->canResendOtp()) {
            return response()->json(['message' => 'Слишком много запросов. Подождите.'], 429);
        }

        $user->sendOtp();
        
        return response()->json(['message' => 'Код подтверждения отправлен']);
    }

    public function update(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        // Проверяем код через метод Трейта
        if (!$user->isValidOtp($request->code)) {
            return response()->json(['message' => 'Код неверный или истек'], 422);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);
        
        // Очищаем OTP после успеха
        $user->clearOtp();

        return response()->json(['message' => 'Пароль успешно обновлен!']);
    }
}