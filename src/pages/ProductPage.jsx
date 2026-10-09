import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { ProductCard } from "../components/ProductCard";
import { Button } from "../components/Button";
import { AddToCartButton } from "../components/AddToCartButton";

export default function ProductPage() {
  const { slug } = useParams(); // URL-იდან: /product/:slug
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setActiveImage(0);
    window.scrollTo(0, 0);

    api
      .product(slug)
      .then((result) => {
        setProduct(result);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [slug, retry]);

  if (loading) {
    return (
      <main className="catalog">
        <p>იტვირთება...</p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="catalog">
        <div className="state-box">
          <p>პროდუქტი ვერ ჩაიტვირთა</p>
          <Button onClick={() => setRetry(retry + 1)}>ხელახლა ცდა</Button>
          <Link to="/">კატალოგში დაბრუნება</Link>
        </div>
      </main>
    );
  }

  const images = product.images || [];
  const specs = Object.entries(product.specs || {});
  const hasDiscount = product.oldPrice && product.discountPercent;

  return (
    <main className="catalog">
      <Link to="/">← კატალოგი</Link>

      <div className="product">
        {/* გალერეა */}
        <div>
          <img
            className="product-main-image"
            src={images[activeImage]}
            alt={product.title}
          />
          <div className="product-thumbs">
            {images.map((src, i) => (
              <button
                key={src}
                className={i === activeImage ? "thumb thumb-active" : "thumb"}
                onClick={() => setActiveImage(i)}
                aria-label={"სურათი " + (i + 1)}
              >
                <img src={src} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        </div>

        {/* ინფორმაცია */}
        <div className="product-info">
          <p className="card-brand">{product.brand}</p>
          <h1>{product.title}</h1>

          <div className="card-price">
            <strong className="product-price">{product.price} ₾</strong>
            {hasDiscount && (
              <>
                <s className="card-old-price">{product.oldPrice} ₾</s>
                <span className="card-discount">
                  -{product.discountPercent}%
                </span>
              </>
            )}
          </div>

          <p className="card-rating">
            ★ {product.rating} ({product.reviewsCount})
          </p>
          <p className={product.inStock ? "in-stock" : "out-of-stock"}>
            {product.inStock ? "მარაგშია" : "არ არის მარაგში"}
          </p>
          {product.warrantyMonths > 0 && (
            <p>გარანტია: {product.warrantyMonths} თვე</p>
          )}
          <AddToCartButton product={product} />
        </div>
      </div>

      {/* მახასიათებლების ცხრილი */}
      {specs.length > 0 && (
        <section>
          <h2>მახასიათებლები</h2>
          <table className="specs">
            <tbody>
              {specs.map(([name, value]) => (
                <tr key={name}>
                  <th>{name}</th>
                  <td>{String(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* მსგავსი პროდუქტები */}
      {product.related && product.related.length > 0 && (
        <section>
          <h2>მსგავსი პროდუქტები</h2>
          <div className="grid">
            {product.related.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
