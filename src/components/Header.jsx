import { Link } from "react-router-dom";
import { useAuth } from "../useAuth";

export function Header() {
  const { status, user, signOut } = useAuth();

  return (
    <header className="header">
      <Link to="/" className="header-logo">Kitchen Shop</Link>

      <nav className="header-nav">
        {status === "authenticated" ? (
          <>
            <Link to="/profile">{user?.name}</Link>
            <button className="header-btn" onClick={signOut}>გამოსვლა</button>
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