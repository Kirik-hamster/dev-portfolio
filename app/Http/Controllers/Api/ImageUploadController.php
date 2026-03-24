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
        Storage::disk('s3')->put($path, (string) $img);

        // ОТВЕТ
        return response()->json([
            'url' => Storage::disk('s3')->url($path),
            'message' => 'Image processed and uploaded'
        ]);
    }
    public function destroy(Request $request)
    {
        $request->validate(['url' => 'required|string']);
        $path = parse_url($request->url, PHP_URL_PATH);
        $bucketName = config('filesystems.disks.s3.bucket');
        $cleanPath = ltrim($path, '/');
        $cleanPath = str_replace($bucketName . '/', '', $cleanPath);
        \Log::info("S3 DELETE ATTEMPT", [
            'original_url' => $request->url,
            'calculated_path' => $cleanPath,
            'exists' => Storage::disk('s3')->exists($cleanPath)
        ]);

        if (Storage::disk('s3')->exists($cleanPath)) {
            Storage::disk('s3')->delete($cleanPath);
            return response()->json(['message' => 'Deleted']);
        }

        return response()->json(['message' => 'Not found'], 404);
    }
}