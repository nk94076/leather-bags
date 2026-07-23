// Deterministic, dependency-free SVG placeholder generator used for all demo
// imagery (products, categories, banners, avatars, gallery tiles). Keeping
// this same-origin avoids any reliance on third-party image CDNs.

const PALETTES: [string, string][] = [
  ["#c99a6d", "#6f4e37"],
  ["#d9b491", "#a06f45"],
  ["#8a6547", "#3d2a1d"],
  ["#d9b969", "#8c6a22"],
  ["#e7d3be", "#b9855a"],
  ["#5c4230", "#201812"],
  ["#caa06a", "#4f3626"],
  ["#e0c39a", "#9c6f42"],
];

const BAG_PATHS = [
  // tote / handbag
  `<path d="M62 92c0-22 17-38 38-38s38 16 38 38" fill="none" stroke="white" stroke-opacity="0.35" stroke-width="4" stroke-linecap="round"/>
   <rect x="46" y="90" width="108" height="86" rx="14" fill="white" fill-opacity="0.16"/>
   <rect x="46" y="90" width="108" height="18" rx="8" fill="white" fill-opacity="0.22"/>`,
  // backpack
  `<rect x="52" y="70" width="96" height="108" rx="20" fill="white" fill-opacity="0.16"/>
   <rect x="70" y="70" width="60" height="34" rx="10" fill="white" fill-opacity="0.22"/>
   <path d="M64 84v70M136 84v70" stroke="white" stroke-opacity="0.3" stroke-width="5" stroke-linecap="round"/>`,
  // duffel
  `<rect x="38" y="98" width="124" height="66" rx="33" fill="white" fill-opacity="0.16"/>
   <path d="M78 98v-8a10 10 0 0 1 10-10h24a10 10 0 0 1 10 10v8" fill="none" stroke="white" stroke-opacity="0.35" stroke-width="5" stroke-linecap="round"/>
   <circle cx="100" cy="131" r="14" fill="white" fill-opacity="0.12"/>`,
  // messenger / satchel
  `<rect x="44" y="86" width="112" height="80" rx="16" fill="white" fill-opacity="0.16"/>
   <path d="M44 86 L100 60 L156 86" fill="none" stroke="white" stroke-opacity="0.32" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
   <rect x="86" y="100" width="28" height="20" rx="6" fill="white" fill-opacity="0.24"/>`,
  // wallet / accessory
  `<rect x="58" y="82" width="84" height="60" rx="10" fill="white" fill-opacity="0.18"/>
   <path d="M58 102h84" stroke="white" stroke-opacity="0.3" stroke-width="3"/>
   <circle cx="128" cy="112" r="5" fill="white" fill-opacity="0.4"/>`,
];

function hashSeed(seed: string) {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 33) ^ seed.charCodeAt(i);
  }
  return Math.abs(h);
}

export function productPlaceholderSvg({
  seed,
  w = 800,
  h = 1000,
  label,
}: {
  seed: string;
  w?: number;
  h?: number;
  label?: string;
}) {
  const hash = hashSeed(seed);
  const [from, to] = PALETTES[hash % PALETTES.length];
  const bag = BAG_PATHS[hash % BAG_PATHS.length];
  const angle = (hash % 4) * 35;
  const gradId = `g${hash}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(${angle} 0.5 0.5)">
        <stop offset="0%" stop-color="${from}"/>
        <stop offset="100%" stop-color="${to}"/>
      </linearGradient>
      <radialGradient id="v${gradId}" cx="50%" cy="35%" r="75%">
        <stop offset="0%" stop-color="black" stop-opacity="0"/>
        <stop offset="100%" stop-color="black" stop-opacity="0.28"/>
      </radialGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#${gradId})"/>
    <g transform="translate(${w / 2 - 100}, ${h / 2 - 110}) scale(${Math.min(w, h) / 220})">
      ${bag}
    </g>
    <rect width="${w}" height="${h}" fill="url(#v${gradId})"/>
    ${
      label
        ? `<text x="32" y="${h - 32}" font-family="Georgia, serif" font-size="${Math.max(16, w * 0.032)}" fill="white" fill-opacity="0.85" letter-spacing="1">${escapeXml(label)}</text>`
        : ""
    }
  </svg>`;
}

export function avatarPlaceholderSvg({ seed, name, size = 96 }: { seed: string; name: string; size?: number }) {
  const hash = hashSeed(seed);
  const [from, to] = PALETTES[hash % PALETTES.length];
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const gradId = `a${hash}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${from}"/>
        <stop offset="100%" stop-color="${to}"/>
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${size}" fill="url(#${gradId})"/>
    <text x="50%" y="53%" text-anchor="middle" dominant-baseline="middle" font-family="Georgia, serif" font-size="${size * 0.38}" fill="white">${escapeXml(initials)}</text>
  </svg>`;
}

export function bannerPlaceholderSvg({
  seed,
  w = 1400,
  h = 800,
  title,
  subtitle,
}: {
  seed: string;
  w?: number;
  h?: number;
  title?: string;
  subtitle?: string;
}) {
  const hash = hashSeed(seed);
  const [from, to] = PALETTES[hash % PALETTES.length];
  const bag = BAG_PATHS[(hash + 1) % BAG_PATHS.length];
  const gradId = `b${hash}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${from}"/>
        <stop offset="100%" stop-color="${to}"/>
      </linearGradient>
      <radialGradient id="v${gradId}" cx="70%" cy="30%" r="80%">
        <stop offset="0%" stop-color="black" stop-opacity="0"/>
        <stop offset="100%" stop-color="black" stop-opacity="0.45"/>
      </radialGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#${gradId})"/>
    <g opacity="0.5" transform="translate(${w * 0.62}, ${h * 0.16}) scale(${(Math.min(w, h) / 220) * 1.6})">
      ${bag}
    </g>
    <rect width="${w}" height="${h}" fill="url(#v${gradId})"/>
    ${title ? `<text x="${w * 0.07}" y="${h * 0.5}" font-family="Georgia, serif" font-size="${w * 0.055}" fill="white">${escapeXml(title)}</text>` : ""}
    ${subtitle ? `<text x="${w * 0.07}" y="${h * 0.5 + w * 0.045}" font-family="Georgia, serif" font-size="${w * 0.024}" fill="white" fill-opacity="0.85">${escapeXml(subtitle)}</text>` : ""}
  </svg>`;
}

function escapeXml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function placeholderUrl(
  type: "product" | "category" | "banner" | "avatar" | "gallery",
  seed: string,
  opts?: { w?: number; h?: number; label?: string }
) {
  const params = new URLSearchParams({ type, seed });
  if (opts?.w) params.set("w", String(opts.w));
  if (opts?.h) params.set("h", String(opts.h));
  if (opts?.label) params.set("label", opts.label);
  return `/api/placeholder?${params.toString()}`;
}
