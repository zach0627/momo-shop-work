import { Countdown } from './countdown';

/** 粉色標題列：左邊火焰 + 標題，右邊倒數。真站這一列是一張圖，這裡用文字與 token 重現。 */
export function FlashSaleHeader({
  title,
  endsAt,
}: {
  title: string;
  endsAt: string;
}) {
  return (
    <div className="bg-surface-sale flex h-17.5 items-center justify-between px-4">
      <h2 className="text-ec-title text-ink-strong flex items-center gap-1 font-bold">
        {/* Heroicons「fire」（MIT） */}
        <svg
          viewBox="0 0 24 24"
          className="size-6"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.546 3.75 3.75 0 0 1 3.255 3.718Z"
          />
        </svg>
        {title}
      </h2>
      <p className="text-ec-xl text-ink flex items-center gap-2">
        倒數
        <Countdown endsAt={endsAt} />
      </p>
    </div>
  );
}
