import { memo } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../useLang";
import { formatPrice } from "../intl";
import { AddToCartButton } from "./AddToCartButton";

function ProductCardBase({ product, priority = false }) {
  const { lang, t } = useLang();
  const hasDiscount = product.oldPrice && product.discountPercent;
  const inStock = product.inStock !== false;
  const money = (value) => formatPrice(value, lang, product.currency || "GEL");

  return (
    <div className="card">
      <Link to={"/product/" + product.slug} className="card-link">
        {/* priority: პირველი რიგის ბარათები LCP-ს ქმნის, ამიტომ lazy არ არის */}
        <img
          className="card-image"
          src={product.image}
          alt={product.title}
          width="700"
          height="700"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
        />

        <div className="card-body">
          {product.brand && <p className="card-brand">{product.brand}</p>}
          <h2 className="card-title">{product.title}</h2>

          <div className="card-price">
            <strong>{money(product.price)}</strong>
            {hasDiscount && (
              <>
                <s className="card-old-price">{money(product.oldPrice)}</s>
                <span className="card-discount">-{product.discountPercent}%</span>
              </>
            )}
          </div>

          <p
            className="card-rating"
            aria-label={
              t("product.rating", { rating: product.rating }) +
              ", " +
              t("product.reviews", { count: product.reviewsCount })
            }
          >
            ★ {product.rating} ({product.reviewsCount})
          </p>

          <p className={inStock ? "in-stock" : "out-of-stock"}>
            {inStock ? t("product.inStock") : t("product.outOfStock")}
          </p>
        </div>
      </Link>

      <div className="card-actions">
        <AddToCartButton productId={product.id} disabled={!inStock} />
      </div>
    </div>
  );
}

// memo: ძებნის ველში აკრეფისას ბარათები ხელახლა არ იხატება, თუ მათი props არ შეცვლილა
export const ProductCard = memo(ProductCardBase);