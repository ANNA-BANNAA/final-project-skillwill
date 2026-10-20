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
        <span className="header-logo-icon" aria-hidden="true">
          🍳
        </span>
        Kitchen Shop
      </Link>

      <nav className="header-links" aria-label="მთავარი მენიუ">
        <nav className="header-links" aria-label="მთავარი მენიუ">
          <Link to="/">Catalogue</Link>
          <Link to="/about">About Us</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </nav>

      <nav className="header-nav">
        {status === "authenticated" ? (
          <>
            <Link to="/cart" aria-label={"კალათა, " + qty + " ნივთი"}>
              🛒
              {qty > 0 && <span className="badge">{qty}</span>}
            </Link>
            <Link to="/orders">My Orders</Link>
            <Link to="/profile">{user?.name}</Link>
            <button className="header-btn" onClick={signOut}>
              Sign Out
            </button>
          </>
        ) : status === "unauthenticated" ? (
          <>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Sign Up</Link>
          </>
        ) : null}
      </nav>
    </header>
  );
}
