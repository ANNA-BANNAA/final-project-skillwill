export function Pagination({ page, limit, total, totalPages, onChange }) {
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <nav className="pagination" aria-label="გვერდები">
      <p>ნაჩვენებია {from}–{to}, სულ {total}</p>
      <div className="pagination-buttons">
        <button className="btn btn-secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          წინა
        </button>
        <span>{page} / {totalPages}</span>
        <button className="btn btn-secondary" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          შემდეგ
        </button>
      </div>
    </nav>
  );
}