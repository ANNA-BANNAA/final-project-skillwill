import { Link } from "react-router-dom";
import { useAuth } from "../useAuth";
import { useCart } from "../useCart";

export function Header() {
  const { status, user, signOut } = useAuth();
  const { cart } = useCart();
  const qty = cart?.totalQty ?? 0;

  return (
    <header className="header">
      <Link to="/" className="header-logo">
        Kitchen Shop
      </Link>

      <nav className="header-nav">
        {status === "authenticated" ? (
          <>
            <Link to="/cart" aria-label={`კალათა, ${qty} ნივთი`}>
              🛒
              {qty > 0 && <span className="badge">{qty}</span>}
            </Link>
            <Link to="/profile">{user?.name}</Link>
            <button className="header-btn" onClick={signOut}>
              Sign out
            </button>
          </>
        ) : status === "unauthenticated" ? (
          <>
            <Link to="/login">Sign in</Link>
            <Link to="/register">Sign up</Link>
          </>
        ) : null}
      </nav>
    </header>
  );
}