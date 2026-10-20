import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { checkoutSchema } from "../schemas";
import { api } from "../api";
import { FormField } from "../components/FormField";
import { Button } from "../components/Button";
import { Alert } from "../components/Alert";

const EMPTY_CARD = { number: "", holder: "", expiry: "", cvc: "" };

// 4242424242424242 → 4242 4242 4242 4242
function formatNumber(value) {
  return value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

// 1228 → 12/28 ("/" ჩნდება ორი ციფრის შემდეგ)
function formatExpiry(value, deleting) {
  const d = value.replace(/\D/g, "").slice(0, 4);
  if (d.length > 2 || (d.length === 2 && !deleting))
    return d.slice(0, 2) + "/" + d.slice(2);
  return d;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null); // GET /checkout
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [banner, setBanner] = useState("");
  const [cardBanner, setCardBanner] = useState("");
  const [stockItems, setStockItems] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shipping: { fullName: "", phone: "", city: "", address: "" },
      card: EMPTY_CARD,
    },
  });

  // ჩექაუთის მონაცემები და ნაგულისხმევი მისამართი
  useEffect(() => {
    api
      .checkout()
      .then((res) => {
        if (!res.items || res.items.length === 0) {
          navigate("/cart", { replace: true });
          return;
        }
        setData(res);
        reset({
          shipping: {
            fullName: res.shipping?.fullName || "",
            phone: res.shipping?.phone || "",
            city: res.shipping?.city || "",
            address: res.shipping?.address || "",
          },
          card: EMPTY_CARD,
        });
      })
      .catch(() => setLoadError(true));
  }, [reset, navigate, retry]);

  // შენახული მისამართის არჩევა → ფორმის ველები ივსება
  function pickAddress(a) {
    setSelectedId(a.id);
    setValue("shipping.fullName", a.fullName || "");
    setValue("shipping.phone", a.phone || "");
    setValue("shipping.city", a.city || "");
    setValue("shipping.address", a.address || "");
  }

  async function onSubmit(values) {
    setBanner("");
    setCardBanner("");
    setStockItems(null);

    const body = {
      shipping: values.shipping,
      card: { ...values.card, number: values.card.number.replace(/\s/g, "") },
    };

    try {
      const res = await api.createOrder(body);
      setValue("card", EMPTY_CARD); // ბარათი მეხსიერებიდან ვშლით
      navigate("/checkout/confirm/" + res.orderId);
    } catch (e) {
      if (e.code === "CARD_DECLINED") {
        setValue("card", EMPTY_CARD);
        setCardBanner("ბარათი უარყოფილია, სცადე სხვა ბარათი");
      } else if (e.status === 422 && e.errors) {
        Object.entries(e.errors).forEach(([key, message]) =>
          setError(key, { message }),
        );
      } else if (e.code === "CART_EMPTY") {
        navigate("/cart", { replace: true });
      } else if (e.code === "INSUFFICIENT_STOCK") {
        setStockItems(e.body.items || []);
      } else if (e.code === "NETWORK_ERROR") {
        setBanner(e.message);
      } else {
        setBanner("დაფიქსირდა შეცდომა, სცადეთ თავიდან");
      }
    }
  }

  if (loadError) {
    return (
      <main className="catalog">
        <div className="state-box">
          <p>ჩექაუთი ვერ ჩაიტვირთა</p>
          <Button
            onClick={() => {
              setLoadError(false);
              setRetry(retry + 1);
            }}
          >
            ხელახლა ცდა
          </Button>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="catalog">
        <p>იტვირთება...</p>
      </main>
    );
  }

  const missing = data.freeShippingFrom
    ? Math.round((data.freeShippingFrom - data.subtotal) * 100) / 100
    : 0;

  return (
    <main className="catalog">
      <h1>ჩექაუთი</h1>
      <pre>{JSON.stringify(watch("shipping"), null, 2)}</pre>

      <div className="checkout">
        <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {banner && <Alert variant="error">{banner}</Alert>}

          {stockItems && (
            <Alert variant="error">
              ზოგი პროდუქტი აღარ არის საკმარისი რაოდენობით.
              <ul>
                {stockItems.map((item, i) => (
                  <li key={i}>{item.title || item.productId}</li>
                ))}
              </ul>
              <Link to="/cart">კალათაში დაბრუნება</Link>
            </Alert>
          )}

          {/* მიწოდება */}
          <section className="pay-section">
            <h2>მიწოდება</h2>

            {data.addresses && data.addresses.length > 1 && (
              <fieldset className="filter">
                <legend>შენახული მისამართები</legend>
                {data.addresses.map((a) => (
                  <label className="filter-option" key={a.id}>
                    <input
                      type="radio"
                      name="saved-address"
                      checked={selectedId === a.id}
                      onChange={() => pickAddress(a)}
                    />
                    {a.city}, {a.address}
                  </label>
                ))}
              </fieldset>
            )}

            <FormField
              label="სახელი და გვარი"
              id="fullName"
              autoComplete="name"
              error={errors.shipping?.fullName?.message}
              {...register("shipping.fullName")}
            />
            <FormField
              label="ტელეფონი"
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+995 555 12 34 56"
              error={errors.shipping?.phone?.message}
              {...register("shipping.phone")}
            />
            <FormField
              label="ქალაქი"
              id="city"
              autoComplete="address-level2"
              error={errors.shipping?.city?.message}
              {...register("shipping.city")}
            />
            <FormField
              label="მისამართი"
              id="address"
              autoComplete="street-address"
              error={errors.shipping?.address?.message}
              {...register("shipping.address")}
            />
          </section>

          {/* ბარათი */}
          <section className="pay-section">
            <h2>ბარათი</h2>
            {cardBanner && <Alert variant="error">{cardBanner}</Alert>}

            <FormField
              label="ბარათის ნომერი"
              id="cardNumber"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="4242 4242 4242 4242"
              error={errors.card?.number?.message}
              {...register("card.number", {
                onChange: (e) =>
                  setValue("card.number", formatNumber(e.target.value)),
              })}
            />
            <FormField
              label="ბარათის მფლობელი"
              id="cardHolder"
              autoComplete="cc-name"
              error={errors.card?.holder?.message}
              {...register("card.holder")}
            />
            <FormField
              label="ვადა (MM/YY)"
              id="cardExpiry"
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM/YY"
              error={errors.card?.expiry?.message}
              {...register("card.expiry", {
                onChange: (e) => {
                  const deleting =
                    e.nativeEvent?.inputType === "deleteContentBackward";
                  setValue(
                    "card.expiry",
                    formatExpiry(e.target.value, deleting),
                  );
                },
              })}
            />
            <FormField
              label="CVC"
              id="cardCvc"
              type="password"
              inputMode="numeric"
              autoComplete="cc-csc"
              error={errors.card?.cvc?.message}
              {...register("card.cvc")}
            />
          </section>

          <Button
            type="submit"
            fullWidth
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            გადახდა {data.total} ₾
          </Button>
        </form>

        {/* შეჯამება */}
        <aside className="pay-section summary">
          <h2>თქვენი შეკვეთა</h2>
          <ul className="summary-list">
            {data.items.map((item) => (
              <li key={item.id}>
                <span>
                  {item.product?.title} × {item.qty}
                </span>
                <span>{item.lineTotal} ₾</span>
              </li>
            ))}
          </ul>
          <p className="summary-row">
            <span>ჯამი</span>
            <span>{data.subtotal} ₾</span>
          </p>
          <p className="summary-row">
            <span>მიწოდება</span>
            <span>
              {data.shippingFee === 0 ? "უფასო" : data.shippingFee + " ₾"}
            </span>
          </p>
          {missing > 0 && data.shippingFee > 0 && (
            <p className="profile-hint">კიდევ {missing} ₾ და მიწოდება უფასოა</p>
          )}
          <p className="summary-row summary-total">
            <span>სულ</span>
            <span>{data.total} ₾</span>
          </p>
        </aside>
      </div>
    </main>
  );
}
