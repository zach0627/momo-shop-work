/**
 * 卡片最下面那一列：左邊「最後 N 組」，右邊紅色的「搶」。「搶」只是裝飾，整張卡片才是連結。
 * 「搶」用負邊距伸進卡片的內距，貼齊卡片右下角；那個角由卡片的圓角與 overflow-hidden 裁切。
 */
export function CardFooter({ stockLeft }: { stockLeft: number }) {
  return (
    <div className="flex items-end justify-between">
      <span className="bg-surface-stock text-ec-sm text-ink rounded-chip mb-2 px-2 py-0.5 leading-4.75 font-bold">
        最後{stockLeft}組
      </span>
      <span
        aria-hidden="true"
        className="bg-sale text-ec-xl text-on-action rounded-tl-tab -mr-2.5 -mb-2.5 px-7.5 py-1.25 leading-4.75 font-bold italic"
      >
        搶
      </span>
    </div>
  );
}
