<?php

namespace App\Providers;

use App\Interfaces\ArticleRepositoryInterface;
use App\Repositories\EloquentArticleRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Связываем интерфейс с его конкретной реализацией
        $this->app->bind(
            ArticleRepositoryInterface::class, 
            EloquentArticleRepository::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
