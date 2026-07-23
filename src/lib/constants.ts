export const LEATHER_TYPES = [
  "Full-Grain Leather",
  "Top-Grain Leather",
  "Nubuck Leather",
  "Pebbled Leather",
  "Nappa Leather",
  "Buffalo Leather",
  "Saffiano Leather",
  "Suede Leather",
];

export const COLOR_PALETTE = [
  { name: "Cognac", hex: "#B9855A" },
  { name: "Espresso", hex: "#4F3626" },
  { name: "Chestnut", hex: "#8A6547" },
  { name: "Black Onyx", hex: "#1A1512" },
  { name: "Camel Tan", hex: "#D9B491" },
  { name: "Olive Moss", hex: "#6B6250" },
  { name: "Burgundy Wine", hex: "#6B2737" },
  { name: "Midnight Navy", hex: "#2C3E50" },
  { name: "Warm Camel", hex: "#C9A26B" },
  { name: "Charcoal Grey", hex: "#3B3B3B" },
];

export const PRICE_MIN = 0;
export const PRICE_MAX = 25000;

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "latest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "popularity", label: "Most Reviewed" },
] as const;

export const PRODUCTS_PER_PAGE = 12;
