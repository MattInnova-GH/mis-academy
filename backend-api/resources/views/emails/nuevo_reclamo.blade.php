<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Registro de Reclamo</title>
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

            <p>Hemos registrado su {{ strtolower($reclamacion->claim_type) }} en el Libro de Reclamaciones Virtual.</p>

            <table style="width:100%;border-collapse:collapse;margin:20px 0;">
                <tr>
                    <td><strong>Número de reclamo:</strong></td>
                    <td>Nº {{ $reclamacion->formatted_id }}</td>
                </tr>
                <tr>
                    <td><strong>Código de seguimiento:</strong></td>
                    <td>{{ $reclamacion->tracking_code }}</td>
                </tr>
                <tr>
                    <td><strong>Tipo de documento:</strong></td>
                    <td>{{ $reclamacion->doc_type }} — {{ $reclamacion->dni }}</td>
                </tr>
                <tr>
                    <td><strong>Fecha:</strong></td>
                    <td>{{ $reclamacion->createdAt->format('d/m/Y H:i') }}</td>
                </tr>
            </table>

            <div style="background:#fafcff;border:1px solid #e3e8f7;border-radius:8px;padding:18px;margin-bottom:15px;">
                <strong style="color:#323f7c;">Descripción del bien o servicio</strong>
                <p style="margin-top:10px;line-height:1.6;">{{ $reclamacion->service_description }}</p>
            </div>

            <div style="background:#fafcff;border:1px solid #e3e8f7;border-radius:8px;padding:18px;margin-bottom:15px;">
                <strong style="color:#323f7c;">Detalle del reclamo</strong>
                <p style="margin-top:10px;line-height:1.6;">{{ $reclamacion->claim_description }}</p>
            </div>

            <div style="background:#fafcff;border:1px solid #e3e8f7;border-radius:8px;padding:18px;">
                <strong style="color:#323f7c;">Pedido del reclamante</strong>
                <p style="margin-top:10px;line-height:1.6;">{{ $reclamacion->claim_request }}</p>
            </div>

            <p style="margin-top:25px;line-height:1.6;color:#555;">
                Conserve este correo como constancia de registro. El seguimiento y las comunicaciones
                relacionadas con su reclamo serán realizadas mediante el correo electrónico registrado
                y el código de seguimiento.
            </p>

            <p style="margin-top:15px;color:#323f7c;font-weight:bold;">
                Matt Innova Solution EIRL
            </p>
        </div>
    </div>
</body>
</html>