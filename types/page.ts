export interface PageResult<T> {
  rows: T;
  count: number;
}

export interface Paging {
  page: number;
  pageSize: number;
}