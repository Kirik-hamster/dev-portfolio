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
        // Лайки и Избранное для Статей
        Schema::create('article_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('article_id')->constrained()->onDelete('cascade');
            $table->unique(['user_id', 'article_id']); // Защита от дублей
            $table->timestamps();
        });

        Schema::create('article_favorites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('article_id')->constrained()->onDelete('cascade');
            $table->unique(['user_id', 'article_id']);
            $table->timestamps();
        });

        // Лайки и Избранное для Блогов (Папок)
        Schema::create('blog_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('blog_id')->constrained()->onDelete('cascade');
            $table->unique(['user_id', 'blog_id']);
            $table->timestamps();
        });

        Schema::create('blog_favorites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('blog_id')->constrained()->onDelete('cascade');
            $table->unique(['user_id', 'blog_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blog_favorites');
        Schema::dropIfExists('blog_likes');
        Schema::dropIfExists('article_favorites');
        Schema::dropIfExists('article_likes');
    }
};
