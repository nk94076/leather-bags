export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  avgRating: number;
  reviewCount: number;
  isTrending: boolean;
  isLatest: boolean;
  stock: number;
  category: { name: string; slug: string };
  images: { url: string; altText: string }[];
  colors: ProductColor[];
}
