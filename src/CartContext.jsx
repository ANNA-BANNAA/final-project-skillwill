import { createContext, useEffect, useState } from "react";
import { api } from "./api";
import { useAuth } from "./useAuth";

export const CartContext = createContext({
  cart: null,
  busy: false,
  add: () => {},
  setQty: () => {},
  remove: () => {},
});

export function CartProvider({ children }) {
  const { status } = useAuth();

  // საწყის ეტაპზე ვცდილობთ კალათის ამოღებას localStorage-დან, რომ გვერდის გადართვისას არ გაქრეს
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("cart_data");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [busy, setBusy] = useState(false);

  // როცა cart იცვლება, ვინახავთ localStorage-ში
  useEffect(() => {
    if (cart !== null) {
      localStorage.setItem("cart_data", JSON.stringify(cart));
    } else {
      localStorage.removeItem("cart_data");
    }
  }, [cart]);

  // შესვლისას კალათას ვტვირთავთ სერვერიდან (მხოლოდ მაშინ, თუ ლექციამდე უკვე არ გვქონდა ან ვაახლებთ)
  useEffect(() => {
    if (status === "authenticated") {
      api
        .cart()
        .then((data) => setCart(data))
        .catch(() => {
          // თუ სერვერიდან ვერ წამოიღო და არც localStorage გვაქვს, ვტოვებთ ცარიელს
        });
    } else if (status === "unauthenticated") {
      setCart(null);
      localStorage.removeItem("cart_data");
    }
  }, [status]);

  // ყველა ცვლილება აბრუნებს მთლიან კალათას, პასუხს პირდაპირ ვინახავთ
  async function run(request) {
    setBusy(true);
    try {
      const result = await request();
      if (result) setCart(result);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e };
    } finally {
      setBusy(false);
    }
  }

  const value = {
    cart,
    busy,
    add: (productId, qty = 1) => run(() => api.addToCart({ productId, qty })),
    setQty: (itemId, qty) => run(() => api.updateCartItem(itemId, { qty })),
    remove: (itemId) => run(() => api.removeCartItem(itemId)),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
