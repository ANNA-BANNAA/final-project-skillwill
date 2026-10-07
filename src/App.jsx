import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import { useAuth } from "./useAuth";
import { Header } from "./components/Header";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import HomePage from "./pages/HomePage";
import CatalogPage from "./pages/CatalogPage";
import ProductPage from "./pages/ProductPage";
import ProfilePage from "./pages/ProfilePage";
import { Footer } from "./components/Footer";

function Loader() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      იტვირთება...
    </div>
  );
}

// მხოლოდ შესულებისთვის
function Protected({ children }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <Loader />;
  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

// მხოლოდ სტუმრებისთვის
function GuestOnly({ children }) {
  const { status } = useAuth();

  if (status === "loading") return <Loader />;
  if (status === "authenticated") return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Header />
        <Routes>
          {/* ღია გვერდები: ყველას შეუძლია ნახოს */}
          <Route path="/" element={<CatalogPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />

          {/* სტუმრებისთვის */}
          <Route
            path="/login"
            element={
              <GuestOnly>
                <LoginPage />
              </GuestOnly>
            }
          />
          <Route
            path="/register"
            element={
              <GuestOnly>
                <RegisterPage />
              </GuestOnly>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <GuestOnly>
                <ForgotPasswordPage />
              </GuestOnly>
            }
          />

          {/* დაცული: მხოლოდ შესულებისთვის */}
          <Route
            path="/home"
            element={
              <Protected>
                <HomePage />
              </Protected>
            }
          />
          <Route
            path="/profile"
            element={
              <Protected>
                <ProfilePage />
              </Protected>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}