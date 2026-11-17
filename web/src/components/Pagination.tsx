interface Props {
  page: number;
  totalPages: number;
  total: number;
  onChange: (page: number) => void;
}

/** Pages are 1-based to match the API. */
export function Pagination({ page, totalPages, total, onChange }: Props) {
  return (
    <div className="pagination">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ← Newer
      </button>
      <span className="muted">
        Page {page} of {totalPages} · {total} transactions
      </span>
      <button disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Older →
      </button>
    </div>
  );
}
