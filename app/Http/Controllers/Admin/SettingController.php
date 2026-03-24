<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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

        // 1. Достаем все настройки из базы в виде массива [ключ => значение]
        $settings = Setting::all()->pluck('value', 'key');

        // 2. Если настроек нет — ругаемся
        if (!$settings->has('mail_host')) {
            return response()->json(['error' => 'Настройки SMTP не найдены в базе данных'], 422);
        }

        try {
            // 3. САМОЕ ВАЖНОЕ: Перезаписываем конфиг в реальном времени (Runtime Config)
            config([
                'mail.mailers.smtp.host' => $settings->get('mail_host'),
                'mail.mailers.smtp.port' => $settings->get('mail_port'),
                'mail.mailers.smtp.username' => $settings->get('mail_username'),
                // Расшифровываем пароль, так как в базе он лежит зашифрованным
                'mail.mailers.smtp.password' => Crypt::decryptString($settings->get('mail_password')),
                'mail.mailers.smtp.encryption' => $settings->get('mail_encryption', 'ssl'), 
                'mail.from.address' => $settings->get('mail_username'),
                'mail.from.name' => $settings->get('mail_from_name'),
                'mail.default' => 'smtp',
            ]);

            // 4. Отправляем письмо
            Mail::raw('Ваш сайт успешно настроил SMTP! Это тестовое сообщение.', function ($message) use ($request, $settings) {
                $message->to($request->email)
                        ->subject('🚀 Тест SMTP настроек');
            });

            return response()->json(['message' => 'Тестовое письмо успешно отправлено!']);
            
        } catch (\Exception $e) {
            // Если пароль неверный или хост недоступен — мы получим ошибку здесь
            return response()->json(['error' => 'Ошибка отправки: ' . $e->getMessage()], 500);
        }
    }

    public function getMail()
    {
        $settings = Setting::whereIn('key', [
            'mail_host', 'mail_port', 'mail_username', 'mail_from_name', 'resume_url'
        ])->pluck('value', 'key');

        return response()->json([
            'mail_host' => $settings->get('mail_host', ''),
            'mail_port' => $settings->get('mail_port', ''),
            'mail_username' => $settings->get('mail_username', ''),
            'mail_from_name' => $settings->get('mail_from_name', ''),
            'mail_password' => '',
            'resumeUrl' => $settings->get('resume_url', null), // ⚡️ Добавили выдачу ссылки в админку
        ]);
    }

    public function uploadResume(Request $request)
    {
        $request->validate([
            'resume' => 'required|file|mimes:pdf|max:5120',
        ]);

        $file = $request->file('resume');
        $path = 'documents/resume_kirill.pdf';

        try {
            // Проверь, что диск 's3' прописан в config/filesystems.php
            Storage::disk('s3')->put($path, file_get_contents($file));
            $url = Storage::disk('s3')->url($path);

            Setting::updateOrCreate(['key' => 'resume_url'], ['value' => $url]);
            Cache::forget('site_settings');

            return response()->json(['url' => $url, 'message' => 'OK']);
        } catch (\Exception $e) {
            // Это поможет тебе увидеть реальную ошибку в Telescope вместо общей 500
            \Log::error("RESUME UPLOAD ERROR: " . $e->getMessage());
            return response()->json(['message' => $e->getMessage()], 500);
        }
}

    public function deleteResume()
    {
        $path = 'documents/resume_kirill.pdf';
        if (Storage::disk('s3')->exists($path)) {
            Storage::disk('s3')->delete($path);
        }
        Setting::where('key', 'resume_url')->delete();
        \Illuminate\Support\Facades\Cache::forget('site_settings');
        
        return response()->json(['message' => 'Удалено']);
    }
}