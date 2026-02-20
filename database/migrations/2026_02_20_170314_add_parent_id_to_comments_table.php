<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('comments', function (Blueprint $table) {
            // 1. Поле для вложенности (ссылка на ID другого комментария)
            $table->foreignId('parent_id')->nullable()->after('user_id')->constrained('comments')->onDelete('cascade');
            
            // 2. Флаг: был ли отредактирован текст
            $table->boolean('is_edited')->default(false)->after('content');
            
            // 3. Точная дата последнего редактирования
            $table->timestamp('edited_at')->nullable()->after('is_edited');
        });
    }

    public function down(): void
    {
        Schema::table('comments', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropColumn(['parent_id', 'is_edited', 'edited_at']);
        });
    }
};
