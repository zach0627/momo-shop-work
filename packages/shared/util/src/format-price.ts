// The locale is pinned: the separator must not follow the machine's locale.
const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

/**
 * 49900 -> "49,900". Prices are whole TWD; the currency sign is left to the
 * caller, because where it sits and how big it is belongs to the design.
 */
export function formatPrice(amount: number): string {
  return formatter.format(amount);
}
