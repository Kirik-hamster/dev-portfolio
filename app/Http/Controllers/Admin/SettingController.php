<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;

class SettingController extends Controller
{
    public function updateMail(Request $request)
    {
        $data = $request->validate([
            'mail_host' => 'required',
            'mail_port' => 'required',
            'mail_username' => 'required',
            'mail_password' => 'required',
            'mail_from_name' => 'required|string'
        ]);

        foreach ($data as $key => $value) {
            // Если это пароль — шифруем его перед сохранением
            $finalValue = ($key === 'mail_password') ? Crypt::encryptString($value) : $value;
            
            Setting::updateOrCreate(['key' => $key], ['value' => $finalValue]);
        }

        // Очищаем кэш, чтобы настройки сразу подтянулись
        Cache::forget('site_settings');

        return response()->json(['message' => 'Настройки SMTP сохранены и зашифрованы!']);
    }

    public function testMail(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        try {
            Mail::raw('Ваш сайт успешно настроил SMTP! Это тестовое сообщение.', function ($message) use ($request) {
                $message->to($request->email)->subject('Тест SMTP настроек');
            });

            return response()->json(['message' => 'Тестовое письмо отправлено!']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getMail()
    {
        $settings = Setting::whereIn('key', [
            'mail_host', 'mail_port', 'mail_username', 'mail_from_address', 'mail_from_name'
        ])->pluck('value', 'key');

        // Проверяем, есть ли пароль, но не отдаем его значение
        $hasPassword = Setting::where('key', 'mail_password')->exists();
        $settings['mail_password'] = '';

        return response()->json($settings);
    }
}