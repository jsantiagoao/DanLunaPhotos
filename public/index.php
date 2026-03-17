<?php
/**
 * Meta Tag Injector — Dan Luna Photo
 * Inyecta OG/Twitter tags correctos por ruta antes de que Angular cargue.
 * Los bots (Facebook, WhatsApp, Twitter) ven los meta tags correctos.
 * Los usuarios reales reciben la app Angular sin diferencia.
 */

$base = 'https://danlunaphoto.duodigitalservice.com';
$uri  = rtrim(strtok(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '?'), '/');
if ($uri === '') $uri = '/';

// ── Definición de meta tags por ruta ──────────────────────────────────────
$routes = [

  '/' => [
    'title'       => 'Dan Luna Photo · Fotografía Profesional en Querétaro',
    'description' => 'Dan Luna Photo — Estudio de fotografía profesional en Querétaro. Sesiones de retrato, familias, eventos y mini sesiones especiales. Capturamos los momentos que importan.',
    'image'       => $base . '/assets/images/og-default.jpg',
    'image_alt'   => 'Dan Luna Photo — Fotografía Profesional en Querétaro',
    'url'         => $base,
    'type'        => 'website',
  ],

  '/dia-de-las-madres' => [
    'title'       => 'Mini Sesiones Día de las Madres 2026 · Dan Luna Photo · Querétaro',
    'description' => 'Dan Luna Photo — Regala un recuerdo que dura para siempre. Mini sesión fotográfica por el Día de las Madres en Querétaro · 40 min en estudio · Aparta con el 50%. Cupos limitados.',
    'image'       => $base . '/assets/images/slider/Sesion-dia-de-las-madres-queretaro.jpeg',
    'image_alt'   => 'Mini sesiones fotográficas Día de las Madres en Querétaro — Dan Luna Photo',
    'url'         => $base . '/dia-de-las-madres',
    'type'        => 'website',
  ],

  '/fotografa-en-queretaro' => [
    'title'       => 'Daniela Luna · Fotógrafa Profesional en Querétaro | Dan Luna Photo',
    'description' => 'Fotografía con arquitectura y alma. Daniela Luna — fotógrafa profesional en Querétaro especializada en retratos, familias y sesiones especiales con intención y narrativa visual.',
    'image'       => $base . '/assets/images/Daniela_Luna_Fotografa-1024x776.jpg',
    'image_alt'   => 'Daniela Luna — Fotógrafa Profesional en Querétaro',
    'url'         => $base . '/fotografa-en-queretaro',
    'type'        => 'profile',
  ],

];

$m = $routes[$uri] ?? $routes['/'];

// Escapar para HTML
$t   = htmlspecialchars($m['title'],       ENT_QUOTES, 'UTF-8');
$d   = htmlspecialchars($m['description'], ENT_QUOTES, 'UTF-8');
$img = htmlspecialchars($m['image'],       ENT_QUOTES, 'UTF-8');
$alt = htmlspecialchars($m['image_alt'],   ENT_QUOTES, 'UTF-8');
$u   = htmlspecialchars($m['url'],         ENT_QUOTES, 'UTF-8');
$y   = htmlspecialchars($m['type'],        ENT_QUOTES, 'UTF-8');

// ── Leer el app Angular ────────────────────────────────────────────────────
$html = file_get_contents(__DIR__ . '/index.html');
if ($html === false) {
    http_response_code(500);
    exit('Error: index.html no encontrado.');
}

// ── Eliminar tags estáticos del index.html para evitar duplicados ──────────
$html = preg_replace('/<title>[^<]*<\/title>/i',              '', $html);
$html = preg_replace('/<meta\s+name="description"[^>]*>/i',   '', $html);
$html = preg_replace('/<link\s+rel="canonical"[^>]*>/i',      '', $html);
$html = preg_replace('/<meta\s+property="og:[^"]*"[^>]*>/i',  '', $html);
$html = preg_replace('/<meta\s+name="twitter:[^"]*"[^>]*>/i', '', $html);

// ── Bloque de meta tags a inyectar ─────────────────────────────────────────
$inject = <<<HTML

  <!-- HTML Meta Tags -->
  <title>{$t}</title>
  <meta name="description" content="{$d}">
  <link rel="canonical" href="{$u}">

  <!-- Facebook / Open Graph -->
  <meta property="og:url"          content="{$u}">
  <meta property="og:type"         content="{$y}">
  <meta property="og:title"        content="{$t}">
  <meta property="og:description"  content="{$d}">
  <meta property="og:image"        content="{$img}">
  <meta property="og:image:width"  content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt"    content="{$alt}">
  <meta property="og:site_name"    content="Dan Luna Photography">
  <meta property="og:locale"       content="es_MX">

  <!-- Twitter / X Card -->
  <meta name="twitter:card"        content="summary_large_image">
  <meta name="twitter:title"       content="{$t}">
  <meta name="twitter:description" content="{$d}">
  <meta name="twitter:image"       content="{$img}">
  <meta name="twitter:image:alt"   content="{$alt}">
  <meta name="twitter:site"        content="@danlunaphotos">

HTML;

// Inyectar antes del cierre de </head>
$html = str_replace('</head>', $inject . '</head>', $html);

header('Content-Type: text/html; charset=UTF-8');
echo $html;
