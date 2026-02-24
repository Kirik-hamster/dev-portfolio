<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema; 
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Cache;
use App\Models\Setting;

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

        if (Schema::hasTable('settings')) {
            $settings = Cache::rememberForever('site_settings', function () {
                return Setting::all()->pluck('value', 'key');
            });

            if ($settings->has('mail_host')) {
                try {
                    config([
                        'mail.mailers.smtp.host' => $settings->get('mail_host'),
                        'mail.mailers.smtp.port' => $settings->get('mail_port'),
                        'mail.mailers.smtp.username' => $settings->get('mail_username'),
                        'mail.mailers.smtp.password' => Crypt::decryptString($settings->get('mail_password')),
                        'mail.from.address' => $settings->get('mail_username'),
                        'mail.from.name' => $settings->get('mail_from_name'),
                        'mail.default' => 'smtp',
                    ]);
                } catch (\Exception $e) {
                    // Если ключ APP_KEY изменился, расшифровка упадет. 
                    // В этом случае просто игнорируем, чтобы сайт не «лег».
                }
            }
        }
    }
}
