import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import { CartProvider } from "./CartContext";
import { LangProvider } from "./LangProvider";
import { useAuth } from "./useAuth";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Skeleton } from "./components/Skeleton";
import CatalogPage from "./pages/CatalogPage";

// საწყის ბანდლში მხოლოდ ჰედერი, ფუტერი და კატალოგია.
// დანარჩენი გვერდები იტვირთება მაშინ, როცა მომხმარებელი იქ მივა
const ProductPage = lazy(() => import("./pages/ProductPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const ConfirmPage = lazy(() => import("./pages/ConfirmPage"));
const OrderPage = lazy(() => import("./pages/OrderPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));

function Loader() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      იტვირთება...
    </div>
  );
}

// გვერდის ჩატვირთვისას: skeleton, არა ცარიელი ეკრანი
function PageFallback() {
  return (
    <main className="catalog">
      <div className="grid">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} />
        ))}
      </div>
    </main>
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
      <LangProvider>
        <AuthProvider>
          <CartProvider>
            <Header />
            <Suspense fallback={<PageFallback />}>
              <Routes>
                {/* ღია გვერდები: ყველას შეუძლია ნახოს */}
                <Route path="/" element={<CatalogPage />} />
                <Route path="/catalog" element={<CatalogPage />} />
                <Route path="/product/:slug" element={<ProductPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:id" element={<BlogPostPage />} />
                <Route path="/contact" element={<ContactPage />} />

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
                  path="/profile"
                  element={
                    <Protected>
                      <ProfilePage />
                    </Protected>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <Protected>
                      <CartPage />
                    </Protected>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <Protected>
                      <CheckoutPage />
                    </Protected>
                  }
                />
                <Route
                  path="/checkout/confirm/:orderId"
                  element={
                    <Protected>
                      <ConfirmPage />
                    </Protected>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <Protected>
                      <OrderPage />
                    </Protected>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <Protected>
                      <OrdersPage />
                    </Protected>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </LangProvider>
    </BrowserRouter>
  );
}