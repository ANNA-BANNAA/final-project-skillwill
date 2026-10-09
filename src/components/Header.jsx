import { Link } from "react-router-dom";
import { useAuth } from "../useAuth";
import { useCart } from "../useCart";

export function Header() {
  const { status, user, signOut } = useAuth();
  const { cart } = useCart();

  return (
    <header className="header">
      <Link to="/" className="header-logo">
        Kitchen Shop
      </Link>

      <nav className="header-nav">
        {/* კალათა ყოველთვის ჩანს, მიუხედავად ავტორიზაციისა */}
        <Link
          to="/cart"
          aria-label={"კალათა, " + (cart?.totalQty ?? 0) + " ნივთი"}
        >
          🛒 კალათა
          {cart?.totalQty > 0 && (
            <span className="badge">{cart.totalQty}</span>
          )}
        </Link>

        {status === "authenticated" ? (
          <>
            <Link to="/profile">{user?.name}</Link>
            <button className="header-btn" onClick={signOut}>
              გამოსვლა
            </button>
          </>
        ) : status === "unauthenticated" ? (
          <>
            <Link to="/login">შესვლა</Link>
            <Link to="/register">რეგისტრაცია</Link>
          </>
        ) : null}
      </nav>
    </header>
  );
}