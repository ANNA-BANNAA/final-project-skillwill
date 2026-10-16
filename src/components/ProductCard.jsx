import { Link } from "react-router-dom";

export function ProductCard({ product }) {
  const hasDiscount = product.oldPrice && product.discountPercent;

  return (
    <Link to={"/product/" + product.slug} className="card">
      <img
        className="card-image"
        src={product.image}
        alt={product.title}
        loading="lazy"
      />

      <div className="card-body">
        <p className="card-brand">{product.brand}</p>
        <h3 className="card-title">{product.title}</h3>

        <div className="card-price">
          <strong>{product.price} ₾</strong>
          {hasDiscount && (
            <>
              <s className="card-old-price">{product.oldPrice} ₾</s>
              <span className="card-discount">-{product.discountPercent}%</span>
            </>
          )}
        </div>

        <p className="card-rating">
          ★ {product.rating} ({product.reviewsCount})
        </p>

        <p className={product.inStock ? "in-stock" : "out-of-stock"}>
          {product.inStock ? "მარაგშია" : "არ არის მარაგში"}
        </p>
      </div>
    </Link>
  );
}