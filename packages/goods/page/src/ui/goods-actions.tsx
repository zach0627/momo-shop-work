// class 要寫完整字串，Tailwind 才掃得到
const ACTIONS = [
  { label: '直接購買', className: 'bg-action-primary' },
  { label: '放入購物車', className: 'bg-action-cart' },
  { label: '加入追蹤', className: 'bg-action-neutral' },
];

/** 三顆按鈕刻意不綁任何行為（展示用頁面）。有 spec 守著：要接上行為得先改測試。 */
export function GoodsActions() {
  return (
    <div className="flex gap-3">
      {ACTIONS.map(({ label, className }) => (
        <button
          key={label}
          type="button"
          className={`${className} text-ec-md text-on-action h-action focus-visible:outline-ink w-40 rounded-none font-semibold focus-visible:outline-2 focus-visible:outline-offset-2`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
