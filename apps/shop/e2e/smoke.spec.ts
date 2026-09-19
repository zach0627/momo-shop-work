import { expect, test } from '@playwright/test';

// 單元與整合測試在 jsdom 裡跑，沒有排版、沒有真的導頁。這裡用真的瀏覽器走一次主要路徑。
test.describe('storefront smoke', () => {
  // 規格 home-page：點擊商品卡；規格 goods-detail：與首頁卡片為同一件商品
  test('goes from a home page card to its detail page and back', async ({
    page,
  }) => {
    await page.goto('/');

    const rail = page.getByRole('region', { name: '降價好貨' });
    const card = rail.getByRole('article').first();
    const name = await card.getByRole('heading').innerText();
    const href = await card.getByRole('link').getAttribute('href');
    expect(href).toMatch(/^\/goods\/\w+$/);

    await card.getByRole('link').click();

    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(name);
    await expect(
      page.getByRole('button', { name: /直接購買|放入購物車|加入追蹤/ }),
    ).toHaveCount(3);
    // 外框跨頁保留
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();

    await page
      .getByRole('banner')
      .getByRole('link', { name: /momo/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('region', { name: '主要活動' })).toBeVisible();
  });

  // jsdom 測不到的：輪播真的會捲
  test('pages a product rail forward', async ({ page }) => {
    await page.goto('/');

    const rail = page.getByRole('region', { name: '降價好貨' });
    const first = rail.getByRole('article').first();
    // 商品列在第一屏下面：先捲到它，才談得上「在不在視窗內」
    await rail.scrollIntoViewIfNeeded();
    await expect(first).toBeInViewport();

    await rail.getByRole('button', { name: '下一頁' }).click();

    await expect(first).not.toBeInViewport();
    await expect(rail.getByRole('button', { name: '上一頁' })).toBeEnabled();
  });

  // 規格 goods-detail：開啟不存在的商品
  test('shows a way home for a product that does not exist', async ({
    page,
  }) => {
    await page.goto('/goods/no-such-goods');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      '找不到商品',
    );
    // 外框的搜尋與分類按鈕還在；頁面本身沒有任何按鈕
    await expect(page.getByRole('main').getByRole('button')).toHaveCount(0);
    await page.getByRole('main').getByRole('link', { name: '回首頁' }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});
