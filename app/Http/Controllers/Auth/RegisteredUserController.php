<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use App\Notifications\VerifyEmailCode;

class RegisteredUserController extends Controller
{
    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): Response
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user) {
            // Если юзер уже верифицирован — тогда ОШИБКА "занято"
            if ($user->hasVerifiedEmail()) {
                return response()->json(['errors' => ['email' => ['Этот email уже занят.']]], 422);
            }

            // Если НЕ верифицирован — просто обновляем его данные
            $code = rand(100000, 999999);
            $user->update([
                'name' => $request->name,
                'password' => Hash::make($request->password),
                'verification_code' => $code,
            ]);
        } else {
            // Если юзера нет совсем — создаем
            $code = rand(100000, 999999);
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'verification_code' => $code,
            ]);
        }

        // Отправляем наше новое уведомление с кодом
        $user->notify(new VerifyEmailCode($code));

        Auth::login($user);

        return response()->noContent();
    }
}
