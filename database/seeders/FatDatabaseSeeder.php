<?php
namespace Database\Seeders;

use App\Models\{User, Blog, Article, Comment, CommentLike, Tag};
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\{DB, Hash};

class FatDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Настройки объема данных
        $countUsers = 10;      
        $countBlogsPerUser = 10;      
        $countArticlesPerBlog = 100;  
        $countCommentsPerArticle = 100;
        // Отключаем логирование запросов, чтобы не забить RAM
        DB::connection()->disableQueryLog();

        // Подготовим теги заранее
        $fakeStack = ['React', 'Laravel', 'TypeScript', 'Docker', 'Vite', 'Tailwind', 'MySQL', 'Redis', 'Python', 'Go'];
        $tagIds = [];
        foreach ($fakeStack as $name) {
            $tagIds[$name] = Tag::firstOrCreate(['name' => $name])->id;
        }

        $this->command->info("Starting mega-seed: 1,000,000 comments incoming...");

        $users = User::factory($countUsers)->create([
            'email' => fn() => fake()->unique()->userName() . '@test.loc',
            'password' => Hash::make('password')
        ]);

        foreach ($users as $user) {
    
            // Блоги и статьи оставляем через create, их не так много
            $blogs = Blog::factory($countBlogsPerUser)->create(['user_id' => $user->id]);

           foreach ($blogs as $blog) {
                for ($a = 0; $a < $countArticlesPerBlog; $a++) {
                    // Создаем статью
                    $article = Article::factory()->create([
                        'blog_id' => $blog->id,
                        'user_id' => $user->id,
                        'tech_stack' => implode(', ', array_rand(array_flip($fakeStack), rand(2, 4)))
                    ]);

                    // ПРИВЯЗЫВАЕМ ТЕГИ (Pivot tables)
                    $currentTags = array_map('trim', explode(',', $article->tech_stack));
                    $currentTagIds = array_map(fn($name) => $tagIds[$name], $currentTags);
                    
                    $article->tags()->attach($currentTagIds);
                    $blog->tags()->syncWithoutDetaching($currentTagIds);

                    // ГЕНЕРИРУЕМ КОММЕНТАРИИ ПАЧКОЙ (Bulk)
                    $commentsBuffer = [];
                    $now = now();
                    for ($c = 0; $c < $countCommentsPerArticle; $c++) {
                        $commentsBuffer[] = [
                            'article_id' => $article->id,
                            'user_id' => $users->random()->id,
                            'content' => fake()->realText(100),
                            'created_at' => $now,
                            'updated_at' => $now,
                        ];
                    }
                    Comment::insert($commentsBuffer); // Вставляем 100 штук за один запрос

                    // ГЕНЕРИРУЕМ ЛАЙКИ (Для последних 100 комментов этой статьи)
                    $lastCommentIds = Comment::where('article_id', $article->id)
                        ->orderBy('id', 'desc')->limit($countCommentsPerArticle)->pluck('id');
                    
                    $likesBuffer = [];
                    foreach ($lastCommentIds as $id) {
                        $likers = $users->random(rand(0, 5));
                        foreach ($likers as $liker) {
                            $likesBuffer[] = ['comment_id' => $id, 'user_id' => $liker->id];
                        }
                    }
                    if (!empty($likesBuffer)) CommentLike::insert($likesBuffer);
                }
                // ОБНОВЛЯЕМ ТОП-5 ТЕГОВ БЛОГА (наша новая колонка)
                $blog->updateTopTags();
                $this->command->info("User: {$user->id} | Blog: {$blog->id} filled with 100 articles.");
            }
        }
    }
}