import { z } from "zod";

// ელ.ფოსტის წესები
const email = z
  .string()
  .min(1, "ელ.ფოსტის მითითება სავალდებულოა")
  .email("ელ.ფოსტის ფორმატი არასწორია");

// პაროლის წესები (რეგისტრაცია და ახალი პაროლი)
const strongPassword = z
  .string()
  .min(8, "პაროლი უნდა შეიცავდეს მინიმუმ 8 სიმბოლოს")
  .regex(/\p{L}/u, "პაროლი უნდა შეიცავდეს მინიმუმ ერთ ასოს")
  .regex(/\d/, "პაროლი უნდა შეიცავდეს მინიმუმ ერთ ციფრს");

// შესვლა: პაროლზე მხოლოდ "ცარიელი არ უნდა იყოს"
export const loginSchema = z.object({
  email: email,
  password: z.string().min(1, "პაროლის მითითება სავალდებულოა"),
});

// რეგისტრაცია
export const registerSchema = z
  .object({
    name: z.string().min(2, "სახელი უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს"),
    email: email,
    password: strongPassword,
    confirmPassword: z.string().min(1, "პაროლის გამეორება სავალდებულოა"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "პაროლები არ ემთხვევა ერთმანეთს",
  });

// აღდგენა, ბიჯი 1
export const emailSchema = z.object({ email: email });

// აღდგენა, ბიჯი 2
export const codeSchema = z.object({
  code: z.string().min(1, "კოდის მითითება სავალდებულოა"),
});

// აღდგენა, ბიჯი 3
export const newPasswordSchema = z
  .object({
    password: strongPassword,
    confirmPassword: z.string().min(1, "პაროლის გამეორება სავალდებულოა"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "პაროლები არ ემთხვევა ერთმანეთს",
  });

// პროფილი: ცარიელი ველი დაშვებულია, მაგრამ თუ შეავსე, წესები მოქმედებს
const optional = (rule) => z.union([z.literal(""), rule]);

export const profileSchema = z
  .object({
    name: z.string().min(2, "სახელი უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს"),
    email: email,
    phone: optional(
      z
        .string()
        .min(9, "ტელეფონის ნომერი უნდა იყოს მინიმუმ 9 ციფრი")
        .max(20, "ტელეფონის ნომერი არ უნდა აღემატებოდეს 20 სიმბოლოს")
        .regex(/^\+?[\d\s()-]+$/, "მიუთითეთ ტელეფონის სწორი ფორმატი"),
    ),
    city: optional(
      z.string().min(2, "ქალაქი უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს"),
    ),
    address: optional(
      z.string().min(5, "მისამართი უნდა შეიცავდეს მინიმუმ 5 სიმბოლოს"),
    ),
    newPassword: optional(strongPassword),
    confirmNewPassword: z.string(),
    currentPassword: z
      .string()
      .min(1, "მიმდინარე პაროლის მითითება სავალდებულოა"),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "პაროლები არ ემთხვევა ერთმანეთს",
  });

export const checkoutSchema = z.object({
  shipping: z.object({
    fullName: z
      .string()
      .trim()
      .min(2, "სახელი და გვარი უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს"),
    phone: z
      .string()
      .min(9, "ტელეფონის ნომერი უნდა იყოს მინიმუმ 9 ციფრი")
      .max(20, "ტელეფონის ნომერი არ უნდა აღემატებოდეს 20 სიმბოლოს")
      .regex(/^\+?[\d\s()-]+$/, "მიუთითეთ ტელეფონის სწორი ფორმატი"),
    city: z.string().trim().min(1, "ქალაქის მითითება სავალდებულოა"),
    address: z
      .string()
      .trim()
      .min(5, "მისამართი უნდა შეიცავდეს მინიმუმ 5 სიმბოლოს"),
  }),
  card: z.object({
    number: z
      .string()
      .transform((val) => val.replace(/\s/g, ""))
      .pipe(
        z
          .string()
          .min(13, "ბარათის ნომერი არასწორია")
          .max(19, "ბარათის ნომერი არასწორია"),
      ),
    holder: z.string().trim().min(2, "მიუთითეთ მფლობელი"),
    expiry: z.string().min(4, "ვადა არასწორია"),
    cvc: z.string().min(3, "CVC არასწორია"),
  }),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "სახელი უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს"),
  email: email,
  message: z
    .string()
    .trim()
    .min(10, "შეტყობინება უნდა შეიცავდეს მინიმუმ 10 სიმბოლოს"),
});
