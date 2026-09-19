/** offset 分頁的一頁。 */
export interface Page<T> {
  items: T[];
  /** 下一頁的 offset；最後一頁為 null。 */
  nextOffset: number | null;
}
