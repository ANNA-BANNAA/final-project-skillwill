import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import { CATEGORY } from "../config";
import { useLang } from "../useLang";
import { ProductCard } from "../components/ProductCard";
import { Skeleton } from "../components/Skeleton";
import { FilterPanel } from "../components/FilterPanel";
import { Pagination } from "../components/Pagination";
import { Button } from "../components/Button";
import { usePageTitle } from "../usePageTitle";

// ლეიბლები თარგმანის ფაილშია, აქ მხოლოდ გასაღებებია
const SORTS = [
  { value: "newest", key: "catalog.sort.newest" },
  { value: "oldest", key: "catalog.sort.oldest" },
  { value: "price-asc", key: "catalog.sort.priceAsc" },
  { value: "price-desc", key: "catalog.sort.priceDesc" },
  { value: "rating-desc", key: "catalog.sort.rating" },
  { value: "popular", key: "catalog.sort.popular" },
  { value: "title-asc", key: "catalog.sort.title" },
];

export default function CatalogPage() {
  const { lang, t } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();
  const topRef = useRef(null);
  const [category, setCategory] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  // ძებნის ველი: ცალკე ტექსტი, URL-ში debounce-ით ჩაიწერება
  const [search, setSearch] = useState(searchParams.get("q") || "");

  useEffect(() => {
    api
      .category(CATEGORY)
      .then(setCategory)
      .catch(() => setCategory(null));
  }, []);

  // 2. პროდუქტები ყოველ URL-ის ცვლილებაზე
  const query = new URLSearchParams(searchParams);
  query.set("category", CATEGORY);
  const queryString = query.toString();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);

    api
      .products(queryString, controller.signal)
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((e) => {
        if (e.name === "AbortError") return;
        setError(true);
        setLoading(false);
      });

    return () => controller.abort();
  }, [queryString, retry]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams((prev) => {
        if ((prev.get("q") || "") === search) return prev;
        const next = new URLSearchParams(prev);
        if (search) next.set("q", search);
        else next.delete("q");
        next.delete("page");
        return next;
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [search, setSearchParams]);

  // URL-ის პარამეტრის შეცვლა. ნებისმიერ ცვლილებაზე გვერდი 1-ზე ბრუნდება
  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setSearchParams(next);
  }

  function changePage(page) {
    updateParam("page", page === 1 ? "" : String(page));
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function clearAll() {
    setSearch("");
    setSearchParams({});
  }

  // კატეგორიის სახელი: ინგლისურზე nameEn, სხვა შემთხვევაში name
  const title =
    (lang === "en" ? category?.nameEn : category?.name) ?? t("catalog.title");

  usePageTitle(title, t("catalog.description"));

  return (
    <main className="catalog" ref={topRef}>
      <h1>{title}</h1>

      <div className="toolbar">
        <input
          className="input"
          type="search"
          placeholder={t("catalog.search")}
          aria-label={t("catalog.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input"
          aria-label={t("catalog.sort.label")}
          value={searchParams.get("sort") || "newest"}
          onChange={(e) => updateParam("sort", e.target.value)}
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {t(s.key)}
            </option>
          ))}
        </select>
      </div>

      <div className="layout">
        <FilterPanel
          filters={category?.filters ?? []}
          params={searchParams}
          onChange={updateParam}
          onClear={clearAll}
        />

        <section>
          {loading && !data && <Skeleton />}

          {error && (
            <div className="state-box">
              <p>{t("catalog.loadError")}</p>
              <Button onClick={() => setRetry(retry + 1)}>
                {t("catalog.retry")}
              </Button>
            </div>
          )}

          {!error && data && data.items.length === 0 && (
            <div className="state-box">
              <p>{t("catalog.empty")}</p>
              <Button onClick={clearAll}>{t("catalog.clearFilters")}</Button>
            </div>
          )}

          {!error && data && data.items.length > 0 && (
            <>
              <div className={loading ? "grid grid-loading" : "grid"}>
                {data.items.map((product) => (
                  <ProductCard
                    key={product.id || product.slug}
                    product={product}
                  />
                ))}
              </div>
              <Pagination
                page={data.page}
                limit={data.limit}
                total={data.total}
                totalPages={data.totalPages}
                onChange={changePage}
              />
            </>
          )}
        </section>
      </div>
    </main>
  );
}
