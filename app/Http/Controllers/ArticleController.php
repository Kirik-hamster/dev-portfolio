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
        // Добавляем подсчет лайков, избранного и комментариев
        $query = $blog->articles()
            ->with(['blog', 'user'])
            ->withCount(['likes', 'favorites', 'comments']); 

        // ПОИСК
        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where('title', 'like', "%{$search}%");
        }

        // ТОЛЬКО ИЗБРАННОЕ (внутри этого блога)
        if ($request->boolean('favorites_only') && auth()->check()) {
            $query->whereHas('favorites', fn($q) => $q->where('user_id', auth()->id()));
        }

        // СОРТИРОВКА
        if ($request->get('sort') === 'popular') {
            $query->orderByDesc('likes_count');
        } else {
            $query->latest();
        }

        return $query->paginate(12);
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
        // Загружаем автора, папку и теги самой статьи
        return $article->load(['user:id,name,role', 'blog', 'tags'])->loadCount('comments');
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

    public function toggleLike(Article $article) {
        $article->likes()->toggle(auth()->id());
        return response()->json(['is_liked' => $article->is_liked, 'likes_count' => $article->likes()->count()]);
    }

    public function toggleFavorite(Article $article) {
        $article->favorites()->toggle(auth()->id());
        return response()->json(['is_favorited' => $article->is_favorited]);
    }

    public function community(Request $request) 
    {
        $query = Article::whereHas('blog', fn($q) => $q->where('is_portfolio', false))
            ->withCount(['likes', 'favorites', 'comments']);

        // ПОИСК
        if ($request->filled('search')) {
            $search = $request->search;
            $type = $request->get('search_type', 'title');

            $query->where(function($q) use ($search, $type) {
                if ($type === 'author') {
                    $q->whereHas('user', fn($u) => $u->where('name', 'like', "%{$search}%"));
                } else {
                    $q->where('title', 'like', "%{$search}%");
                }
            });
        }

        // ТЕГИ
        if ($request->filled('tag')) {
            $tag = mb_strtolower($request->tag);
            $query->whereHas('tags', function($q) use ($tag) {
                $q->whereRaw('LOWER(name) LIKE ?', ["%{$tag}%"]);
            });
        }

        // ТОЛЬКО ИЗБРАННОЕ
        if ($request->boolean('favorites_only') && auth()->check()) {
            $query->whereHas('favorites', fn($q) => $q->where('user_id', auth()->id()));
        }

        $sort = $request->get('sort', 'latest');
        if ($sort === 'popular') $query->orderByDesc('likes_count');
        else $query->latest();

        return $query->with(['blog', 'user'])->paginate(12);
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