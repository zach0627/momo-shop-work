import { fireEvent, render, screen, within } from '@testing-library/react';

import type { CatalogRepository, Product } from '@momo/catalog-data-access';
import {
  CatalogTestProvider,
  createFakeCatalogRepository,
} from '@momo/catalog-data-access/testing';

import { GoodsDetailPage } from './goods-detail-page';

const iphone: Product = {
  id: '15687497',
  name: '【Apple】iPhone 18 Pro Max (256G/6.9吋)',
  imageUrl: 'assets/home/best-sellers/15687497_OL_m.webp',
  images: ['assets/home/best-sellers/15687497_OL_m.webp'],
  price: 49900,
  originalPrice: 50858,
  promoText: 'APP購機同時加保2年送888',
  description: ['A20 Pro 晶片', '超Retina XDR 顯示器', '4800萬Pro融合相機系統'],
};
const water: Product = {
  id: '8938732',
  name: '【光泉】保久乳 200ml x24',
  imageUrl: 'milk.webp',
  images: ['milk.webp'],
  price: 590,
  description: ['成份無調整'],
};

function repositoryWith(products: Product[]) {
  const getProduct = vi.fn<CatalogRepository['getProduct']>(
    async (id) => products.find((product) => product.id === id) ?? null,
  );
  return {
    repository: createFakeCatalogRepository({ getProduct }),
    getProduct,
  };
}

function renderPage(goodsId: string, repository: CatalogRepository) {
  return render(
    <CatalogTestProvider repository={repository}>
      <GoodsDetailPage goodsId={goodsId} />
    </CatalogTestProvider>,
  );
}

const ACTIONS = ['直接購買', '放入購物車', '加入追蹤'];

describe('GoodsDetailPage', () => {
  // 規格 goods-detail：顯示商品內容
  it('shows the image, the title, the description lines and the price', async () => {
    const { repository, getProduct } = repositoryWith([iphone]);

    renderPage('15687497', repository);

    expect(
      await screen.findByRole('heading', { level: 1, name: iphone.name }),
    ).toBeTruthy();
    expect(getProduct).toHaveBeenCalledWith('15687497');
    expect(
      screen.getByRole('img', { name: iphone.name }).getAttribute('src'),
    ).toBe(iphone.imageUrl);
    expect(
      screen.getAllByRole('listitem').map((item) => item.textContent),
    ).toEqual(iphone.description);
    expect(screen.getByText('49,900')).toBeTruthy();
    expect(screen.getByText('15687497')).toBeTruthy();
  });

  it('strikes the list price through only when the product has one', async () => {
    const { repository } = repositoryWith([iphone, water]);

    const first = renderPage('15687497', repository);
    await screen.findByRole('heading', { level: 1 });
    expect(first.container.querySelector('del')?.textContent).toContain(
      '50,858',
    );
    first.unmount();

    const second = renderPage('8938732', repository);
    await screen.findByRole('heading', { level: 1, name: water.name });
    expect(screen.getByText('590')).toBeTruthy();
    expect(second.container.querySelector('del')).toBeNull();
  });

  // 規格：顯示三顆動作按鈕
  it('has the three action buttons, in order', async () => {
    const { repository } = repositoryWith([iphone]);

    renderPage('15687497', repository);

    await screen.findByRole('heading', { level: 1 });
    expect(
      screen.getAllByRole('button').map((button) => button.textContent),
    ).toEqual(ACTIONS);
  });

  // 規格：動作按鈕不綁任何行為 —— 不導頁、不改畫面、不發請求
  it.each(ACTIONS)(
    'does nothing at all when 「%s」 is clicked',
    async (name) => {
      const { repository, getProduct } = repositoryWith([iphone]);
      const { container } = renderPage('15687497', repository);
      await screen.findByRole('heading', { level: 1 });
      const before = {
        html: container.innerHTML,
        url: window.location.href,
        historyLength: window.history.length,
        requests: getProduct.mock.calls.length,
      };

      const button = screen.getByRole('button', { name });
      fireEvent.click(button);
      fireEvent.click(button);

      expect({
        html: container.innerHTML,
        url: window.location.href,
        historyLength: window.history.length,
        requests: getProduct.mock.calls.length,
      }).toEqual(before);
    },
  );

  // 規格：商品不存在時顯示提示
  it('says the product was not found, without buttons, with a way home', async () => {
    const { repository } = repositoryWith([iphone]);

    renderPage('no-such-goods', repository);

    expect(
      await screen.findByRole('heading', { level: 1, name: '找不到商品' }),
    ).toBeTruthy();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(
      screen.getByRole('link', { name: '回首頁' }).getAttribute('href'),
    ).toBe('/');
  });

  it('says it is loading until the product arrives', async () => {
    let deliver: (product: Product | null) => void = () => undefined;
    const repository = createFakeCatalogRepository({
      getProduct: () =>
        new Promise((resolve) => {
          deliver = resolve;
        }),
    });

    const { container } = renderPage('15687497', repository);
    expect(screen.getByRole('status').textContent).toContain('載入中');
    // 主圖與文字的佔位，版面和載入後相同
    expect(
      container.querySelectorAll('[aria-hidden="true"]').length,
    ).toBeGreaterThan(2);
    expect(screen.queryAllByRole('button')).toHaveLength(0);

    deliver(iphone);
    await screen.findByRole('heading', { level: 1, name: iphone.name });
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('shows an error message when the product cannot be loaded', async () => {
    const repository = createFakeCatalogRepository({
      getProduct: async () => {
        throw new Error('network');
      },
    });

    renderPage('15687497', repository);

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('商品載入失敗');
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  // id 由 props 傳入：從一件商品換到另一件時頁面不會重新掛載，內容要跟著變
  it('follows its goodsId prop', async () => {
    const { repository } = repositoryWith([iphone, water]);
    const { rerender } = renderPage('15687497', repository);
    await screen.findByRole('heading', { level: 1, name: iphone.name });

    rerender(
      <CatalogTestProvider repository={repository}>
        <GoodsDetailPage goodsId="8938732" />
      </CatalogTestProvider>,
    );

    const main = await screen.findByRole('heading', {
      level: 1,
      name: water.name,
    });
    expect(main).toBeTruthy();
    expect(within(document.body).queryByText(iphone.name)).toBeNull();
  });
});
