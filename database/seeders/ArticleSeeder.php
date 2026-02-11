<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Article; // Импортируем модель, которую создали раньше

class ArticleSeeder extends Seeder
{
    public function run(): void
    {
        // Проект 1: Геймдев
        Article::create([
            'title' => 'Blast Game (Cocos Creator)',
            'content' => 'Динамичный пазл-шутер с использованием TypeScript. Реализована сложная физика объектов и система комбо.',
            'slug' => 'blast-game-cocos',
            'type' => 'portfolio',
            'tech_stack' => 'Cocos Creator, TypeScript, Box2D',
            'github_url' => 'https://github.com/Kirik-hamster/blast_game_by_kir'
        ]);

        // Проект 2: Веб
        Article::create([
            'title' => 'Full Stack Portfolio Engine',
            'content' => 'Собственная платформа для разработчиков на стеке Laravel + React. Поддержка Docker (Sail) и нативная работа в WSL2.',
            'slug' => 'dev-portfolio-engine',
            'type' => 'portfolio',
            'tech_stack' => 'Laravel 12, React, Tailwind, Docker',
            'github_url' => 'https://github.com/Kirik-hamster/dev-portfolio'
        ]);

        // Статья в блог
        Article::create([
            'title' => 'Почему я перешел на WSL2 для PHP разработки',
            'content' => 'Разбор преимуществ нативной файловой системы Linux по сравнению с монтированием диска C в Docker.',
            'slug' => 'wsl2-vs-windows-docker',
            'type' => 'blog',
            'tech_stack' => 'WSL2, Ubuntu, Devops',
            'github_url' => null
        ]);
    }
}