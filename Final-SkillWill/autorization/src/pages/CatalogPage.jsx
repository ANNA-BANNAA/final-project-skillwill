import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import { CATEGORY } from "../config";
import { ProductCard } from "../components/ProductCard";
import { Skeleton } from "../components/Skeleton";
import { FilterPanel } from "../components/FilterPanel";
import { Pagination } from "../components/Pagination";
import { Button } from "../components/Button";

const SORTS = [
  { value: "newest", label: "უახლესი" },
  { value: "oldest", label: "უძველესი" },
  { value: "price-sb", label: "ფასი: ზრდადი" },
  { value: "price-bs", label: "ფასი: კლებადი" },
  { value: "rating", label: "რეიტინგი" },
  { value: "popular", label: "პოპულარული" },
  { value: "title", label: "სახელი: ა-ჰ" },
];

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const topRef = useRef(null);

  const [filters, setFilters] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  // ძებნის ველი: ცალკე ტექსტი, URL-ში debounce-ით ჩაიწერება
  const [search, setSearch] = useState(searchParams.get("q") || "");

  // 1. ფილტრები სერვერიდან, ერთხელ
  useEffect(() => {
    api.category(CATEGORY).then((result) => setFilters(result.filters || []));
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

  // 3. ძებნა debounce-ით (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if ((searchParams.get("q") || "") !== search) {
        updateParam("q", search);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

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

  return (
    <main className="catalog" ref={topRef}>
      <h1>სამზარეულო</h1>

      <div className="toolbar">
        <input
          className="input"
          type="search"
          placeholder="ძებნა..."
          aria-label="ძებნა"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input"
          aria-label="სორტირება"
          value={searchParams.get("sort") || "newest"}
          onChange={(e) => updateParam("sort", e.target.value)}
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="layout">
        <FilterPanel
          filters={filters}
          params={searchParams}
          onChange={updateParam}
          onClear={clearAll}
        />

        <section>
          {loading && !data && <Skeleton />}

          {error && (
            <div className="state-box">
              <p>პროდუქტები ვერ ჩაიტვირთა</p>
              <Button onClick={() => setRetry(retry + 1)}>ხელახლა ცდა</Button>
            </div>
          )}

          {!error && data && data.items.length === 0 && (
            <div className="state-box">
              <p>ვერაფერი მოიძებნა</p>
              <Button onClick={clearAll}>გასუფთავება</Button>
            </div>
          )}

          {!error && data && data.items.length > 0 && (
            <>
              <div className={loading ? "grid grid-loading" : "grid"}>
                {data.items.map((product) => (
                  <ProductCard key={product.id || product.slug} product={product} />
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