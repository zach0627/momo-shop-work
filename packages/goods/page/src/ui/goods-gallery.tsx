/** 商品主圖。縮圖列與放大鏡屬於互動，這一頁不做。 */
export function GoodsGallery({
  imageUrl,
  name,
}: {
  imageUrl: string;
  name: string;
}) {
  return (
    <img
      src={imageUrl}
      // 這張圖是內容不是裝飾，所以 alt 用商品名稱
      alt={name}
      width={440}
      height={440}
      className="aspect-square w-full object-contain"
    />
  );
}
