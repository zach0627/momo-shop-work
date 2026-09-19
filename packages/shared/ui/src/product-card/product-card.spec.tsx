import { render, screen, within } from '@testing-library/react';

import { LinkProvider, type AppLinkProps } from '../link/link';
import { ProductCard, type ProductCardItem } from './product-card';

const iphone: ProductCardItem = {
  name: '【Apple】iPhone 18 Pro Max',
  imageUrl: 'assets/home/best-sellers/15687497_OL_m.webp',
  price: 49900,
  originalPrice: 49999,
};

describe('ProductCard', () => {
  it.each(['vertical', 'horizontal'] as const)(
    'shows the image, the name and the price in the %s layout',
    (layout) => {
      const { container } = render(
        <ProductCard item={iphone} href="/goods/15687497" layout={layout} />,
      );

      expect(screen.getByText('【Apple】iPhone 18 Pro Max')).toBeTruthy();
      expect(screen.getByText('49,900')).toBeTruthy();
      expect(container.querySelector('img')?.getAttribute('src')).toBe(
        'assets/home/best-sellers/15687497_OL_m.webp',
      );
    },
  );

  it('is one link to the given href, holding the image and the name', () => {
    render(<ProductCard item={iphone} href="/goods/15687497" />);

    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/goods/15687497');
    expect(link.querySelector('img')).not.toBeNull();
    expect(within(link).getByText('【Apple】iPhone 18 Pro Max')).toBeTruthy();
  });

  // 名稱就在同一個連結裡，圖再寫 alt 會被念兩次
  it('treats the image as decoration', () => {
    const { container } = render(<ProductCard item={iphone} href="/" />);

    expect(container.querySelector('img')?.getAttribute('alt')).toBe('');
  });

  it('navigates through the link component the app injected', () => {
    function InjectedLink({ href, children, ...rest }: AppLinkProps) {
      return (
        <a href={href} data-injected="true" {...rest}>
          {children}
        </a>
      );
    }

    render(
      <LinkProvider component={InjectedLink}>
        <ProductCard item={iphone} href="/goods/15687497" />
      </LinkProvider>,
    );

    expect(screen.getByRole('link').getAttribute('data-injected')).toBe('true');
  });

  // 規格 home-page：商品卡顯示售價與原價
  it('strikes the original price through when the product has one', () => {
    const { container } = render(<ProductCard item={iphone} href="/" />);

    expect(container.querySelector('del')?.textContent).toBe('$49,999');
  });

  it('shows only the price when the product has no original price', () => {
    const { container } = render(
      <ProductCard
        item={{ name: '鎂30補給水', imageUrl: 'water.webp', price: 590 }}
        href="/"
      />,
    );

    expect(screen.getByText('590')).toBeTruthy();
    expect(container.querySelector('del')).toBeNull();
  });

  it('shows a promo line only when one is given', () => {
    const { rerender } = render(
      <ProductCard item={iphone} href="/" promoText="APP購機加保2年" />,
    );
    expect(screen.getByText('APP購機加保2年')).toBeTruthy();

    rerender(<ProductCard item={iphone} href="/" />);
    expect(screen.queryByText('APP購機加保2年')).toBeNull();
  });

  // footer 可能放按鈕，而按鈕放在連結裡是無效的 HTML
  it('renders the footer outside the link', () => {
    render(
      <ProductCard
        item={iphone}
        href="/"
        footer={<button type="button">搶</button>}
      />,
    );

    const button = screen.getByRole('button', { name: '搶' });
    expect(screen.getByRole('link').contains(button)).toBe(false);
  });

  // 編譯期檢查：欄位更多的 domain 物件可以直接傳入（由 typecheck 把關）
  it('accepts any object that has at least the fields of ProductCardItem', () => {
    const product = {
      id: '15687497',
      name: '【Apple】iPhone 18 Pro Max',
      imageUrl: 'iphone.webp',
      images: ['iphone.webp'],
      price: 49900,
      description: ['6.9 吋'],
    };

    render(<ProductCard item={product} href="/goods/15687497" />);

    expect(screen.getByText('49,900')).toBeTruthy();
  });
});
