<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('page_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('page_path'); // Например: /home, /portfolio, /article/5
            $table->string('ip_address')->nullable(); // Для идентификации гостей
            $table->boolean('is_guest')->default(true);
            $table->date('viewed_at'); // Чтобы легко группировать по дням
            $table->integer('views_count')->default(1);
            $table->timestamps();

            // Уникальный индекс, чтобы просто инкрементировать просмотры за день
            $table->unique(['user_id', 'page_path', 'viewed_at', 'ip_address'], 'unique_visit');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('page_views');
    }
};
