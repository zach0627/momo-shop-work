import { render, screen } from '@testing-library/react';

import { installCarouselTestEnvironment } from '../testing';
import { Carousel } from './carousel';

// 用真的 embla 掛載一次：套件升級改了 API 時，這份會先發現（carousel.spec 用的是假的 embla）

/** 輪播本身也是 group；slide 是 aria-roledescription="slide" 的那些。 */
const getSlides = () =>
  screen
    .getAllByRole('group')
    .filter((node) => node.getAttribute('aria-roledescription') === 'slide');

describe('Carousel with the real embla', () => {
  let uninstall: () => void;

  beforeAll(() => {
    uninstall = installCarouselTestEnvironment();
  });

  afterAll(() => {
    uninstall();
  });

  it('mounts, renders its slides and unmounts without throwing', () => {
    const { unmount } = render(
      <Carousel label="限時搶購" perView={2} gap={10} dots loop>
        <div>商品一</div>
        <div>商品二</div>
        <div>商品三</div>
      </Carousel>,
    );

    expect(screen.getByRole('group', { name: '限時搶購' })).toBeTruthy();
    expect(getSlides()).toHaveLength(3);
    expect(() => unmount()).not.toThrow();
  });

  // jsdom 量到的尺寸都是 0，embla 只會看到一頁
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
