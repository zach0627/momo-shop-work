import { render, screen, within } from '@testing-library/react';

import type {
  CatalogRepository,
  FlashSaleItem,
} from '@momo/catalog-data-access';
import {
  CatalogTestProvider,
  createFakeCatalogRepository,
} from '@momo/catalog-data-access/testing';
import { installCarouselTestEnvironment } from '@momo/shared-ui/testing';

import { FlashSale } from './flash-sale';

const makeItems = (count: number): FlashSaleItem[] =>
  Array.from({ length: count }, (_, index) => {
    const id = String(2000 + index);
    return {
      id,
      name: `搶購商品 ${index + 1}`,
      imageUrl: `${id}.webp`,
      images: [`${id}.webp`],
      price: 2998,
      originalPrice: 4995,
      promoText: '歷史低價',
      stockLeft: 484,
      description: [],
    };
  });

const END = '2026-09-19T15:00:00.000Z';

function renderWith(getFlashSale: CatalogRepository['getFlashSale']) {
  return render(
    <CatalogTestProvider
      repository={createFakeCatalogRepository({ getFlashSale })}
    >
      <FlashSale title="限時搶購" />
    </CatalogTestProvider>,
  );
}

const pages = () =>
  screen
    .getAllByRole('group')
    .filter((node) => node.getAttribute('aria-roledescription') === 'slide');

describe('FlashSale', () => {
  let uninstall: () => void;

  beforeAll(() => {
    uninstall = installCarouselTestEnvironment();
  });

  afterAll(() => {
    uninstall();
  });

  // 規格 home-page：限時搶購商品顯示限搶價與剩餘組數
  it('shows the sale price, the struck original price and the stock left', async () => {
    renderWith(async () => ({ endsAt: END, items: makeItems(1) }));

    const card = (await screen.findByText('搶購商品 1')).closest('article');
    expect(card).not.toBeNull();
    const inCard = within(card as HTMLElement);
    expect(inCard.getByText('限搶價')).toBeTruthy();
    expect(inCard.getByText('2,998')).toBeTruthy();
    expect(card?.querySelector('del')?.textContent).toBe('$4,995');
    expect(inCard.getByText('最後484組')).toBeTruthy();
    expect(inCard.getByText('歷史低價')).toBeTruthy();
    expect(inCard.getByRole('link').getAttribute('href')).toBe('/goods/2000');
  });

  // 規格 home-page：每頁 2 列、每列 5 件；超過 10 件可換頁
  it('pages the products ten at a time, the last page shorter', async () => {
    renderWith(async () => ({ endsAt: END, items: makeItems(29) }));

    await screen.findByText('搶購商品 1');
    expect(
      pages().map((page) => within(page).getAllByRole('article').length),
    ).toEqual([10, 10, 9]);
    // 下一頁的第一件是第 11 件：沒有商品被跳過或重複
    expect(within(pages()[1]).getAllByRole('heading')[0].textContent).toBe(
      '搶購商品 11',
    );
  });

  it('is a section named by its title, with a countdown to the end', async () => {
    renderWith(async () => ({ endsAt: END, items: makeItems(3) }));

    const section = await screen.findByRole('region', { name: '限時搶購' });
    expect(
      await within(section).findByRole('heading', {
        level: 2,
        name: '限時搶購',
      }),
    ).toBeTruthy();
    expect(within(section).getByRole('timer')).toBeTruthy();
  });

  // 規格 home-page：區塊的商品載入中
  it('stands in for a page of ten cards until the sale arrives', async () => {
    let deliver: (sale: {
      endsAt: string;
      items: FlashSaleItem[];
    }) => void = () => undefined;
    renderWith(
      () =>
        new Promise((resolve) => {
          deliver = resolve;
        }),
    );

    const section = screen.getByRole('region', { name: '限時搶購' });
    expect(within(section).getByRole('status').textContent).toBe(
      '限時搶購載入中',
    );
    expect(section.querySelectorAll('[data-card-placeholder]')).toHaveLength(
      10,
    );

    deliver({ endsAt: END, items: makeItems(3) });
    expect(await within(section).findAllByRole('article')).toHaveLength(3);
    expect(within(section).queryByRole('status')).toBeNull();
    expect(section.querySelectorAll('[data-card-placeholder]')).toHaveLength(0);
  });

  it('leaves the page when the sale cannot be loaded', async () => {
    const getFlashSale = vi.fn<CatalogRepository['getFlashSale']>(async () => {
      throw new Error('network');
    });
    const { container } = renderWith(getFlashSale);

    await vi.waitFor(() => expect(getFlashSale).toHaveBeenCalled());
    await vi.waitFor(() => expect(container.textContent).toBe(''));
  });

  it('leaves the page when there is nothing on sale', async () => {
    const getFlashSale = vi.fn<CatalogRepository['getFlashSale']>(async () => ({
      endsAt: END,
      items: [],
    }));
    const { container } = renderWith(getFlashSale);

    await vi.waitFor(() => expect(getFlashSale).toHaveBeenCalled());
    await vi.waitFor(() => expect(container.textContent).toBe(''));
  });
});
