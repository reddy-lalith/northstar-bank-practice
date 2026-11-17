export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

export interface Page<T> {
  items: T[];
  /** 1-based page number. */
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PageParams {
  page: number;
  pageSize: number;
}

export function parsePageParams(query: Record<string, unknown>): PageParams {
  const rawPage = parseInt(String(query.page ?? '1'), 10);
  const rawSize = parseInt(String(query.pageSize ?? DEFAULT_PAGE_SIZE), 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const pageSize = Number.isFinite(rawSize)
    ? Math.min(MAX_PAGE_SIZE, Math.max(1, rawSize))
    : DEFAULT_PAGE_SIZE;
  return { page, pageSize };
}

export function paginate<T>(items: T[], page: number, pageSize: number): Page<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = page * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    total,
    totalPages,
  };
}
