import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth";
import { useCart } from "../useCart";
import { useLang } from "../useLang";
import { Button } from "./Button";
import { Alert } from "./Alert";

// სერვერის კოდი → თარგმანის გასაღები
const ERROR_KEYS = {
  OUT_OF_STOCK: "cart.errors.outOfStock",
  INSUFFICIENT_STOCK: "cart.errors.insufficientStock",
  PRODUCT_NOT_FOUND: "cart.errors.notFound",
};

export function AddToCartButton({ productId, disabled }) {
  const { status } = useAuth();
  const { add } = useCart();
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);
  const [errorKey, setErrorKey] = useState("");

  async function handleClick() {
    // შესული არ არის → შესვლა, შემდეგ უკან ამავე გვერდზე
    if (status !== "authenticated") {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    setBusy(true);
    setAdded(false);
    setErrorKey("");
    const result = await add(productId, 1);
    setBusy(false);
    if (result.ok) setAdded(true);
    else setErrorKey(ERROR_KEYS[result.error?.code] || "cart.errors.generic");
  }

  return (
    <div>
      <Button fullWidth loading={busy} disabled={disabled || busy} onClick={handleClick}>
        {t("cart.add")}
      </Button>
      {added && <Alert variant="success">{t("cart.added")}</Alert>}
      {errorKey && <Alert variant="error">{t(errorKey)}</Alert>}
    </div>
  );
}