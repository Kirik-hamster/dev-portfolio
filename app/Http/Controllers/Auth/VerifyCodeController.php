<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Notifications\VerifyEmailCode;

class VerifyCodeController extends Controller
{
    public function __invoke(Request $request)
    {
        $request->validate(['code' => 'required|string|size:6']);

        $user = $request->user();

        if (!$user->verification_code || 
            !$user->verification_code_expires_at || 
            now()->isAfter($user->verification_code_expires_at)) {
            
            // Очищаем протухший код
            $user->update(['verification_code' => null, 'verification_code_expires_at' => null]);
            return response()->json(['message' => 'Код истек, запросите новый'], 422);
        }

        if ($request->code === $user->verification_code) {
            $user->markEmailAsVerified(); // Стандартный метод Laravel
            $user->update(['verification_code' => null]); // Удаляем код
            
            return response()->json(['message' => 'Почта подтверждена!']);
        }

        return response()->json(['message' => 'Неверный код'], 422);
    }

    public function resend(Request $request)
    {
        $user = $request->user();
        if ($user->verification_code_expires_at && 
            now()->diffInSeconds($user->verification_code_expires_at) > 40) {
            return response()->json([
                'message' => 'Пожалуйста, подождите минуту перед повторной отправкой.'
            ], 429);
        }
        $code = rand(100000, 999999);
        $user->update([
            'verification_code' => $code,
            'verification_code_expires_at' => now()->addSeconds(60)
        ]);
        $user->notify(new VerifyEmailCode($code));
        
        return response()->json(['message' => 'Новый код отправлен!']);
    }
}