// Complete class names, so Tailwind's scanner can see them.
const ACTIONS = [
  { label: '直接購買', className: 'bg-action-primary' },
  { label: '放入購物車', className: 'bg-action-cart' },
  { label: '加入追蹤', className: 'bg-action-neutral' },
];

/**
 * The three action buttons - and deliberately nothing behind them.
 *
 * This page is display-only BY DECISION (see spec goods-detail and the
 * requirement notes): no onClick, no navigation, no state, no request. Cart
 * and checkout are future domains (ADR-0006). A spec clicks each button and
 * checks that the page, the URL and the request count are untouched, so
 * wiring one up is a change that has to be made on purpose.
 */
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
