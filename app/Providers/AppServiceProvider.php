<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Мы говорим: "Когда кто-то просит интерфейс, дай ему этот конкретный репозиторий"
        $this->app->bind(
            \App\Interfaces\ArticleRepositoryInterface::class, 
            \App\Repositories\ArticleRepository::class // Проверь путь к файлу!
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            return config('app.frontend_url')."/password-reset/$token?email={$notifiable->getEmailForPasswordReset()}";
        });
    }
}
