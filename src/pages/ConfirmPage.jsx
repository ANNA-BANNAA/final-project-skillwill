import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { codeSchema } from "../schemas";
import { api } from "../api";
import { useCart } from "../useCart";
import { FormField } from "../components/FormField";
import { Button } from "../components/Button";
import { Alert } from "../components/Alert";

export default function ConfirmPage() {
  const { orderId } = useParams(); // orderId URL-შია, F5-ზე არ იკარგება
  const navigate = useNavigate();
  const { reload } = useCart();

  const [banner, setBanner] = useState("");
  const [info, setInfo] = useState("");
  const [tooMany, setTooMany] = useState(false);
  const [stockItems, setStockItems] = useState(null);
  const [seconds, setSeconds] = useState(30);
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(codeSchema) });

  // 30 წამის ტაიმერი ხელახლა გაგზავნისთვის
  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  async function onSubmit({ code }) {
    setBanner("");
    setInfo("");
    setStockItems(null);
    try {
      await api.confirmOrder(orderId, code);
      await reload(); // კალათა ფრონტზეც ცარიელდება
      navigate("/orders/" + orderId, { replace: true });
    } catch (e) {
      if (e.code === "INVALID_PAYMENT_CODE") {
        setError("code", { message: "კოდი არასწორია ან ვადაგასულია" });
      } else if (e.code === "TOO_MANY_ATTEMPTS" || e.status === 429) {
        setTooMany(true);
      } else if (e.code === "ORDER_ALREADY_PAID") {
        navigate("/orders/" + orderId, { replace: true });
      } else if (e.code === "INSUFFICIENT_STOCK") {
        setStockItems(e.body?.items || []);
      } else {
        setBanner(e.message || "დაფიქსირდა შეცდომა");
      }
    }
  }

  async function resend() {
    setResending(true);
    setBanner("");
    setInfo("");
    try {
      await api.resendCode(orderId);
      setTooMany(false);
      setSeconds(30);
      setInfo("ახალი კოდი გამოიგზავნა");
    } catch (e) {
      if (e.code === "RESEND_TOO_SOON") {
        setSeconds(e.body?.retryAfterSeconds || 30);
      } else {
        setBanner(e.message || "დაფიქსირდა შეცდომა");
      }
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="catalog">
      <h1>გადახდის დადასტურება</h1>
      <p>კოდი გამოგზავნილია თქვენს ელფოსტაზე და მოქმედებს 10 წუთი.</p>

      {banner && <Alert variant="error">{banner}</Alert>}
      {info && <Alert variant="success">{info}</Alert>}
      {tooMany && (
        <Alert variant="error">ძალიან ბევრი მცდელობა. მოითხოვეთ ახალი კოდი.</Alert>
      )}
      {stockItems && (
        <Alert variant="error">
          ზოგი პროდუქტი აღარ არის მარაგში.
          <ul>
            {stockItems.map((item, i) => (
              <li key={i}>{item.title || item.productId}</li>
            ))}
          </ul>
          <Link to="/cart">კალათაში დაბრუნება</Link>
        </Alert>
      )}

      <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField
          label="კოდი"
          id="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          error={errors.code?.message}
          {...register("code")}
        />
        <Button type="submit" fullWidth loading={isSubmitting} disabled={isSubmitting}>
          დადასტურება
        </Button>
        <Button
          variant="secondary"
          fullWidth
          loading={resending}
          disabled={resending || (seconds > 0 && !tooMany)}
          onClick={resend}
        >
          {seconds > 0 && !tooMany
            ? "ხელახლა გაგზავნა (" + seconds + ")"
            : "ახალი კოდის მოთხოვნა"}
        </Button>
      </form>

      <p><Link to="/checkout">უკან</Link></p>
    </main>
  );
}