<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class HomeSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\HomeSetting::create([
            'name' => 'Кирилл Мякотин',
            'specialization' => 'Fullstack разработчик',
            'about_text' => <<<EOT
    В IT я уже 3 года, и за это время успел поработать над самыми разными задачами: от ускорения баз данных в десятки раз до рефакторинга огромных легаси-монолитов. Но этот сайт для меня — особенная история.

    Изначально я планировал сделать простое портфолио, но процесс так затянул, что в итоге я написал целую платформу с блогами и системой регистрации. Я из тех людей, кто искренне обожает кодить и превращать идеи в работающие сервисы.

    Что здесь будет? Этот сайт — мой цифровой дом. Здесь я буду делиться своими проектами и писать посты. Причем не только про разработку: мне интересно многое, поэтому темы могут быть самыми разными.

    Заходите, читайте и чувствуйте себя как дома!
    EOT,
            'stack_current' => 'React, Laravel, Vuejs, MySQL, PHP, TypeScript, JavaScript, Docker, PostgreSQL, HTML, CSS, Bootstrap, Linux, Git, Bash',
            'stack_learning' => 'C, Golang, Nginx, Redis, Kubernetes',
        ]);
    }
}
