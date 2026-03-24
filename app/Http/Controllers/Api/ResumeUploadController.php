<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;

class ResumeUploadController extends Controller
{
    /**
     * Загрузка резюме в S3 и обновление ссылки в настройках.
     */
    public function upload(Request $request)
    {
        // 1. ПРОВЕРКА ДОСТУПА (Резюме может менять ТОЛЬКО админ)
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'У вас нет прав для редактирования резюме'], 403);
        }

        // 2. ВАЛИДАЦИЯ (Только PDF, до 5МБ)
        $request->validate([
            'resume' => 'required|file|mimes:pdf|max:5120',
        ]);

        try {
            $file = $request->file('resume');
            
            // 3. ПУТЬ В S3
            // Сохраняем с фиксированным именем, чтобы ссылка была стабильной
            $path = 'documents/resume_kirill_myakotin.pdf';

            // 4. ЗАГРУЗКА
            // Используем put, чтобы перезаписать существующий файл
            Storage::disk('s3')->put($path, file_get_contents($file));

            // 5. ПОЛУЧЕНИЕ ПУБЛИЧНОГО URL
            $url = Storage::disk('s3')->url($path);

            // 6. СОХРАНЕНИЕ В ТАБЛИЦУ НАСТРОЕК
            Setting::updateOrCreate(
                ['key' => 'resume_url'],
                ['value' => $url]
            );

            // 7. ОЧИСТКА КЭША
            Cache::forget('site_settings');

            return response()->json([
                'url' => $url,
                'message' => 'Резюме успешно загружено в облако и обновлено'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ошибка при загрузке: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Удаление резюме из S3 и очистка ссылки.
     */
    public function destroy(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $setting = Setting::where('key', 'resume_url')->first();
        
        if ($setting) {
            // Извлекаем путь из URL для удаления из S3
            $path = 'documents/resume_kirill_myakotin.pdf';
            
            if (Storage::disk('s3')->exists($path)) {
                Storage::disk('s3')->delete($path);
            }

            $setting->delete();
            Cache::forget('site_settings');
        }

        return response()->json(['message' => 'Резюме удалено']);
    }
}