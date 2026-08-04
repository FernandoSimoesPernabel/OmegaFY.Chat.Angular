export type CursorPagination<TCursor> = {
    take: number;
    cursor: TCursor | undefined;
};