import { render, screen } from '@testing-library/react';

import { Carousel } from './carousel';

/**
 * The real embla, mounted. carousel.spec.tsx replaces the library with a
 * fake, which would keep passing if an upgrade renamed an option or a
 * method; this spec is what would notice.
 */

// embla constructs both without checking that they exist; jsdom has neither.
class ObserverStub {
  observe() {
    return undefined;
  }
  unobserve() {
    return undefined;
  }
  disconnect() {
    return undefined;
  }
}

describe('Carousel with the real embla', () => {
  // embla reaches matchMedia through the element's own window
  // (ownerDocument.defaultView), which is not the object vi.stubGlobal
  // writes to - and it needs the function even with no breakpoints set.
  const ownerWindow = document.defaultView as Window;

  beforeAll(() => {
    vi.stubGlobal('ResizeObserver', ObserverStub);
    vi.stubGlobal('IntersectionObserver', ObserverStub);
    Object.defineProperty(ownerWindow, 'matchMedia', {
      configurable: true,
      value: () => ({
        matches: false,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }),
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
    Reflect.deleteProperty(ownerWindow, 'matchMedia');
  });

  it('mounts, renders its slides and unmounts without throwing', () => {
    const { unmount } = render(
      <Carousel label="限時搶購" perView={2} gap={10} dots loop>
        <div>商品一</div>
        <div>商品二</div>
        <div>商品三</div>
      </Carousel>,
    );

    expect(screen.getByRole('region', { name: '限時搶購' })).toBeTruthy();
    expect(screen.getAllByRole('group')).toHaveLength(3);
    expect(() => unmount()).not.toThrow();
  });

  // jsdom measures everything as 0, so embla sees a single page.
  it('has nowhere to scroll when nothing overflows', () => {
    render(
      <Carousel label="限時搶購">
        <div>商品一</div>
      </Carousel>,
    );

    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: '下一頁' })
        .disabled,
    ).toBe(true);
  });
});
