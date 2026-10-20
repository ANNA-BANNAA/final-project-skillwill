import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../useCart";
import { Button } from "../components/Button";
import { Alert } from "../components/Alert";

export default function CartPage() {
  const { cart, busy, setQty, remove } = useCart();
  const [error, setError] = useState("");

  if (!cart) {
    return <main className="catalog"><p>იტვირთება...</p></main>;
  }

  async function changeQty(item, qty) {
    setError("");
    const result = await setQty(item.id, qty);
    if (!result.ok) {
      const e = result.error;
      if (e.code === "INSUFFICIENT_STOCK") {
        setError("მარაგში მხოლოდ " + item.product.stock + " ცალია");
      } else {
        setError("ცვლილება ვერ შესრულდა, სცადეთ თავიდან");
      }
    }
  }

  async function removeItem(item) {
    setError("");
    const result = await remove(item.id);
    if (!result.ok) setError("წაშლა ვერ მოხერხდა, სცადეთ თავიდან");
  }

  // ცარიელი კალათა
  if (cart.items.length === 0) {
    return (
      <main className="catalog">
        <div className="state-box">
          <p>კალათა ცარიელია</p>
          <Link to="/"><Button>კატალოგში დაბრუნება</Button></Link>
        </div>
      </main>
    );
  }

  // მარაგი შეიცვალა: qty მეტია stock-ზე
  const hasStockProblem = cart.items.some((i) => i.qty > i.product.stock);

  return (
    <main className="catalog">
      <h1>კალათა</h1>
      {error && <Alert variant="error">{error}</Alert>}

      <ul className="cart-list">
        {cart.items.map((item) => {
          const max = Math.min(item.product.stock, 99);
          const tooMany = item.qty > item.product.stock;
          return (
            <li className="cart-item" key={item.id}>
              <img className="cart-image" src={item.product.image} alt={item.product.title} />

              <div className="cart-info">
                <Link to={"/product/" + item.product.slug}>{item.product.title}</Link>
                <p className="card-brand">{item.product.price} ₾ / ცალი</p>
                {tooMany && (
                  <p className="field-error">მარაგში მხოლოდ {item.product.stock} ცალია</p>
                )}
              </div>

              <div className="stepper">
                <button
                  type="button"
                  className="stepper-btn"
                  aria-label={"შემცირება: " + item.product.title}
                  disabled={busy || item.qty <= 1}
                  onClick={() => changeQty(item, item.qty - 1)}
                >−</button>
                <span aria-live="polite">{item.qty}</span>
                <button
                  type="button"
                  className="stepper-btn"
                  aria-label={"გაზრდა: " + item.product.title}
                  disabled={busy || item.qty >= max}
                  onClick={() => changeQty(item, item.qty + 1)}
                >+</button>
              </div>

              <strong className="cart-line-total">{item.lineTotal} ₾</strong>

              <button
                type="button"
                className="link-btn"
                aria-label={"წაშლა: " + item.product.title}
                disabled={busy}
                onClick={() => removeItem(item)}
              >🗑</button>
            </li>
          );
        })}
      </ul>

      <div className="cart-summary">
        <p>ჯამი ({cart.totalQty} ნივთი): <strong>{cart.subtotal} ₾</strong></p>
        <Button disabled={hasStockProblem}>ჩექაუთზე გადასვლა</Button>
        {hasStockProblem && (
          <p className="field-error">გაასწორეთ რაოდენობა, სანამ გააგრძელებთ</p>
        )}
      </div>
    </main>
  );
}