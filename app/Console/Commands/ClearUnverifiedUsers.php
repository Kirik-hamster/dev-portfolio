<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class ClearUnverifiedUsers extends Command
{
    // Название команды для запуска вручную
    protected $signature = 'users:clear-unverified';
    protected $description = 'Удаляет пользователей, не подтвердивших email более 24 часов';

    public function handle()
    {
        // Удаляем тех, у кого нет даты верификации и аккаунт создан давно
        $deletedCount = User::whereNull('email_verified_at')
            ->where('created_at', '<', now()->subHours(24))
            ->delete();

        $this->info("Удалено не подтверждённых пользователей: {$deletedCount}");
    }
}
