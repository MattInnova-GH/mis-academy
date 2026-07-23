<?php

return [
    'rules' => [
        [
            'patterns' => ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'buenas', 'saludos', 'hey', 'hi'],
            'handler' => null,
            'response' => '¡Hola! Bienvenido a MIS Academy 😊. ¿En qué puedo ayudarte hoy?',
            'quickReplies' => ['Cursos disponibles', 'Rutas académicas', 'Líneas académicas'],
        ],
        [
            'patterns' => ['cursos destacados', 'cursos', 'catalogo', 'que cursos hay', 'cursos disponibles'],
            'handler' => 'listarCursosDestacados',
            'quickReplies' => ['Ver más cursos', 'Rutas académicas'],
        ],
        [
            'patterns' => ['cuanto cuesta', 'precio de', 'costo del curso', 'precio del curso', 'vale el curso'],
            'handler' => 'buscarCursoPorNombre',
            'quickReplies' => ['Ver otro curso', 'Rutas académicas'],
        ],
        [
            'patterns' => ['lineas academicas', 'lineas de estudio', 'areas de estudio', 'que lineas hay'],
            'handler' => 'listarLineasAcademicas',
            'quickReplies' => ['Ver cursos', 'Rutas académicas'],
        ],
        [
            'patterns' => ['rutas academicas', 'rutas destacadas', 'rutas de aprendizaje', 'que rutas hay'],
            'handler' => 'listarRutasAcademicas',
            'quickReplies' => ['Ver líneas académicas', 'Ver cursos'],
        ],
        [
            'patterns' => ['certificado', 'certificacion', 'me certifican', 'entregan certificado'],
            'handler' => null,
            'response' => 'Sí, al completar un curso o ruta obtienes un certificado digital verificable con código único.',
            'quickReplies' => ['Ver cursos', 'Ver rutas académicas'],
        ],
        [
            'patterns' => ['gracias', 'muchas gracias', 'chau', 'adios', 'hasta luego', 'bye'],
            'handler' => null,
            'response' => '¡De nada! Fue un placer ayudarte 😊. ¡Que tengas un excelente día! 🎓',
            'quickReplies' => ['Otra consulta'],
        ],
        [
            'patterns' => ['ayuda', 'help', 'que puedes hacer', 'opciones', 'menu'],
            'handler' => null,
            'response' => "Puedo ayudarte con:\n\n📚 Cursos disponibles\n🛤️ Rutas académicas\n🎓 Líneas académicas\n💰 Precios\n📜 Certificados",
            'quickReplies' => ['Cursos disponibles', 'Rutas académicas', 'Líneas académicas'],
        ],
        [
            'patterns' => ['cursos de', 'cursos en', 'que cursos hay de', 'cursos del area de', 'cursos de la linea', 'cursos sobre'],
            'handler' => 'listarCursosPorLinea',
            'quickReplies' => ['Ver otra línea', 'Ver todos los cursos'],
        ],
    ],
    'lineas_alias' => [
        'mis-teacher' => ['docencia', 'enseñanza', 'ensenanza', 'profesores', 'pedagogia', 'aula', 'educacion'],
        'mis-ia' => ['inteligencia artificial', 'ia', 'machine learning', 'ai', 'chatbots'],
        'mis-business' => ['negocios', 'business', 'emprendimiento', 'marketing', 'finanzas', 'startups'],
        'mis-dev' => ['desarrollo', 'programacion', 'software', 'dev', 'fullstack', 'backend', 'mobile', 'angular', 'react'],
    ],
    'fallback' => [
        'text' => 'Lo siento, no entendí tu consulta 🤔. Puedo ayudarte con cursos, rutas académicas, precios y certificados. ¿Puedes reformular?',
        'quickReplies' => ['Cursos disponibles', 'Rutas académicas', 'Líneas académicas'],
    ],
];
