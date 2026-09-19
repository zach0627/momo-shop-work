// 固定 locale：千分位符號不能跟著機器的語系變
const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

/** 49900 → "49,900"。不含貨幣符號：$ 放哪裡、多大由畫面決定。 */
export function formatPrice(amount: number): string {
  return formatter.format(amount);
}
