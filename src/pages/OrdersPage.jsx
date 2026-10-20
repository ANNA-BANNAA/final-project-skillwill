import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { Button } from "../components/Button";

export default function OrdersPage() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    api
      .orders()
      .then((res) =>
        setOrders(Array.isArray(res) ? res : res.items || res.orders || []),
      )
      .catch((e) => setError(e.message || "ვერ ჩაიტვირთა"));
  }, [retry]);

  if (error) {
    return (
      <main className="catalog">
        <div className="state-box">
          <p>{error}</p>
          <Button
            onClick={() => {
              setError("");
              setRetry(retry + 1);
            }}
          >
            ხელახლა ცდა
          </Button>
        </div>
      </main>
    );
  }

  if (!orders) {
    return (
      <main className="catalog">
        <p>იტვირთება...</p>
      </main>
    );
  }

  if (orders.length === 0) {
    return (
      <main className="catalog">
        <h1>ჩემი შეკვეთები</h1>
        <div className="state-box">
          <p>შეკვეთები ჯერ არ გაქვთ</p>
          <Link to="/">კატალოგი</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="catalog">
      <h1>ჩემი შეკვეთები</h1>
      <ul className="orders-list">
        {orders.map((o) => (
          <li key={o.id} className="order-card">
            <div className="order-card-top">
              <span className="order-date">
                {o.createdAt
                  ? new Date(o.createdAt).toLocaleDateString("ka-GE")
                  : ""}
              </span>
              <span
                className={
                  o.status === "paid"
                    ? "order-status order-status-paid"
                    : "order-status"
                }
              >
                {o.status === "paid" ? "გადახდილია" : o.status}
              </span>
            </div>
            <div className="order-card-bottom">
              <strong className="order-total">{o.total} ₾</strong>
              <Link to={"/orders/" + o.id} className="order-link">
                დეტალები →
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}