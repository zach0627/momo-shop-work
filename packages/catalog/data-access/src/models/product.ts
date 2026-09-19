export interface Product {
  /** 取自素材檔名：15642257_OL_m.webp → "15642257"。 */
  id: string;
  name: string;
  /** 相對於網站根目錄的路徑。 */
  imageUrl: string;
  /** 詳情頁的圖；一定包含 imageUrl。 */
  images: string[];
  price: number;
  /** 有折扣才有，且一定高於 price。 */
  originalPrice?: number;
  /** 一行促銷文字，例：「滿1件折100」。橫式商品卡會顯示。 */
  promoText?: string;
  /** 詳情頁的條列說明。 */
  description: string[];
}
