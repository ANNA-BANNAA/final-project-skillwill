import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginSchema } from "../schemas";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { AuthLayout } from "../components/AuthLayout";
import { FormField } from "../components/FormField";
import { Button } from "../components/Button";
import { Alert } from "../components/Alert";

export default function LoginPage() {
  const { signIn, expired } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [banner, setBanner] = useState("");

  // სად დავაბრუნოთ შესვლის მერე (თუ დაცული გვერდიდან გამოგვაგდეს)
  const from = location.state?.from || "/";

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values) {
    setBanner("");
    try {
      const data = await api.login(values);
      signIn(data.accessToken, data.user);
      navigate(from, { replace: true });
    } catch (e) {
      if (e.status === 422 && e.errors) {
        // სერვერის შეცდომები შესაბამის ველებზე
        Object.entries(e.errors).forEach(([field, message]) => setError(field, { message }));
      } else if (e.code === "INVALID_CREDENTIALS") {
        setBanner("არასწორი ელფოსტა ან პაროლი");
      } else if (e.code === "NETWORK_ERROR") {
        setBanner(e.message);
      } else {
        setBanner("დაფიქსირდა შეცდომა, სცადეთ თავიდან");
      }
    }
  }

  return (
    <AuthLayout title="შესვლა">
      <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {expired && !banner && <Alert variant="error">სესია ამოიწურა, გთხოვთ შეხვიდეთ თავიდან</Alert>}
        {banner && <Alert variant="error">{banner}</Alert>}

        <FormField label="ელფოსტა" id="email" type="email" autoComplete="email"
          error={errors.email?.message} {...register("email")} />

        <FormField label="პაროლი" id="password" password autoComplete="current-password"
          error={errors.password?.message} {...register("password")} />

        <Button type="submit" fullWidth loading={isSubmitting}>შესვლა</Button>
      </form>

      <div className="links">
        <Link to="/forgot-password">დაგავიწყდა პაროლი?</Link>
        <Link to="/register">შექმენი ანგარიში</Link>
      </div>
    </AuthLayout>
  );
}