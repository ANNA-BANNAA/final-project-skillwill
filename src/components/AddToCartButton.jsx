import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth";
import { useCart } from "../useCart";
import { Button } from "./Button";

export function AddToCartButton({ product }) {
  const { status } = useAuth();
  const { add, busy } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function handleClick(e) {
    e.preventDefault(); // ბარათი ბმულია, გადასვლა არ გვინდა

    // შესული არ არის → /login, შესვლის შემდეგ უკან ბრუნდება
    if (status !== "authenticated") {
      navigate("/login", { state: { from: location.pathname + location.search } });
      return;
    }

    const result = await add(product.id, 1);
    if (result.ok) {
      setIsError(false);
      setMessage("დაემატა კალათაში");
    } else {
      const e2 = result.error;
      setIsError(true);
      if (e2.code === "OUT_OF_STOCK") setMessage("ამოწურულია");
      else if (e2.code === "INSUFFICIENT_STOCK") setMessage("მარაგში არ არის საკმარისი რაოდენობა");
      else if (e2.code === "PRODUCT_NOT_FOUND") setMessage("პროდუქტი აღარ არსებობს");
      else setMessage("ვერ დაემატა, სცადეთ თავიდან");
    }
    setTimeout(() => setMessage(""), 2500);
  }

  return (
    <div className="add-to-cart">
      <Button type="button" fullWidth loading={busy} disabled={!product.inStock} onClick={handleClick}>
        {product.inStock ? "კალათაში დამატება" : "ამოწურულია"}
      </Button>
      {message && (
        <p className={isError ? "field-error" : "in-stock"} role="status">{message}</p>
      )}
    </div>
  );
}