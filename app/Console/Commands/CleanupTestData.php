<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class CleanupTestData extends Command
{
    protected $signature = 'db:cleanup-test-data';
    protected $description = 'Удаляет тестовые данные юзеров @test.loc';

    public function handle()
    {
        $count = User::where('email', 'like', '%@test.loc')->count();
        if ($this->confirm("Удалить {$count} тестовых юзеров и ВСЕ их данные?")) {
            User::where('email', 'like', '%@test.loc')->delete();
            $this->info('База очищена.');
        }
    }
}
