<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image; // Интерфейс Intervention v3
use Illuminate\Support\Str;

class ImageUploadController extends Controller
{
    public function upload(Request $request)
    {
        // ПРОВЕРКА ДОСТУПА
        if ($request->user()->role !== 'admin' && !str_contains($request->user()->role, '-img')) {
            return response()->json(['message' => 'У вас нет прав для загрузки медиа'], 403);
        }

        // ВАЛИДАЦИЯ
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:10240', // до 10МБ
        ]);

        $disk = config('filesystems.uploads');

        $file = $request->file('image');
        
        // ОБРАБОТКА (Уменьшение и конвертация в WebP)
        // Мы читаем файл, меняем размер (макс ширина 1200px) и кодируем в webp
        $img = Image::read($file)
            ->scale(width: 1200) // Сохраняет пропорции
            ->toWebp(80);        // Качество 80%

        // ГЕНЕРАЦИЯ ПУТИ
        $fileName = Str::random(32) . '.webp';
        $path = "blog/content/{$fileName}";

        // ЗАГРУЗКА В S3 (Яндекс)
        Storage::disk($disk)->put($path, (string) $img);

        // ОТВЕТ
        return response()->json([
            'url' => Storage::disk($disk)->url($path),
            'message' => 'Image processed and uploaded'
        ]);
    }
    public function destroy(Request $request)
    {
        if ($request->user()->role !== 'admin' && !str_contains($request->user()->role, '-img')) {
            return response()->json(['message' => 'У вас нет прав для удаления медиа'], 403);
        }

        $request->validate(['url' => 'required|string']);

        $disk = config('filesystems.uploads');
        $url = $request->url;

        $baseUrl = Storage::disk($disk)->url('/');
        $cleanPath = str_replace($baseUrl, '', $url);
        $cleanPath = ltrim($cleanPath, '/');

        \Log::info("MEDIA DELETE ATTEMPT", [
            'disk' => $disk,
            'original_url' => $url,
            'calculated_path' => $cleanPath,
            'exists' => Storage::disk($disk)->exists($cleanPath)
        ]);

        if (Storage::disk($disk)->exists($cleanPath)) {
            Storage::disk($disk)->delete($cleanPath);
            return response()->json(['message' => 'Файл успешно удален']);
        }

        return response()->json(['message' => 'Файл не найден на диске ' . $disk], 404);
    }
}