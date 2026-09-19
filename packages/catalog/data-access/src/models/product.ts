export interface Product {
  /** Taken from the artwork file name: 15642257_OL_m.webp -> "15642257". */
  id: string;
  name: string;
  /** Relative to the document base, like every asset path in this project. */
  imageUrl: string;
  /** Gallery for the detail page. Always contains `imageUrl`. */
  images: string[];
  price: number;
  /** Present only when the product is discounted; always above `price`. */
  originalPrice?: number;
  /** One short promotion line, e.g. "滿1件折100". Shown by horizontal cards. */
  promoText?: string;
  /** Bullet lines shown on the detail page. */
  description: string[];
}
