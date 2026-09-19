import type { Banner } from '@momo/home-data-access';

/**
 * A banner is an image and nothing else: not a link (spec home-page: 只有
 * 商品卡可點擊). `width` and `height` let the browser reserve the space before
 * the file arrives, so carousels do not jump while they load.
 */
export function BannerImage({
  banner,
  eager = false,
  className = '',
}: {
  banner: Banner;
  /** For what is on screen at first paint. Everything else loads lazily. */
  eager?: boolean;
  className?: string;
}) {
  return (
    <img
      src={banner.imageUrl}
      alt={banner.alt}
      width={banner.width}
      height={banner.height}
      loading={eager ? 'eager' : 'lazy'}
      className={`block h-auto w-full ${className}`}
    />
  );
}
