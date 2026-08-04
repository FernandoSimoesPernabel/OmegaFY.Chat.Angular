export type CursorPaginationResultInfo<TCursor> = {
    nextCursor?: TCursor | null;
    totalOfItemsRemaining: number;
    hasMore: boolean;
};