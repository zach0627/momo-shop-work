/** 一列 5 件；要和 grid 的 grid-cols-5 一致。 */
export const COLUMNS = 5;

/** 一開始顯示幾列，也是每次「看更多」增加幾列。 */
export const ROWS_PER_LOAD = 3;

/** 一次請求一定是整列：15 件。 */
export const PAGE_SIZE = COLUMNS * ROWS_PER_LOAD;
