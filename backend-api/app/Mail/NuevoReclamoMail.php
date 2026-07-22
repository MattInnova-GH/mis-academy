<?php

namespace App\Mail;

use App\Models\Reclamacion;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NuevoReclamoMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Reclamacion $reclamacion,
        public bool $isAdminCopy = false,
    ) {}

    public function build(): self
    {
        $subject = $this->isAdminCopy
            ? "Libro de Reclamaciones - Nuevo registro - {$this->reclamacion->tracking_code}"
            : "Matt Innova Solution - Constancia de registro de reclamo - {$this->reclamacion->tracking_code}";

        $mail = $this->subject($subject)
            ->view('emails.nuevo_reclamo')
            ->with(['reclamacion' => $this->reclamacion]);

        return $this->isAdminCopy
            ? $mail->replyTo($this->reclamacion->email)
            : $mail->replyTo(config('mail.receptor'));
    }
}