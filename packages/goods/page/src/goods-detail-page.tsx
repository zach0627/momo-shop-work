export interface GoodsDetailPageProps {
  /** Comes from the route. Reading the URL is the app's job, not this package's. */
  goodsId: string;
}

/** Walking-skeleton placeholder. Proves the id travels from the URL to the page. */
export function GoodsDetailPage({ goodsId }: GoodsDetailPageProps) {
  return (
    <section className="max-w-shop mx-auto w-full px-4 py-8">
      <h1 className="text-ec-xl font-bold text-ink">商品詳情</h1>
      <p className="mt-2 text-ec-sm text-ink-muted">
        品號：<span className="text-ink">{goodsId}</span>
      </p>
    </section>
  );
}
