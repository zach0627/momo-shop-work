import { fireEvent, render, screen } from '@testing-library/react';

import { Carousel } from './carousel';

// jsdom 不做排版，真的 embla 永遠只有一頁；這裡用「會換頁的假 embla」測包裝邏輯（箭頭、圓點）
const embla = vi.hoisted(() => ({
  api: undefined as unknown,
  options: undefined as unknown,
}));

vi.mock('embla-carousel-react', () => ({
  default: (options: unknown) => {
    embla.options = options;
    return [() => undefined, embla.api];
  },
}));

/** 假的 embla API：有 pageCount 頁，換頁時像真的一樣發出 select 事件。 */
function createFakeEmbla(pageCount: number) {
  const listeners = new Map<string, Set<() => void>>();
  let selected = 0;

  function go(index: number) {
    selected = Math.max(0, Math.min(pageCount - 1, index));
    listeners.get('select')?.forEach((listener) => listener());
  }

  const api = {
    scrollSnapList: () => Array.from({ length: pageCount }, (_, i) => i),
    selectedScrollSnap: () => selected,
    canScrollPrev: () => selected > 0,
    canScrollNext: () => selected < pageCount - 1,
    scrollPrev: vi.fn(() => go(selected - 1)),
    scrollNext: vi.fn(() => go(selected + 1)),
    scrollTo: vi.fn((index: number) => go(index)),
    on(event: string, listener: () => void) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)?.add(listener);
      return api;
    },
    off(event: string, listener: () => void) {
      listeners.get(event)?.delete(listener);
      return api;
    },
    listenerCount: () =>
      [...listeners.values()].reduce((sum, set) => sum + set.size, 0),
  };
  return api;
}

/** 輪播本身也是 group；slide 是 aria-roledescription="slide" 的那些。 */
const getSlides = () =>
  screen
    .getAllByRole('group')
    .filter((node) => node.getAttribute('aria-roledescription') === 'slide');

function renderCarousel(
  pageCount: number,
  props: Partial<React.ComponentProps<typeof Carousel>> = {},
) {
  const api = createFakeEmbla(pageCount);
  embla.api = api;
  const view = render(
    <Carousel label="降價好貨" {...props}>
      <div>商品一</div>
      <div>商品二</div>
      <div>商品三</div>
    </Carousel>,
  );
  return { api, ...view };
}

describe('Carousel', () => {
  it('is a labelled carousel whose children are its slides', () => {
    renderCarousel(1);

    const region = screen.getByRole('group', { name: '降價好貨' });
    expect(region.getAttribute('aria-roledescription')).toBe('carousel');

    const slides = getSlides();
    expect(slides.map((slide) => slide.getAttribute('aria-label'))).toEqual([
      '1 / 3',
      '2 / 3',
      '3 / 3',
    ]);
    expect(slides[1].textContent).toBe('商品二');
  });

  it('sizes each slide to show `perView` of them at once', () => {
    renderCarousel(1, { perView: 4 });

    const [slide] = getSlides();
    expect(slide.style.flexBasis).toBe('25%');
  });

  it('pages forward and back with the arrows', () => {
    const { api } = renderCarousel(3);

    fireEvent.click(screen.getByRole('button', { name: '下一頁' }));
    expect(api.scrollNext).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: '上一頁' }));
    expect(api.scrollPrev).toHaveBeenCalledTimes(1);
  });

  it('disables an arrow when there is nowhere to go in its direction', () => {
    renderCarousel(2);
    const prev = screen.getByRole<HTMLButtonElement>('button', {
      name: '上一頁',
    });
    const next = screen.getByRole<HTMLButtonElement>('button', {
      name: '下一頁',
    });

    expect([prev.disabled, next.disabled]).toEqual([true, false]);

    fireEvent.click(next);
    expect([prev.disabled, next.disabled]).toEqual([false, true]);
  });

  it('hides the arrows on request', () => {
    renderCarousel(3, { arrows: false });

    expect(getSlides()).toHaveLength(3);
    expect(screen.queryByRole('button', { name: '下一頁' })).toBeNull();
    expect(screen.queryByRole('button', { name: '上一頁' })).toBeNull();
  });

  it('shows one dot per page and marks the current one', () => {
    renderCarousel(3, { dots: true });

    const dots = screen.getAllByRole('button', { name: /^第 \d 頁$/ });
    expect(dots).toHaveLength(3);
    expect(dots.map((dot) => dot.getAttribute('aria-current'))).toEqual([
      'true',
      null,
      null,
    ]);
  });

  it('jumps to a page from its dot, and the dots follow', () => {
    const { api } = renderCarousel(3, { dots: true });

    fireEvent.click(screen.getByRole('button', { name: '第 3 頁' }));

    expect(api.scrollTo).toHaveBeenCalledWith(2);
    expect(
      screen
        .getByRole('button', { name: '第 3 頁' })
        .getAttribute('aria-current'),
    ).toBe('true');
    expect(
      screen
        .getByRole('button', { name: '第 1 頁' })
        .getAttribute('aria-current'),
    ).toBeNull();
  });

  it('shows no dots when everything fits on one page', () => {
    renderCarousel(1, { dots: true });

    expect(getSlides()).toHaveLength(3);
    expect(screen.queryByRole('button', { name: /^第 \d 頁$/ })).toBeNull();
  });

  it('shows no dots unless asked to', () => {
    renderCarousel(3);

    expect(getSlides()).toHaveLength(3);
    expect(screen.queryByRole('button', { name: /^第 \d 頁$/ })).toBeNull();
  });

  it('stops listening to embla when it unmounts', () => {
    const { api, unmount } = renderCarousel(3);
    expect(api.listenerCount()).toBeGreaterThan(0);

    unmount();

    expect(api.listenerCount()).toBe(0);
  });

  it('pages a whole view at a time and passes `loop` on to embla', () => {
    renderCarousel(3, { loop: true });

    expect(embla.options).toMatchObject({
      loop: true,
      slidesToScroll: 'auto',
      align: 'start',
    });
  });
});
