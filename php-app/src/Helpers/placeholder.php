<?php
declare(strict_types=1);

/**
 * Deterministic, dependency-free SVG placeholder generator used for all demo
 * imagery (products, categories, banners, avatars). Same-origin, so the app
 * never depends on a third-party image CDN.
 */

function ph_palettes(): array
{
    return [
        ['#c99a6d', '#6f4e37'],
        ['#d9b491', '#a06f45'],
        ['#8a6547', '#3d2a1d'],
        ['#d9b969', '#8c6a22'],
        ['#e7d3be', '#b9855a'],
        ['#5c4230', '#201812'],
        ['#caa06a', '#4f3626'],
        ['#e0c39a', '#9c6f42'],
    ];
}

function ph_bag_paths(): array
{
    return [
        '<path d="M62 92c0-22 17-38 38-38s38 16 38 38" fill="none" stroke="white" stroke-opacity="0.35" stroke-width="4" stroke-linecap="round"/>
         <rect x="46" y="90" width="108" height="86" rx="14" fill="white" fill-opacity="0.16"/>
         <rect x="46" y="90" width="108" height="18" rx="8" fill="white" fill-opacity="0.22"/>',
        '<rect x="52" y="70" width="96" height="108" rx="20" fill="white" fill-opacity="0.16"/>
         <rect x="70" y="70" width="60" height="34" rx="10" fill="white" fill-opacity="0.22"/>
         <path d="M64 84v70M136 84v70" stroke="white" stroke-opacity="0.3" stroke-width="5" stroke-linecap="round"/>',
        '<rect x="38" y="98" width="124" height="66" rx="33" fill="white" fill-opacity="0.16"/>
         <path d="M78 98v-8a10 10 0 0 1 10-10h24a10 10 0 0 1 10 10v8" fill="none" stroke="white" stroke-opacity="0.35" stroke-width="5" stroke-linecap="round"/>
         <circle cx="100" cy="131" r="14" fill="white" fill-opacity="0.12"/>',
        '<rect x="44" y="86" width="112" height="80" rx="16" fill="white" fill-opacity="0.16"/>
         <path d="M44 86 L100 60 L156 86" fill="none" stroke="white" stroke-opacity="0.32" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
         <rect x="86" y="100" width="28" height="20" rx="6" fill="white" fill-opacity="0.24"/>',
        '<rect x="58" y="82" width="84" height="60" rx="10" fill="white" fill-opacity="0.18"/>
         <path d="M58 102h84" stroke="white" stroke-opacity="0.3" stroke-width="3"/>
         <circle cx="128" cy="112" r="5" fill="white" fill-opacity="0.4"/>',
    ];
}

function ph_hash(string $seed): int
{
    $h = 5381;
    for ($i = 0; $i < strlen($seed); $i++) {
        $h = (($h * 33) ^ ord($seed[$i])) & 0x7FFFFFFF;
    }
    return abs($h);
}

function ph_xml_escape(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES | ENT_XML1, 'UTF-8');
}

function product_placeholder_svg(string $seed, int $w = 800, int $h = 1000, ?string $label = null): string
{
    $palettes = ph_palettes();
    $paths = ph_bag_paths();
    $hash = ph_hash($seed);
    [$from, $to] = $palettes[$hash % count($palettes)];
    $bag = $paths[$hash % count($paths)];
    $angle = ($hash % 4) * 35;
    $gradId = 'g' . $hash;
    $scale = min($w, $h) / 220;
    $tx = $w / 2 - 100;
    $ty = $h / 2 - 110;

    $labelSvg = '';
    if ($label) {
        $fontSize = max(16, $w * 0.032);
        $labelSvg = sprintf(
            '<text x="32" y="%d" font-family="Georgia, serif" font-size="%.1f" fill="white" fill-opacity="0.85" letter-spacing="1">%s</text>',
            $h - 32,
            $fontSize,
            ph_xml_escape($label)
        );
    }

    return <<<SVG
    <svg xmlns="http://www.w3.org/2000/svg" width="{$w}" height="{$h}" viewBox="0 0 {$w} {$h}">
      <defs>
        <linearGradient id="{$gradId}" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate({$angle} 0.5 0.5)">
          <stop offset="0%" stop-color="{$from}"/>
          <stop offset="100%" stop-color="{$to}"/>
        </linearGradient>
        <radialGradient id="v{$gradId}" cx="50%" cy="35%" r="75%">
          <stop offset="0%" stop-color="black" stop-opacity="0"/>
          <stop offset="100%" stop-color="black" stop-opacity="0.28"/>
        </radialGradient>
      </defs>
      <rect width="{$w}" height="{$h}" fill="url(#{$gradId})"/>
      <g transform="translate({$tx}, {$ty}) scale({$scale})">
        {$bag}
      </g>
      <rect width="{$w}" height="{$h}" fill="url(#v{$gradId})"/>
      {$labelSvg}
    </svg>
    SVG;
}

function avatar_placeholder_svg(string $seed, string $name, int $size = 96): string
{
    $palettes = ph_palettes();
    $hash = ph_hash($seed);
    [$from, $to] = $palettes[$hash % count($palettes)];
    $parts = preg_split('/\s+/', trim($name));
    $initials = strtoupper(substr($parts[0] ?? '', 0, 1) . substr($parts[1] ?? '', 0, 1));
    $gradId = 'a' . $hash;
    $fontSize = $size * 0.38;

    return <<<SVG
    <svg xmlns="http://www.w3.org/2000/svg" width="{$size}" height="{$size}" viewBox="0 0 {$size} {$size}">
      <defs>
        <linearGradient id="{$gradId}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="{$from}"/>
          <stop offset="100%" stop-color="{$to}"/>
        </linearGradient>
      </defs>
      <rect width="{$size}" height="{$size}" rx="{$size}" fill="url(#{$gradId})"/>
      <text x="50%" y="53%" text-anchor="middle" dominant-baseline="middle" font-family="Georgia, serif" font-size="{$fontSize}" fill="white">{$initials}</text>
    </svg>
    SVG;
}

function banner_placeholder_svg(string $seed, int $w = 1400, int $h = 800): string
{
    $palettes = ph_palettes();
    $paths = ph_bag_paths();
    $hash = ph_hash($seed);
    [$from, $to] = $palettes[$hash % count($palettes)];
    $bag = $paths[($hash + 1) % count($paths)];
    $gradId = 'b' . $hash;
    $scale = (min($w, $h) / 220) * 1.6;
    $tx = $w * 0.62;
    $ty = $h * 0.16;

    return <<<SVG
    <svg xmlns="http://www.w3.org/2000/svg" width="{$w}" height="{$h}" viewBox="0 0 {$w} {$h}">
      <defs>
        <linearGradient id="{$gradId}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="{$from}"/>
          <stop offset="100%" stop-color="{$to}"/>
        </linearGradient>
        <radialGradient id="v{$gradId}" cx="70%" cy="30%" r="80%">
          <stop offset="0%" stop-color="black" stop-opacity="0"/>
          <stop offset="100%" stop-color="black" stop-opacity="0.45"/>
        </radialGradient>
      </defs>
      <rect width="{$w}" height="{$h}" fill="url(#{$gradId})"/>
      <g opacity="0.5" transform="translate({$tx}, {$ty}) scale({$scale})">
        {$bag}
      </g>
      <rect width="{$w}" height="{$h}" fill="url(#v{$gradId})"/>
    </svg>
    SVG;
}

function placeholder_url(string $type, string $seed, int $w = 800, int $h = 1000, ?string $label = null): string
{
    $params = ['w' => $w, 'h' => $h];
    if ($label) {
        $params['label'] = $label;
    }
    return base_url('img/' . $type . '/' . rawurlencode($seed)) . '?' . http_build_query($params);
}
