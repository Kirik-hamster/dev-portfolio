<?php

namespace App\Traits;

use App\Notifications\VerifyEmailCode;

trait HasOtp
{
    /** Проверка лимита на повторную отправку */
    public function canResendOtp(): bool
    {
        return !($this->verification_code_expires_at && 
               now()->diffInSeconds($this->verification_code_expires_at) > 40);
    }

    /** Генерация и отправка кода */
    public function sendOtp(): void
    {
        $code = (string) rand(100000, 999999);
        
        $this->update([
            'verification_code' => $code,
            'verification_code_expires_at' => now()->addSeconds(100)
        ]);

        $this->notify(new VerifyEmailCode($code));
    }

    /** Проверка кода на валидность */
    public function isValidOtp(string $code): bool
    {
        return $this->verification_code === $code && 
               now()->isBefore($this->verification_code_expires_at);
    }

    /** Очистка кода после использования */
    public function clearOtp(): void
    {
        $this->update([
            'verification_code' => null, 
            'verification_code_expires_at' => null
        ]);
    }
}