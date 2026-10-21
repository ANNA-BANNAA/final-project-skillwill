import { z } from "zod";

// ყველგან ტექსტის ნაცვლად თარგმანის გასაღებია (locales/*.json → "errors")
const email = z
  .string()
  .min(1, "errors.email.required")
  .email("errors.email.invalid");

// პაროლის წესები (რეგისტრაცია და ახალი პაროლი)
const strongPassword = z
  .string()
  .min(8, "errors.password.min")
  .regex(/\p{L}/u, "errors.password.letter")
  .regex(/\d/, "errors.password.digit");

// შესვლა: პაროლზე მხოლოდ "ცარიელი არ უნდა იყოს"
export const loginSchema = z.object({
  email: email,
  password: z.string().min(1, "errors.password.required"),
});

// რეგისტრაცია
export const registerSchema = z
  .object({
    name: z.string().min(2, "errors.name.min"),
    email: email,
    password: strongPassword,
    confirmPassword: z.string().min(1, "errors.confirm.required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "errors.confirm.mismatch",
  });

// აღდგენა, ბიჯი 1
export const emailSchema = z.object({ email: email });

// აღდგენა, ბიჯი 2
export const codeSchema = z.object({
  code: z.string().min(1, "errors.code.required"),
});

// აღდგენა, ბიჯი 3
export const newPasswordSchema = z
  .object({
    password: strongPassword,
    confirmPassword: z.string().min(1, "errors.confirm.required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "errors.confirm.mismatch",
  });

// პროფილი: ცარიელი ველი დაშვებულია (ასუფთავებს), მაგრამ თუ შეავსე, წესები მოქმედებს
const optional = (rule) => z.union([z.literal(""), rule]);

export const profileSchema = z
  .object({
    name: z.string().min(2, "errors.name.min"),
    email: email,
    phone: optional(
      z
        .string()
        .min(9, "errors.phone.min")
        .max(20, "errors.phone.max")
        .regex(/^\+?[\d\s()-]+$/, "errors.phone.format"),
    ),
    city: optional(z.string().min(2, "errors.city.min")),
    address: optional(z.string().min(5, "errors.address.min")),
    newPassword: optional(strongPassword),
    confirmNewPassword: z.string(),
    currentPassword: z.string().min(1, "errors.currentPassword.required"),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "errors.confirm.mismatch",
  });

// ბარათის ნომრის შემოწმება (Luhn)
function luhn(num) {
  let sum = 0;
  let double = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = Number(num[i]);
    if (double) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    double = !double;
  }
  return sum % 10 === 0;
}

// ვადა MM/YY, არა გასული
function notExpired(value) {
  const [mm, yy] = value.split("/");
  const month = Number(mm);
  const year = 2000 + Number(yy);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  return (
    year > now.getFullYear() ||
    (year === now.getFullYear() && month >= now.getMonth() + 1)
  );
}

const digits = (v) => v.replace(/\s/g, "");

export const checkoutSchema = z.object({
  shipping: z.object({
    fullName: z.string().trim().min(2, "errors.name.min"),
    phone: z
      .string()
      .min(9, "errors.phone.min")
      .max(20, "errors.phone.max")
      .regex(/^\+?[\d\s()-]+$/, "errors.phone.format"),
    city: z.string().trim().min(1, "errors.city.required"),
    address: z.string().trim().min(5, "errors.address.min"),
  }),
  card: z.object({
    number: z
      .string()
      .refine((v) => /^\d{13,19}$/.test(digits(v)), "errors.card.numberLength")
      .refine((v) => luhn(digits(v)), "errors.card.numberInvalid"),
    holder: z.string().trim().min(2, "errors.card.holder"),
    expiry: z
      .string()
      .regex(/^\d{2}\/\d{2}$/, "errors.card.expiryFormat")
      .refine(notExpired, "errors.card.expired"),
    cvc: z.string().regex(/^\d{3,4}$/, "errors.card.cvc"),
  }),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "errors.name.min"),
  email: email,
  message: z.string().trim().min(10, "errors.message.min"),
});