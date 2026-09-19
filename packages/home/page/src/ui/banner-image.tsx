import type { Banner } from '@momo/home-data-access';

/** banner 只是圖、不是連結。width / height 讓瀏覽器先留好位置，輪播載入時不會跳動。 */
export function BannerImage({
  banner,
  eager = false,
  className = '',
}: {
  banner: Banner;
  /** 一開始就看得到的圖設為 true；其餘延遲載入。 */
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
