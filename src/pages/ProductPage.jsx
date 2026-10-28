import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../useAuth";
import { useCart } from "../useCart";
import { useLang } from "../useLang";
import { formatPrice } from "../intl";
import { Button } from "../components/Button";
import { Alert } from "../components/Alert";
import { ProductCard } from "../components/ProductCard";

// სერვერის კოდი → თარგმანის გასაღები
const CART_ERRORS = {
  OUT_OF_STOCK: "cart.errors.outOfStock",
  INSUFFICIENT_STOCK: "cart.errors.insufficientStock",
  PRODUCT_NOT_FOUND: "cart.errors.notFound",
};

function Stars({ rating }) {
  const { t } = useLang();
  const full = Math.round(rating || 0);
  return (
    <span className="stars" role="img" aria-label={t("product.rating", { rating })}>
      {"★".repeat(full)}
      {"☆".repeat(5 - full)}
    </span>
  );
}

// ზომები იგივეა, რაც ნამდვილ გვერდზე: ჩატვირთვისას ლეიაუთი არ ხტება (CLS)
function ProductSkeleton() {
  return (
    <main className="catalog" aria-busy="true">
      <div className="product">
        <div className="skeleton-block product-main-image" />
        <div className="product-info">
          <div className="skeleton-line" style={{ margin: 0, height: 28 }} />
          <div className="skeleton-line short" style={{ margin: 0 }} />
          <div className="skeleton-line short" style={{ margin: 0, height: 32 }} />
        </div>
      </div>
    </main>
  );
}

function ProductView({ slug }) {
  const { lang, t } = useLang();
  const { status } = useAuth();
  const { add } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null); // "notfound" | "network"
  const [retry, setRetry] = useState(0);
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [cartErrorKey, setCartErrorKey] = useState("");

  // სქროლი ზემოთ ახალ პროდუქტზე გადასვლისას
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [slug]);

  useEffect(() => {
    const controller = new AbortController();
    api
      .product(slug, controller.signal)
      .then((data) => setProduct(data.product || data))
      .catch((e) => {
        if (e.name === "AbortError") return;
        setError(e.code === "PRODUCT_NOT_FOUND" || e.status === 404 ? "notfound" : "network");
      });
    return () => controller.abort();
  }, [slug, retry]);

  // ჩანართის სათაური
  useEffect(() => {
    if (product) document.title = product.title + " — Kitchen Shop";
    return () => {
      document.title = "Kitchen Shop";
    };
  }, [product]);

  if (error === "notfound") {
    return (
      <main className="catalog">
        <div className="state-box">
          <p>{t("product.notFound")}</p>
          <Button onClick={() => navigate("/")}>{t("product.backToCatalog")}</Button>
        </div>
      </main>
    );
  }

  if (error === "network") {
    return (
      <main className="catalog">
        <div className="state-box">
          <p>{t("product.loadError")}</p>
          <Button
            onClick={() => {
              setError(null);
              setRetry(retry + 1);
            }}
          >
            {t("product.retry")}
          </Button>
        </div>
      </main>
    );
  }

  if (!product) return <ProductSkeleton />;

  const images = product.images?.length ? product.images : product.image ? [product.image] : [];
  const maxQty = Math.max(1, Math.min(product.stock ?? 99, 99));
  const outOfStock = product.inStock === false;
  const specs = Object.entries(product.specs || {});
  const money = (value) => formatPrice(value, lang, product.currency || "GEL");
  const categoryName = product.category
    ? (lang === "en" ? product.category.nameEn : null) || product.category.name
    : "";

  function imageAlt(i) {
    return product.title + " — " + t("product.imageOf", { n: i + 1, total: images.length });
  }

  function showImage(index) {
    setActive((index + images.length) % images.length);
  }

  function onGalleryKey(e) {
    if (e.key === "ArrowLeft") showImage(active - 1);
    if (e.key === "ArrowRight") showImage(active + 1);
  }

  async function addToCart() {
    if (status !== "authenticated") {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    setAdding(true);
    setAdded(false);
    setCartErrorKey("");
    const result = await add(product.id, qty);
    setAdding(false);
    if (result.ok) setAdded(true);
    else setCartErrorKey(CART_ERRORS[result.error?.code] || "cart.errors.generic");
  }

  return (
    <main className="catalog">
      {/* Breadcrumbs */}
      <nav className="breadcrumbs" aria-label={t("product.breadcrumbs")}>
        <Link to="/">{t("product.home")}</Link>
        <span aria-hidden="true">/</span>
        {categoryName && (
          <>
            <Link to="/">{categoryName}</Link>
            <span aria-hidden="true">/</span>
          </>
        )}
        <span aria-current="page">{product.title}</span>
      </nav>

      <div className="product">
        {/* გალერეა */}
        <div onKeyDown={onGalleryKey}>
          {images.length > 0 && (
            // LCP-სურათი: lazy არა, მაღალი პრიორიტეტი, ფიქსირებული ზომა
            <img
              className="product-main-image"
              src={images[active]}
              alt={imageAlt(active)}
              width="700"
              height="700"
              fetchPriority="high"
              decoding="async"
            />
          )}
          {images.length > 1 && (
            <div className="product-thumbs">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  className={i === active ? "thumb thumb-active" : "thumb"}
                  onClick={() => setActive(i)}
                  aria-label={imageAlt(i)}
                  aria-current={i === active}
                >
                  {/* მინიატურა დეკორატიულია: სახელი ღილაკს აქვს */}
                  <img src={src} alt="" width="64" height="64" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ინფორმაცია */}
        <div className="product-info">
          {product.brand && <p className="card-brand">{product.brand}</p>}
          <h1>{product.title}</h1>

          {product.rating !== undefined && (
            <p className="product-rating">
              <Stars rating={product.rating} /> {product.rating}
              {product.reviewsCount !== undefined && (
                <span className="muted"> ({t("product.reviews", { count: product.reviewsCount })})</span>
              )}
            </p>
          )}

          <div className="product-price-row">
            <strong className="product-price">{money(product.price)}</strong>
            {product.oldPrice && (
              <>
                <s className="card-old-price">{money(product.oldPrice)}</s>
                <span className="discount-badge">-{product.discountPercent}%</span>
              </>
            )}
          </div>

          {outOfStock ? (
            <p className="out-of-stock">{t("product.outOfStock")}</p>
          ) : product.stock <= 5 ? (
            <p className="out-of-stock">{t("product.onlyLeft", { count: product.stock })}</p>
          ) : (
            <p className="in-stock">{t("product.inStock")}</p>
          )}

          {product.warrantyMonths > 0 && (
            <p>{t("product.warranty", { count: product.warrantyMonths })}</p>
          )}
          {product.description && <p>{product.description}</p>}

          {/* რაოდენობა და კალათა */}
          <div className="product-buy">
            <div className="stepper">
              <button
                type="button"
                aria-label={t("product.decrease")}
                disabled={outOfStock || qty <= 1}
                onClick={() => setQty(qty - 1)}
              >
                −
              </button>
              <span aria-live="polite">{qty}</span>
              <button
                type="button"
                aria-label={t("product.increase")}
                disabled={outOfStock || qty >= maxQty}
                onClick={() => setQty(qty + 1)}
              >
                +
              </button>
            </div>
            <Button loading={adding} disabled={outOfStock || adding} onClick={addToCart}>
              {outOfStock ? t("product.outOfStock") : t("cart.add")}
            </Button>
          </div>

          {added && (
            <Alert variant="success">
              {t("cart.added")}. <Link to="/cart">{t("product.viewCart")}</Link>
            </Alert>
          )}
          {cartErrorKey && <Alert variant="error">{t(cartErrorKey)}</Alert>}
        </div>
      </div>

      {/* მახასიათებლები: სერვერი ამბობს, რა დახატო (API ერთენოვანია: ქართულად რჩება) */}
      {specs.length > 0 && (
        <>
          <h2>{t("product.specs")}</h2>
          <table className="specs">
            <tbody>
              {specs.map(([key, value]) => (
                <tr key={key}>
                  <th scope="row">{key}</th>
                  <td>{String(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* მსგავსი პროდუქტები: იგივე ბარათი, რაც კატალოგში */}
      {product.related?.length > 0 && (
        <>
          <h2>{t("product.related")}</h2>
          <div className="grid">
            {product.related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}

export default function ProductPage() {
  const { slug } = useParams();
  // key={slug}: სხვა პროდუქტზე გადასვლისას მდგომარეობა (სურათი, რაოდენობა) თავიდან იწყება
  return <ProductView key={slug} slug={slug} />;
}