<?php

namespace App\Mail;

use App\Models\Reclamacion;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class RespuestaReclamoMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Reclamacion $reclamacion,
        public bool $isAdminCopy = false,
    ) {}

    public function build(): self
    {
        $subject = $this->isAdminCopy
            ? "Respuesta emitida - {$this->reclamacion->tracking_code}"
            : "Respuesta a su reclamo - {$this->reclamacion->tracking_code}";

        return $this->subject($subject)
            ->view('emails.respuesta_reclamo')
            ->with(['reclamacion' => $this->reclamacion]);
    }
}