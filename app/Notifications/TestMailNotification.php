<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TestMailNotification extends Notification
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('🚀 Проверка настроек SMTP')
            ->greeting('Связь установлена!')
            ->line('Это тестовое письмо с твоего портфолио.')
            ->line('Если ты его читаешь, значит настройки в админке указаны верно, и пользователи смогут получать коды подтверждения.')
            ->line('Отправлено в: ' . now()->format('H:i:s d.m.Y'))
            ->salutation('Твой сервер Laravel 🦾');
    }
}