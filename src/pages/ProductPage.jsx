import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../useAuth";
import { useCart } from "../useCart";
import { Button } from "../components/Button";
import { Alert } from "../components/Alert";
import { ProductCard } from "../components/ProductCard";

function price(value, currency) {
  const symbol = !currency || currency === "GEL" ? "₾" : currency;
  return Number(value).toLocaleString("en-US") + " " + symbol;
}

function Stars({ rating }) {
  const full = Math.round(rating || 0);
  return (
    <span className="stars" aria-label={"რეიტინგი " + rating + " 5-დან"}>
      {"★".repeat(full)}
      {"☆".repeat(5 - full)}
    </span>
  );
}

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
  const [cartError, setCartError] = useState("");

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
          <p>პროდუქტი ვერ მოიძებნა</p>
          <Button onClick={() => navigate("/")}>კატალოგში დაბრუნება</Button>
        </div>
      </main>
    );
  }

  if (error === "network") {
    return (
      <main className="catalog">
        <div className="state-box">
          <p>ვერ ჩაიტვირთა</p>
          <Button onClick={() => { setError(null); setRetry(retry + 1); }}>
            თავიდან ცდა
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
    setCartError("");
    const result = await add(product.id, qty);
    setAdding(false);
    if (result.ok) {
      setAdded(true);
    } else if (result.error?.code === "INSUFFICIENT_STOCK" || result.error?.code === "OUT_OF_STOCK") {
      setCartError("მარაგში საკმარისი რაოდენობა არ არის");
    } else {
      setCartError(result.error?.message || "დაფიქსირდა შეცდომა");
    }
  }

  return (
    <main className="catalog">
      {/* Breadcrumbs */}
      <nav className="breadcrumbs" aria-label="breadcrumbs">
        <Link to="/">მთავარი</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link to="/">{product.category.name}</Link>
            <span>/</span>
          </>
        )}
        <span aria-current="page">{product.title}</span>
      </nav>

      <div className="product">
        {/* გალერეა */}
        <div onKeyDown={onGalleryKey}>
          {images.length > 0 && (
            <img
              className="product-main-image"
              src={images[active]}
              alt={product.title + " — სურათი " + (active + 1) + " / " + images.length}
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
                  aria-label={"სურათი " + (i + 1)}
                  aria-current={i === active}
                >
                  <img
                    src={src}
                    alt={product.title + " — სურათი " + (i + 1) + " / " + images.length}
                    loading="lazy"
                  />
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
                <span className="muted"> ({product.reviewsCount} შეფასება)</span>
              )}
            </p>
          )}

          <div className="product-price-row">
            <strong className="product-price">{price(product.price, product.currency)}</strong>
            {product.oldPrice && (
              <>
                <s className="card-old-price">{price(product.oldPrice, product.currency)}</s>
                <span className="discount-badge">-{product.discountPercent}%</span>
              </>
            )}
          </div>

          {outOfStock ? (
            <p className="out-of-stock">ამოწურულია</p>
          ) : product.stock <= 5 ? (
            <p className="out-of-stock">დარჩა მხოლოდ {product.stock}</p>
          ) : (
            <p className="in-stock">მარაგშია</p>
          )}

          {product.warrantyMonths > 0 && <p>გარანტია {product.warrantyMonths} თვე</p>}
          {product.description && <p>{product.description}</p>}

          {/* რაოდენობა და კალათა */}
          <div className="product-buy">
            <div className="stepper">
              <button
                type="button"
                aria-label="შემცირება"
                disabled={outOfStock || qty <= 1}
                onClick={() => setQty(qty - 1)}
              >
                −
              </button>
              <span aria-live="polite">{qty}</span>
              <button
                type="button"
                aria-label="გაზრდა"
                disabled={outOfStock || qty >= maxQty}
                onClick={() => setQty(qty + 1)}
              >
                +
              </button>
            </div>
            <Button loading={adding} disabled={outOfStock || adding} onClick={addToCart}>
              {outOfStock ? "ამოწურულია" : "კალათაში დამატება"}
            </Button>
          </div>

          {added && (
            <Alert variant="success">
              დაემატა კალათაში. <Link to="/cart">კალათის ნახვა</Link>
            </Alert>
          )}
          {cartError && <Alert variant="error">{cartError}</Alert>}
        </div>
      </div>

      {/* მახასიათებლები: სერვერი ამბობს, რა დახატო */}
      {specs.length > 0 && (
        <>
          <h2>მახასიათებლები</h2>
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
          <h2>მსგავსი პროდუქტები</h2>
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