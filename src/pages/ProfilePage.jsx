import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "../schemas";
import { api } from "../api";
import { useAuth } from "../useAuth";
import { FormField } from "../components/FormField";
import { Button } from "../components/Button";
import { Alert } from "../components/Alert";

const EMPTY = {
  name: "", email: "", phone: "", city: "", address: "",
  newPassword: "", confirmNewPassword: "", currentPassword: "",
};

export default function ProfilePage() {
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [banner, setBanner] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty, dirtyFields },
  } = useForm({ resolver: zodResolver(profileSchema), defaultValues: EMPTY });

  // მიმდინარე მონაცემების ჩატვირთვა და ფორმის შევსება
  useEffect(() => {
    api
      .me()
      .then((data) => {
        const u = data.user;
        reset({
          ...EMPTY,
          name: u.name || "",
          email: u.email || "",
          phone: u.phone || "",
          city: u.city || "",
          address: u.address || "",
        });
        setLoading(false);
      })
      .catch(() => {
        setLoadError(true);
        setLoading(false);
      });
  }, [reset, retry]);

  async function onSubmit(values) {
    setBanner("");
    setSuccess(false);

    // მხოლოდ შეცვლილი ველები (პაროლის ველები გამოვრიცხეთ, ისინი ქვემოთ მიდის)
    const changed = {};
    Object.keys(dirtyFields).forEach((key) => {
      if (key === "currentPassword" || key === "confirmNewPassword") return;
      changed[key] = values[key];
    });

    try {
      const data = await api.updateMe({
        currentPassword: values.currentPassword,
        ...changed,
      });
      const u = data.user;
      setUser(u); // ჰედერიც განახლდება
      reset({
        ...EMPTY,
        name: u.name || "",
        email: u.email || "",
        phone: u.phone || "",
        city: u.city || "",
        address: u.address || "",
      }); // პაროლის ველები ცარიელდება
      setSuccess(true);
    } catch (e) {
      if (e.code === "INVALID_CURRENT_PASSWORD") {
        setError("currentPassword", { message: "პაროლი არასწორია" });
      } else if (e.code === "EMAIL_TAKEN") {
        setError("email", { message: "ეს ელფოსტა უკვე რეგისტრირებულია" });
      } else if (e.status === 422 && e.errors) {
        if (e.errors._) {
          setBanner("შესაცვლელი არაფერია");
        }
        Object.entries(e.errors).forEach(([field, message]) => {
          if (field !== "_") setError(field, { message });
        });
      } else if (e.code === "NETWORK_ERROR") {
        setBanner(e.message);
      } else {
        setBanner("დაფიქსირდა შეცდომა, სცადეთ თავიდან");
      }
    }
  }

  if (loading) {
    return <main className="catalog"><p>იტვირთება...</p></main>;
  }

  if (loadError) {
    return (
      <main className="catalog">
        <div className="state-box">
          <p>პროფილი ვერ ჩაიტვირთა</p>
          <Button onClick={() => { setLoadError(false); setLoading(true); setRetry(retry + 1); }}>
            ხელახლა ცდა
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="catalog">
      <div className="profile-card">
        <h1>პროფილი</h1>
        <p className="profile-hint">
          შენახული ტელეფონი და მისამართი შეკვეთისას ავტომატურად შეივსება.
        </p>

        <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {success && <Alert>ცვლილებები შენახულია</Alert>}
          {banner && <Alert variant="error">{banner}</Alert>}

          <FormField label="სახელი" id="name" autoComplete="name"
            error={errors.name?.message} {...register("name")} />
          <FormField label="ელფოსტა" id="email" type="email" autoComplete="email"
            error={errors.email?.message} {...register("email")} />
          <FormField label="ტელეფონი" id="phone" type="tel" autoComplete="tel"
            placeholder="+995 555 12 34 56"
            error={errors.phone?.message} {...register("phone")} />
          <FormField label="ქალაქი" id="city" autoComplete="address-level2"
            error={errors.city?.message} {...register("city")} />
          <FormField label="მისამართი" id="address" autoComplete="street-address"
            error={errors.address?.message} {...register("address")} />

          <h2 className="profile-subtitle">პაროლის შეცვლა (არასავალდებულო)</h2>
          <FormField label="ახალი პაროლი" id="newPassword" password autoComplete="new-password"
            error={errors.newPassword?.message} {...register("newPassword")} />
          <FormField label="გაიმეორე ახალი პაროლი" id="confirmNewPassword" password autoComplete="new-password"
            error={errors.confirmNewPassword?.message} {...register("confirmNewPassword")} />

          <h2 className="profile-subtitle">დადასტურება</h2>
          <FormField label="მიმდინარე პაროლი" id="currentPassword" password autoComplete="current-password"
            error={errors.currentPassword?.message} {...register("currentPassword")} />

          <Button type="submit" fullWidth loading={isSubmitting} disabled={!isDirty}>
            შენახვა
          </Button>
        </form>
      </div>
    </main>
  );
}