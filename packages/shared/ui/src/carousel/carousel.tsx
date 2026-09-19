import useEmblaCarousel from 'embla-carousel-react';
import {
  Children,
  isValidElement,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export interface CarouselProps {
  /** 給螢幕閱讀器念的名稱，例：「降價好貨」。 */
  label: string;
  /** 每個 child 是一張 slide。 */
  children: ReactNode;
  /** 一次看得到幾張。小數（8.5）會讓下一張露出一部分，提示後面還有。 */
  perView?: number;
  /** slide 之間的間距（px）。 */
  gap?: number;
  loop?: boolean;
  arrows?: boolean;
  dots?: boolean;
  /** below：圓點在 slide 下方（商品列）；overlay：疊在圖的下緣（主要活動）。 */
  dotsPlacement?: 'below' | 'overlay';
}

interface Paging {
  pageCount: number;
  current: number;
  canGoBack: boolean;
  canGoForward: boolean;
}

const NOT_READY: Paging = {
  pageCount: 0,
  current: 0,
  canGoBack: false,
  canGoForward: false,
};

const ARROW =
  'bg-carousel-arrow hover:bg-carousel-arrow-hover text-on-action absolute top-1/2 flex h-14 w-8 -translate-y-1/2 items-center justify-center transition disabled:opacity-25';

// 兩種圓點：數值都是真站實測。overlay 的外層不吃滑鼠事件，圖本身才點得到
const DOTS = {
  below: {
    row: 'mt-1 flex justify-center',
    button: 'px-0.5 py-2',
    dot: 'h-1',
    current: 'w-3',
    other: 'w-1',
  },
  overlay: {
    row: 'pointer-events-none absolute inset-x-0 bottom-1.5 flex justify-center gap-0.75',
    button: 'pointer-events-auto py-1.5',
    dot: 'h-0.75',
    current: 'w-2',
    other: 'w-0.75',
  },
} as const;

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={direction === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
    </svg>
  );
}

/** 輪播。整個 workspace 只有這個檔案認識 embla（由 ESLint 保證），要換套件只改這裡。 */
export function Carousel({
  label,
  children,
  perView = 1,
  gap = 0,
  loop = false,
  arrows = true,
  dots = false,
  dotsPlacement = 'below',
}: CarouselProps) {
  const [viewportRef, embla] = useEmblaCarousel({
    align: 'start',
    loop,
    // 一次翻一整頁，不是一張
    slidesToScroll: 'auto',
  });
  const [paging, setPaging] = useState(NOT_READY);

  useEffect(() => {
    if (!embla) return;

    // 把 embla 的狀態（幾頁、目前第幾頁、能不能往前後翻）同步到 React state
    const sync = () =>
      setPaging({
        pageCount: embla.scrollSnapList().length,
        current: embla.selectedScrollSnap(),
        canGoBack: embla.canScrollPrev(),
        canGoForward: embla.canScrollNext(),
      });

    sync();
    // reInit：slide 或容器尺寸改變時 embla 會重新量測
    embla.on('select', sync).on('reInit', sync);
    return () => {
      embla.off('select', sync).off('reInit', sync);
    };
  }, [embla]);

  const slides = Children.toArray(children);

  return (
    // 用 group 不用 region：輪播外層的區塊已經是同名的 landmark
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      className="relative"
    >
      <div ref={viewportRef} className="overflow-hidden">
        {/* embla 要求間距放在 slide 裡面；用 flex gap 會讓它算錯位置 */}
        <div className="flex touch-pan-y" style={{ marginLeft: -gap }}>
          {slides.map((slide, index) => (
            <div
              key={isValidElement(slide) ? slide.key : index}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} / ${slides.length}`}
              className="min-w-0 shrink-0 grow-0"
              style={{ flexBasis: `${100 / perView}%`, paddingLeft: gap }}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      {arrows && (
        <>
          <button
            type="button"
            aria-label="上一頁"
            disabled={!paging.canGoBack}
            onClick={() => embla?.scrollPrev()}
            className={`${ARROW} rounded-r-card left-0`}
          >
            <Chevron direction="left" />
          </button>
          <button
            type="button"
            aria-label="下一頁"
            disabled={!paging.canGoForward}
            onClick={() => embla?.scrollNext()}
            className={`${ARROW} rounded-l-card right-0`}
          >
            <Chevron direction="right" />
          </button>
        </>
      )}

      {dots && paging.pageCount > 1 && (
        <div className={DOTS[dotsPlacement].row}>
          {Array.from({ length: paging.pageCount }, (_, index) => (
            // 圓點只有 4px 高（同真站），靠按鈕的 padding 才點得到
            <button
              key={index}
              type="button"
              aria-label={`第 ${index + 1} 頁`}
              aria-current={index === paging.current ? 'true' : undefined}
              onClick={() => embla?.scrollTo(index)}
              className={DOTS[dotsPlacement].button}
            >
              <span
                className={`block rounded-full transition-all duration-300 ${DOTS[dotsPlacement].dot} ${
                  index === paging.current
                    ? `bg-brand ${DOTS[dotsPlacement].current}`
                    : `bg-carousel-dot ${DOTS[dotsPlacement].other}`
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
