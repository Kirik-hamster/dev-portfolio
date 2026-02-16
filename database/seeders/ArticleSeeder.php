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
        // 1. Создаем или находим Админа (тебя)
        $admin = User::firstOrCreate(
            ['email' => 'kir.myak@bk.ru'],
            [
                'name' => 'Kirik-hamster',
                'password' => Hash::make('qwerty12345678'),
                'role' => 'admin',
                'email_verified_at' => Carbon::now(),
            ]
        );

        // 2. Проект: Геймдев
        Article::create([
            'user_id' => $admin->id, // Привязываем к админу
            'title' => 'Blast Game (Cocos Creator)',
            'content' => 'Динамичный пазл-шутер с использованием TypeScript...',
            'slug' => 'blast-game-cocos',
            'type' => 'portfolio',
            'tech_stack' => 'Cocos Creator, TypeScript, Box2D',
            'github_url' => 'https://github.com/Kirik-hamster/blast_game_by_kir'
        ]);

        // 3. Проект: Веб
        Article::create([
            'user_id' => $admin->id,
            'title' => 'Full Stack Portfolio Engine',
            'content' => 'Собственная платформа на стеке Laravel + React...',
            'slug' => 'dev-portfolio-engine',
            'type' => 'portfolio',
            'tech_stack' => 'Laravel 12, React, Tailwind, Docker',
            'github_url' => 'https://github.com/Kirik-hamster/dev-portfolio'
        ]);
    }
}