<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{Article, User, Blog, Tag};
use Illuminate\Support\Facades\{Hash, DB};
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

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

        // 2. Блог-Портфолио
        $portfolioBlog = Blog::firstOrCreate(
            ['user_id' => $admin->id, 'is_portfolio' => true],
            [
                'title' => 'My Engineering Portfolio',
                'description' => 'Здесь собраны все мои технические проекты и кейсы.',
            ]
        );

        // 3. Проект: Геймдев
        $article1 = $portfolioBlog->articles()->create([
            'user_id' => $admin->id,
            'title' => 'Blast Game (Cocos Creator)',
            'content' => 'Динамичный пазл-шутер...',
            'slug' => 'blast-game-cocos',
            'tech_stack' => 'Cocos Creator, TypeScript, Box2D',
            'github_url' => 'https://github.com/Kirik-hamster/blast_game_by_kir'
        ]);
        $this->syncTags($article1, $portfolioBlog, 'Cocos Creator, TypeScript, Box2D');

        // 4. Проект: Веб
        $article2 = $portfolioBlog->articles()->create([
            'user_id' => $admin->id,
            'title' => 'Full Stack Portfolio Engine',
            'content' => 'Собственная платформа...',
            'slug' => 'dev-portfolio-engine',
            'tech_stack' => 'Laravel 12, React, Tailwind, Docker',
            'github_url' => 'https://github.com/Kirik-hamster/dev-portfolio'
        ]);
        $this->syncTags($article2, $portfolioBlog, 'Laravel 12, React, Tailwind, Docker');

        // ОБНОВЛЯЕМ ТОП-5 ТЕГОВ
        $portfolioBlog->updateTopTags();
    }

    // Метод ВНЕ run(), но ВНУТРИ класса
    private function syncTags($article, $blog, $techStack) {
        $tags = collect(explode(',', $techStack))->map(fn($t) => trim($t))->filter();
        foreach ($tags as $tagName) {
            $tag = Tag::firstOrCreate(['name' => $tagName]);
            $article->tags()->syncWithoutDetaching([$tag->id]);
            $blog->tags()->syncWithoutDetaching([$tag->id]);
            $tag->increment('usage_count');
        }
    }
}