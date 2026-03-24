<?php
namespace App\Http\Controllers;
use App\Models\Setting;
use App\Models\HomeSetting;
use Illuminate\Http\Request;

class HomeSettingController extends Controller
{
    public function show() {
        // 1. Берем твои био-данные (те, что заполнил Seeder)
        $bio = HomeSetting::first();

        // 2. Берем глобальные настройки (ссылки)
        $links = Setting::whereIn('key', ['email', 'githubUrl', 'resume_url'])->pluck('value', 'key');

        // 3. Отдаем всё вместе в одном JSON
        return response()->json([
            // Данные из HomeSetting
            'name' => $bio->name ?? 'Кирилл Мякотин',
            'specialization' => $bio->specialization ?? 'Fullstack разработчик',
            'about_text' => $bio->about_text ?? '',
            'photo_url' => $bio->photo_url ?? '',
            'stack_current' => $bio->stack_current ?? '',
            'stack_learning' => $bio->stack_learning ?? '',
            
            // Данные из Setting
            'email' => $links->get('email', 'kir.myak@bk.ru'),
            'githubUrl' => $links->get('githubUrl', 'https://github.com/Kirik-hamster'),
            'resumeUrl' => $links->get('resume_url', null),
        ]);
    }

    public function update(Request $request) {
        // ПРОВЕРКА РОЛИ
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $settings = HomeSetting::first();
        $settings->update($request->all());
        
        return $settings;
    }
}