<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Respuesta a Reclamo</title>
</head>
<body style="font-family: Arial, sans-serif; background:#f5f7fb; padding:20px;">
    <div style="max-width:700px;margin:auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #e0e0e0;">

        <div style="background:#323f7c;color:white;padding:20px;">
            <h2 style="margin:0;">Matt Innova Solution — Libro de Reclamaciones</h2>
        </div>

        <div style="padding:25px;">
            <p>
                Estimado(a)
                <strong>{{ $reclamacion->nombres }} {{ $reclamacion->apellido_paterno }} {{ $reclamacion->apellido_materno }}</strong>
            </p>

            <p>
                Se ha emitido una respuesta respecto a su {{ strtolower($reclamacion->claim_type) }}
                registrada en el Libro de Reclamaciones.
            </p>

            <table style="width:100%;border-collapse:collapse;margin:20px 0;">
                <tr><td><strong>Código:</strong></td><td>{{ $reclamacion->tracking_code }}</td></tr>
                <tr><td><strong>Estado:</strong></td><td>{{ $reclamacion->processing_status }}</td></tr>
                <tr><td><strong>Fecha:</strong></td><td>{{ now()->format('d/m/Y') }}</td></tr>
            </table>

            <div style="background:#f8f9ff;border-left:4px solid #323f7c;padding:15px;margin-top:20px;">
                <strong>Respuesta Institucional:</strong>
                <p style="margin-top:10px;">{{ $reclamacion->admin_response }}</p>
            </div>

            <p style="margin-top:25px;">
                Para cualquier consulta adicional puede responder directamente a este correo
                o comunicarse con la institución.
            </p>
        </div>
    </div>
</body>
</html>