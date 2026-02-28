<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Services\ArticleService;
use App\Http\Requests\ArticleStoreRequest;
use App\Http\Requests\StoreCommentRequest; // Импортируем новый класс
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Blog;

/**
 * Контроллер для обработки HTTP-запросов, связанных со статьями.
 * Отвечает за прием запросов и возврат ответов, делегируя бизнес-логику сервисам.
 */
class ArticleController extends Controller
{
    // Внедряем сервис через конструктор (Dependency Injection)
    public function __construct(
        protected ArticleService $service
    ) {}

    public function index(Request $request, Blog $blog)
    {
        $search = $request->query('search');

        // Берем статьи ТОЛЬКО этой конкретной папки ($blog)
        return $blog->articles()
            ->when($search, function($query) use ($search) {
                $query->where('title', 'like', "%{$search}%");
            })
            ->with(['blog', 'user'])
            ->latest()
            ->paginate(12);
    }

    public function portfolio()
    {
        // Ищем системную папку портфолио
        $portfolioBlog = Blog::where('is_portfolio', true)->first();
        
        // Если папки нет, возвращаем пустую структуру пагинации
        if (!$portfolioBlog) {
            return response()->json([
                'data' => [],
                'last_page' => 1,
                'current_page' => 1,
                'total' => 0
            ], 200);
        }

        // ВАЖНО: Вместо get() пишем paginate(12)
        return $portfolioBlog->articles()
            ->with(['blog', 'user'])
            ->latest()
            ->paginate(12); 
    }

    public function show(Article $article)
    {
        // Загружаем статью с отфильтрованными комментариями
        $article->load(['user', 'comments' => function($query) {
            $query->whereNull('parent_id') 
                ->withCount('likes')
                ->with(['user:id,name,role', 'replies' => function($q) {
                    $q->withCount('likes')->orderBy('likes_count', 'desc')->orderBy('created_at', 'desc');
                }])
                ->orderBy('likes_count', 'desc')
                ->orderBy('created_at', 'desc');
        }]);

        return response()->json($article);
}

    public function store(ArticleStoreRequest $request, $blogId)
    {
        // Если ID нет или он кривой — сервер должен выдать ошибку, а не молча слать в портфолио!
        $blog = Blog::findOrFail($blogId); 

        $data = $request->validated();
        $data['blog_id'] = $blog->id;
        $data['user_id'] = Auth::id();

        $article = $this->service->createArticle($data);

        if ($request->filled('tech_stack')) {
            $tagNames = collect(explode(',', $request->tech_stack))->map(fn($t) => trim($t))->filter();
            foreach ($tagNames as $name) {
                $tag = \App\Models\Tag::firstOrCreate(['name' => $name]);
                $article->tags()->attach($tag->id);
                $blog->tags()->syncWithoutDetaching([$tag->id]);
                $tag->increment('usage_count');
            }
            $blog->updateTopTags();
        }

        return $article;
    }

    public function update(ArticleStoreRequest $request, Article $article)
    {
        // 1. Обновляем саму статью через сервис
        $updatedArticle = $this->service->updateArticle($article, $request->validated());

        // 2. Синхронизируем теги, если пришел tech_stack
        if ($request->filled('tech_stack')) {
            $tagNames = collect(explode(',', $request->tech_stack))
                ->map(fn($t) => trim($t))
                ->filter();

            $tagIds = [];
            foreach ($tagNames as $name) {
                $tag = \App\Models\Tag::firstOrCreate(['name' => $name]);
                $tagIds[] = $tag->id;
                
                // Если тег новый или мы хотим обновить счетчик
                if ($tag->wasRecentlyCreated) {
                    $tag->increment('usage_count');
                }
            }

            // Мгновенно обновляем связи (старые удалятся, новые добавятся)
            $article->tags()->sync($tagIds);
            $article->blog->tags()->syncWithoutDetaching($tagIds);

            // ПЕРЕСЧИТЫВАЕМ ТОП-5 БЛОГА (чтобы "React" исчез, а "ЖОПА" появилась)
            $article->blog->updateTopTags();
        }

        return $updatedArticle;
    }

    public function community(Request $request) // Добавили Request
    {
        $query = Article::whereHas('blog', function($query) {
            $query->where('is_portfolio', false);
        });

        // ФИЛЬТР: Ищем статьи по тегу через article_tag
        if ($request->filled('tag')) {
            $query->whereHas('tags', function($q) use ($request) {
                $q->where('name', $request->tag);
            });
        }

        return $query->with(['blog', 'user'])
            ->latest()
            ->paginate(12);
    }

    // Используем наш новый Form Request для валидации
    public function storeComment(StoreCommentRequest $request, Article $article)
    {
        return $this->service->addComment($article, $request->validated());
    }

    // Делегируем удаление сервису
    public function destroy(Article $article)
    {
        $this->service->deleteArticle($article);
        return response()->json(['message' => 'Deleted']);
    }
}