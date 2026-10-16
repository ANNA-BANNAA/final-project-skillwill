import { useAuth } from "../useAuth";
import { Button } from "../components/Button";
import { Link } from "react-router-dom";

export default function HomePage() {
  const { user, signOut } = useAuth();

  return (
    <main style={{ padding: 24, display: "grid", gap: 12, maxWidth: 420 }}>
      <h1>გამარჯობა, {user?.name}</h1>
      <p>{user?.email}</p>
      <Link to="/catalog">კატალოგი</Link>
      <Button variant="secondary" onClick={signOut}>გამოსვლა</Button>
    </main>
  );
}