import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { registerSchema } from "../schemas";
import { api } from "../api";
import { useAuth } from "../useAuth";
import { AuthLayout } from "../components/AuthLayout";
import { FormField } from "../components/FormField";
import { Button } from "../components/Button";
import { Alert } from "../components/Alert";

export default function RegisterPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [banner, setBanner] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values) {
    setBanner("");
    try {
      // confirmPassword სერვერზე არ იგზავნება
      const { name, email, password } = values;
      const data = await api.register({ name, email, password });
      signIn(data.accessToken, data.user);
      navigate("/", { replace: true });
    } catch (e) {
      if (e.status === 422 && e.errors) {
        Object.entries(e.errors).forEach(([field, message]) => setError(field, { message }));
      } else if (e.code === "EMAIL_TAKEN") {
        setError("email", { message: "ეს ელფოსტა უკვე რეგისტრირებულია" });
      } else if (e.code === "NETWORK_ERROR") {
        setBanner(e.message);
      } else {
        setBanner("დაფიქსირდა შეცდომა, სცადეთ თავიდან");
      }
    }
  }

  return (
    <AuthLayout title="რეგისტრაცია">
      <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {banner && <Alert variant="error">{banner}</Alert>}

        <FormField label="სახელი" id="name" autoComplete="name"
          error={errors.name?.message} {...register("name")} />

        <FormField label="ელფოსტა" id="email" type="email" autoComplete="email"
          error={errors.email?.message} {...register("email")} />

        <FormField label="პაროლი" id="password" password autoComplete="new-password"
          error={errors.password?.message} {...register("password")} />

        <FormField label="გაიმეორე პაროლი" id="confirmPassword" password autoComplete="new-password"
          error={errors.confirmPassword?.message} {...register("confirmPassword")} />

        <Button type="submit" fullWidth loading={isSubmitting}>რეგისტრაცია</Button>
      </form>

      <div className="links">
        <Link to="/login">უკვე გაქვს ანგარიში?</Link>
      </div>
    </AuthLayout>
  );
}