<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Article;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Carbon;

class ArticleSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Админ
        $admin = User::firstOrCreate(
            ['email' => 'kir.myak@bk.ru'],
            [
                'name' => 'Kirik-hamster',
                'password' => Hash::make('qwerty12345678'),
                'role' => 'admin',
                'email_verified_at' => Carbon::now(),
            ]
        );

        // 2. Создаем твой Блог-Портфолио (Папка для проектов)
        $portfolioBlog = \App\Models\Blog::firstOrCreate(
            ['user_id' => $admin->id, 'is_portfolio' => true],
            [
                'title' => 'My Engineering Portfolio',
                'description' => 'Здесь собраны все мои технические проекты и кейсы.',
            ]
        );

        // 3. Проект: Геймдев (Кладем в созданный блог)
        $portfolioBlog->articles()->create([
            'user_id' => $admin->id,
            'title' => 'Blast Game (Cocos Creator)',
            'content' => 'Динамичный пазл-шутер...',
            'slug' => 'blast-game-cocos',
            'tech_stack' => 'Cocos Creator, TypeScript, Box2D',
            'github_url' => 'https://github.com/Kirik-hamster/blast_game_by_kir'
        ]);

        // 4. Проект: Веб
        $portfolioBlog->articles()->create([
            'user_id' => $admin->id,
            'title' => 'Full Stack Portfolio Engine',
            'content' => 'Собственная платформа на стеке Laravel + React...',
            'slug' => 'dev-portfolio-engine',
            'tech_stack' => 'Laravel 12, React, Tailwind, Docker',
            'github_url' => 'https://github.com/Kirik-hamster/dev-portfolio'
        ]);
    }
}