import useEmblaCarousel from 'embla-carousel-react';
import {
  Children,
  isValidElement,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export interface CarouselProps {
  /** Names the carousel for assistive technology, e.g. "降價好貨". */
  label: string;
  /** Every child becomes one slide. */
  children: ReactNode;
  /** How many slides are visible at once. A fraction (8.5) lets the next
      slide peek in, which is how the live site hints that there is more. */
  perView?: number;
  /** Space between slides, in px. */
  gap?: number;
  loop?: boolean;
  arrows?: boolean;
  dots?: boolean;
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

/**
 * The one place in the workspace that knows the carousel library (an ESLint
 * rule keeps it that way). Everything else sees slides, arrows and dots, so
 * replacing embla is a change to this file.
 */
export function Carousel({
  label,
  children,
  perView = 1,
  gap = 0,
  loop = false,
  arrows = true,
  dots = false,
}: CarouselProps) {
  const [viewportRef, embla] = useEmblaCarousel({
    align: 'start',
    loop,
    // An arrow moves by as many slides as fit, not by one.
    slidesToScroll: 'auto',
  });
  const [paging, setPaging] = useState(NOT_READY);

  useEffect(() => {
    if (!embla) return;

    const sync = () =>
      setPaging({
        pageCount: embla.scrollSnapList().length,
        current: embla.selectedScrollSnap(),
        canGoBack: embla.canScrollPrev(),
        canGoForward: embla.canScrollNext(),
      });

    sync();
    // reInit: embla re-measures when the slides or the viewport change.
    embla.on('select', sync).on('reInit', sync);
    return () => {
      embla.off('select', sync).off('reInit', sync);
    };
  }, [embla]);

  const slides = Children.toArray(children);

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className="relative"
    >
      <div ref={viewportRef} className="overflow-hidden">
        {/* embla needs the gap inside the slides: a flex `gap` would throw
            off the positions it calculates. */}
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
        <div className="mt-1 flex justify-center">
          {Array.from({ length: paging.pageCount }, (_, index) => (
            // The dot is 4px tall, as on the live site. The padding makes
            // the button around it a target that can actually be hit.
            <button
              key={index}
              type="button"
              aria-label={`第 ${index + 1} 頁`}
              aria-current={index === paging.current ? 'true' : undefined}
              onClick={() => embla?.scrollTo(index)}
              className="px-0.5 py-2"
            >
              <span
                className={`block h-1 rounded-full transition-all duration-300 ${
                  index === paging.current
                    ? 'bg-brand w-3'
                    : 'bg-carousel-dot w-1'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
