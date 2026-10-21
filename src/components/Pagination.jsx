import { useLang } from "../useLang";
import { Button } from "./Button";

export function Pagination({ page, limit, total, totalPages, onChange }) {
  const { t } = useLang();
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <nav className="pagination" aria-label={t("catalog.pagination")}>
      <p>{t("catalog.showing", { from, to, total })}</p>
      <div className="pagination-buttons">
        <Button variant="secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          {t("catalog.prev")}
        </Button>
        <span>
          {page} / {totalPages}
        </span>
        <Button variant="secondary" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          {t("catalog.next")}
        </Button>
      </div>
    </nav>
  );
}