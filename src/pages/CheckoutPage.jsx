import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";

import { checkoutSchema } from "../schemas";
import { api } from "../api";
import { FormField } from "../components/FormField";
import { Button } from "../components/Button";
import { Alert } from "../components/Alert";

const EMPTY_CARD = {
  number: "",
  holder: "",
  expiry: "",
  cvc: "",
};

export default function CheckoutPage() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
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
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    mode: "onSubmit",
    defaultValues: {
      shipping: {
        fullName: "",
        phone: "",
        city: "",
        address: "",
      },
      card: EMPTY_CARD,
    },
  });

  useEffect(() => {
    let cancelled = false;

    api
      .checkout()
      .then((res) => {
        if (cancelled) return;

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
      .catch(() => {
        if (!cancelled) {
          setLoadError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [navigate, retry, reset]);

  function pickAddress(address) {
    setSelectedId(address.id);

    const options = {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    };

    setValue("shipping.fullName", address.fullName || "", options);
    setValue("shipping.phone", address.phone || "", options);
    setValue("shipping.city", address.city || "", options);
    setValue("shipping.address", address.address || "", options);
  }

  async function onSubmit(values) {
    setBanner("");
    setCardBanner("");
    setStockItems(null);

    const body = {
      shipping: values.shipping,
      card: {
        ...values.card,
        number: values.card.number.replace(/\s/g, ""),
      },
    };

    try {
      const res = await api.createOrder(body);

      setValue("card", EMPTY_CARD);

      navigate("/checkout/confirm/" + res.orderId);
    } catch (e) {
      if (e.code === "CARD_DECLINED") {
        setValue("card", EMPTY_CARD);
        setCardBanner("ბარათი უარყოფილია, სცადე სხვა ბარათი");
      } else if (e.status === 422 && e.errors) {
        Object.entries(e.errors).forEach(([key, message]) => {
          setError(key, { message });
        });
      } else if (e.code === "CART_EMPTY") {
        navigate("/cart", { replace: true });
      } else if (e.code === "INSUFFICIENT_STOCK") {
        setStockItems(e.body?.items || []);
      } else if (e.code === "NETWORK_ERROR") {
        setBanner(e.message || "ქსელთან დაკავშირება ვერ მოხერხდა");
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
              setRetry((current) => current + 1);
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

      <div className="checkout">
        <form className="form" onSubmit={handleSubmit(onSubmit)}>
          {banner && <Alert variant="error">{banner}</Alert>}

          {stockItems && (
            <Alert variant="error">
              ზოგი პროდუქტი აღარ არის საკმარისი რაოდენობით.

              <ul>
                {stockItems.map((item, index) => (
                  <li key={item.productId || index}>
                    {item.title || item.productId}
                  </li>
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

                {data.addresses.map((address) => (
                  <label className="filter-option" key={address.id}>
                    <input
                      type="radio"
                      name="saved-address"
                      checked={selectedId === address.id}
                      onChange={() => pickAddress(address)}
                    />

                    {address.city}, {address.address}
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

            {cardBanner && (
              <Alert variant="error">{cardBanner}</Alert>
            )}

            <FormField
              label="ბარათის ნომერი"
              id="cardNumber"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="4242424242424242"
              error={errors.card?.number?.message}
              {...register("card.number")}
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
              inputMode="text"
              autoComplete="cc-exp"
              placeholder="MM/YY"
              error={errors.card?.expiry?.message}
              {...register("card.expiry")}
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

        {/* შეკვეთის შეჯამება */}
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
              {data.shippingFee === 0
                ? "უფასო"
                : `${data.shippingFee} ₾`}
            </span>
          </p>

          {missing > 0 && data.shippingFee > 0 && (
            <p className="profile-hint">
              კიდევ {missing} ₾ და მიწოდება უფასოა
            </p>
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
