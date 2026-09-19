import {
  PRODUCT_CARD_FRAMES,
  type ProductCardFrame,
  type ProductCardLayout,
} from '../product-card/product-card';

// 灰色塊 + 緩慢閃爍；使用者要求減少動態效果時不閃
const BLOCK = 'bg-surface-muted block animate-pulse motion-reduce:animate-none';
const LINE = `${BLOCK} rounded-tile`;

export interface SkeletonProps {
  /** 尺寸與圓角由呼叫端決定，例：`h-10 w-20 rounded-tile`。 */
  className?: string;
}

/** 載入中的佔位色塊。純裝飾：「正在載入」要由呼叫端用 role="status" 的文字告知輔助技術。 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return <span aria-hidden="true" className={`${BLOCK} ${className}`} />;
}

export interface ProductCardSkeletonProps {
  layout?: ProductCardLayout;
  frame?: ProductCardFrame;
  /** 真的卡片把原價放在售價下面時（PriceTag 的 stacked），佔位也多留那一行。 */
  stacked?: boolean;
}

/**
 * 商品卡的佔位。每一塊的高度都照 ProductCard 的行高排（名稱 40、價格 26 + 4、原價 18…），
 * 商品到了之後卡片不會變高，下面的區塊才不會跳。改 ProductCard 的版面時要一起改這裡。
 */
export function ProductCardSkeleton({
  layout = 'vertical',
  frame = 'outlined',
  stacked = false,
}: ProductCardSkeletonProps) {
  const isHorizontal = layout === 'horizontal';
  const isRaised = frame === 'raised';

  return (
    <span
      aria-hidden="true"
      data-card-placeholder=""
      className={`${PRODUCT_CARD_FRAMES[frame]} bg-surface h-full overflow-hidden ${
        isHorizontal ? 'flex gap-2.5 p-4' : 'block'
      }`}
    >
      <span
        className={`${BLOCK} ${isHorizontal ? 'size-35 shrink-0' : 'aspect-square w-full'}`}
      />
      <span
        className={`block ${
          isHorizontal ? 'min-w-0 flex-1 pt-5.5' : isRaised ? 'pt-2' : 'p-2.5'
        }`}
      >
        {/* 限時搶購的卡片在名稱上面多一行促銷文字 */}
        {isRaised && <span className={`${LINE} mb-1 h-4 w-1/2`} />}
        <span className={`${LINE} h-4 w-full`} />
        <span className={`${LINE} mt-2 h-4 w-2/3`} />
        {/* 價格那一行：限時搶購的字比較大（23 / 28.75），其餘是 21 / 26 */}
        <span
          className={`${LINE} w-1/2 ${isRaised ? 'h-7' : 'h-6.5'} ${isHorizontal ? 'mt-6' : 'mt-1'}`}
        />
        {stacked && <span className={`${LINE} mt-1 h-3.5 w-1/3`} />}
      </span>
      {/* 限時搶購卡片底部的「最後 N 組」那一列 */}
      {isRaised && <span className={`${LINE} mt-1 h-7 w-full`} />}
    </span>
  );
}
