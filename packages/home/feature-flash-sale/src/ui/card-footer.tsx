/** 卡片最下面那一列：左邊「最後 N 組」，右邊紅色的「搶」。「搶」只是裝飾，整張卡片才是連結。 */
export function CardFooter({ stockLeft }: { stockLeft: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="bg-surface-stock text-ec-sm text-ink rounded-pill px-2 py-0.5 font-bold">
        最後{stockLeft}組
      </span>
      <span
        aria-hidden="true"
        className="bg-sale text-ec-md text-on-action rounded-tile px-4 py-0.5 font-bold italic"
      >
        搶
      </span>
    </div>
  );
}
