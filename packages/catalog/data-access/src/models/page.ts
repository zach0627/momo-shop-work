/** One page of an offset-paginated list. */
export interface Page<T> {
  items: T[];
  /** Offset to ask for next, or `null` when this was the last page. */
  nextOffset: number | null;
}
