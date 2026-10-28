import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLang } from "../useLang";
import { usePageTitle } from "../usePageTitle";
import { api } from "../api";
import { Button } from "../components/Button";

export default function OrderPage() {
  const { id } = useParams();
  const { t } = useLang();
  usePageTitle(t("nav.orders"));
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  // მონაცემები სერვერიდან მოდის, ამიტომ F5-ზეც მუშაობს
  useEffect(() => {
    api
      .order(id)
      .then((data) => setOrder(data.order || data))
      .catch(() => setError(true));
  }, [id, retry]);

  if (error) {
    return (
      <main className="catalog">
        <div className="state-box">
          <p>შეკვეთა ვერ ჩაიტვირთა</p>
          <Button
            onClick={() => {
              setError(false);
              setRetry(retry + 1);
            }}
          >
            ხელახლა ცდა
          </Button>
          <Link to="/">კატალოგში დაბრუნება</Link>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="catalog">
        <p>იტვირთება...</p>
      </main>
    );
  }

  return (
    <main className="catalog">
      <div className="profile-card">
        <h1>მადლობა!</h1>
        <p>
          შეკვეთა №{order.number || order.id}{" "}
          {order.status === "paid" ? "გადახდილია" : "(" + order.status + ")"}
        </p>

        <h2 className="profile-subtitle">პროდუქტები</h2>
        <ul className="summary-list">
          {(order.items || []).map((item, i) => (
            <li key={item.id || i}>
              <span>
                {item.title || item.product?.title} × {item.qty}
              </span>
              <span>{item.lineTotal} ₾</span>
            </li>
          ))}
        </ul>
        <p className="summary-row summary-total">
          <span>სულ</span>
          <span>{order.total} ₾</span>
        </p>

        <h2 className="profile-subtitle">მიწოდება</h2>
        <p>
          {order.shipping?.fullName}
          <br />
          {order.shipping?.phone}
          <br />
          {order.shipping?.city}, {order.shipping?.address}
        </p>

        {order.payment && (
          <>
            <h2 className="profile-subtitle">გადახდა</h2>
            <p>
              {order.payment.brand} •••• {order.payment.last4}
            </p>
          </>
        )}

        <Link to="/">კატალოგში დაბრუნება</Link>
      </div>
    </main>
  );
}
