<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Применяем изменения
     */
    public function up(): void
    {
        Schema::table('page_views', function (Blueprint $table) {
            // Используем text, так как User-Agent может быть длинным
            $table->text('user_agent')->nullable()->after('ip_address');
        });
    }

    /**
     * Откатываем изменения
     */
    public function down(): void
    {
        Schema::table('page_views', function (Blueprint $table) {
            // Обязательно удаляем колонку при откате
            $table->dropColumn('user_agent');
        });
    }
};