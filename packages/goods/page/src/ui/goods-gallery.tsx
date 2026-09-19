/**
 * The main picture of the product. Just that: the live site's thumbnail
 * strip and zoom are interactions, and this page is display-only.
 */
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
      // Unlike on a product card, this picture is content, not decoration.
      alt={name}
      width={440}
      height={440}
      className="aspect-square w-full object-contain"
    />
  );
}
