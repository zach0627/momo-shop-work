export interface Product {
  /** 取自素材檔名：15642257_OL_m.webp → "15642257"。 */
  id: string;
  name: string;
  /** 商品卡用的縮圖（相對於網站根目錄）。 */
  imageUrl: string;
  /** 詳情頁用的大圖，第一張是主圖；和 imageUrl 是同一張圖的不同尺寸。 */
  images: string[];
  price: number;
  /** 有折扣才有，且一定高於 price。 */
  originalPrice?: number;
  /** 一行促銷文字，例：「滿1件折100」。橫式商品卡會顯示。 */
  promoText?: string;
  /** 詳情頁的條列說明。 */
  description: string[];
}
