<?php

namespace App\Services;

class TrackingCodeGenerator
{
    /**
     * Genera un código con el mismo formato que usaba Node:
     * {R|Q}-{3 iniciales}-{timestamp en ms}
     */
    public static function generate(string $nombres, string $claimType): string
    {
        $prefix = $claimType === 'Queja' ? 'Q' : 'R';
        $initials = strtoupper(substr(preg_replace('/\s+/', '', trim($nombres)), 0, 3));
        $timestamp = (int) round(microtime(true) * 1000);

        return "{$prefix}-{$initials}-{$timestamp}";
    }
}