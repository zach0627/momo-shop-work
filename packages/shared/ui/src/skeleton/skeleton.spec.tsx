import { render, screen } from '@testing-library/react';

import { ProductCardSkeleton, Skeleton } from './skeleton';

describe('Skeleton', () => {
  // 佔位色塊是裝飾：「正在載入」由呼叫端的 role="status" 告知
  it('is hidden from assistive technology and takes the size it is given', () => {
    const { container } = render(<Skeleton className="h-10 w-20" />);

    const block = container.firstElementChild;
    expect(block?.getAttribute('aria-hidden')).toBe('true');
    expect(block?.className).toContain('h-10 w-20');
  });
});

describe('ProductCardSkeleton', () => {
  it('stands in for a card without exposing a heading, a link or a price', () => {
    const { container } = render(<ProductCardSkeleton />);

    // 先確認真的有畫出東西，「沒有標題」才有意義
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBe(1);
    expect(container.firstElementChild?.children.length).toBeGreaterThan(1);
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
    expect(container.textContent).toBe('');
  });

  it('puts the image beside the text in the horizontal layout', () => {
    const vertical = render(<ProductCardSkeleton />);
    const horizontal = render(<ProductCardSkeleton layout="horizontal" />);

    expect(vertical.container.firstElementChild?.className).not.toContain(
      'flex ',
    );
    expect(horizontal.container.firstElementChild?.className).toContain(
      'flex ',
    );
  });
});
