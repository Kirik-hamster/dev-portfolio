<?php
namespace Database\Seeders;

use App\Models\{User, Blog, Article, Comment, CommentLike};
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FatDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Настройки объема данных
        $countUsers = 5;      
        $countBlogs = 2;      
        $countArticles = 10;  
        $countComments = 50;
        // Отключаем логирование запросов, чтобы не забить RAM
        DB::connection()->disableQueryLog();

        $users = User::factory($countUsers)->create([
            'email' => fn() => fake()->unique()->userName() . '@test.loc'
        ]);

        $this->command->info('Generating data with Bulk Inserts...');

        foreach ($users as $user) {
            // Блоги и статьи оставляем через create, их не так много
            $blogs = Blog::factory($countBlogs)->create(['user_id' => $user->id]);

            foreach ($blogs as $blog) {
                $articles = Article::factory($countArticles)->create([
                    'blog_id' => $blog->id,
                    'user_id' => $user->id
                ]);

                foreach ($articles as $article) {
                    $commentData = [];
                    $now = now();

                    // Вместо вызова фабрики в цикле, готовим массив данных
                    for ($i = 0; $i < $countComments; $i++) {
                        $commentData[] = [
                            'article_id' => $article->id,
                            'user_id' => $users->random()->id,
                            'content' => fake()->realText(150),
                            'created_at' => $now,
                            'updated_at' => $now,
                        ];
                    }


                    Comment::insert($commentData);

                    // Генерируем лайки пачками (тоже Bulk Insert)
                    // Берем ID последних вставленных комментов
                    $lastCommentIds = Comment::where('article_id', $article->id)
                        ->orderBy('id', 'desc')
                        ->limit(100)
                        ->pluck('id');

                    $likesData = [];
                    foreach ($lastCommentIds as $commentId) {
                        $likers = $users->random(rand(0, 5)); // 0-5 лайков на коммент
                        foreach ($likers as $liker) {
                            $likesData[] = [
                                'comment_id' => $commentId,
                                'user_id' => $liker->id
                            ];
                        }
                    }
                    
                    if (!empty($likesData)) {
                        CommentLike::insert($likesData);
                    }
                }
                // Выводим микро-отчет для понимания прогресса
                $this->command->info("Blog: {$blog->title} ... Done");
            }
            $this->command->info("User {$user->name} fully seeded.");
        }
    }
}