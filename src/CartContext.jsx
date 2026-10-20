import { createContext, useEffect, useState } from "react";
import { api } from "./api";
import { useAuth } from "./useAuth";

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { status } = useAuth();
  const [cart, setCart] = useState(null);
  const [busy, setBusy] = useState(false); // მოთხოვნა მიმდინარეობს

  // შესვლისას კალათას ვტვირთავთ, გამოსვლისას ვასუფთავებთ
  useEffect(() => {
    if (status === "authenticated") {
      api.cart().then(setCart).catch(() => setCart(null));
    } else if (status === "unauthenticated") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCart(null);
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