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
}