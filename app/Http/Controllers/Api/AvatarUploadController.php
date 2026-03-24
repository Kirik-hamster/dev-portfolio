<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HomeSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;
use Illuminate\Support\Str;

class AvatarUploadController extends Controller
{
    public function upload(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        try {
            $disk = config('filesystems.uploads');
            $file = $request->file('image');
            
            // Читаем, принудительно делаем квадрат 400x400 и в WebP
            $img = Image::read($file)
                ->cover(400, 400) // Умное кадрирование в центр, если что-то пошло не так
                ->toWebp(90);

            $fileName = 'avatar_admin_' . Str::random(8) . '.webp';
            $path = "home/avatar/{$fileName}";

            // Удаляем старый аватар, если он есть
            $oldSetting = HomeSetting::first();
            if ($oldSetting && $oldSetting->photo_url) {
                $oldPath = str_replace(Storage::disk($disk)->url(''), '', $oldSetting->photo_url);
                Storage::disk($disk)->delete(ltrim($oldPath, '/'));
            }

            // Сохраняем новый
            Storage::disk($disk)->put($path, (string) $img);
            $url = Storage::disk($disk)->url($path);

            // Сразу обновляем в таблице HomeSetting
            if ($oldSetting) {
                $oldSetting->update(['photo_url' => $url]);
            }

            return response()->json([
                'url' => $url,
                'message' => 'Avatar updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}