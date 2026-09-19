/** The grid is 5 products wide. `grid-cols-5` in the grid must agree. */
export const COLUMNS = 5;

/** How many rows the section opens with, and how many "看更多" adds. */
export const ROWS_PER_LOAD = 3;

/** One request is always whole rows: 15 products. */
export const PAGE_SIZE = COLUMNS * ROWS_PER_LOAD;
