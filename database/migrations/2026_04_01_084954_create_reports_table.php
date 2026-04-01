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
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reporter_id')->constrained('users')->onDelete('cascade'); // Кто пожаловался
            $table->foreignId('reported_id')->constrained('users')->onDelete('cascade'); // На кого
            
            // Полиморфная связь: reportable_id (ID поста/коммента) и reportable_type (App\Models\Article и т.д.)
            $table->morphs('reportable'); 
            
            $table->text('reason'); // Текст жалобы
            $table->boolean('is_resolved')->default(false); // Рассмотрено админом или нет
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
