const BASE_URL = import.meta.env.VITE_API_URL;

// ტოკენის შენახვა/წაკითხვა/წაშლა (მხოლოდ აქ ვეხებით localStorage-ს)
export const tokenStorage = {
  get: () => localStorage.getItem("accessToken"),
  set: (token) => localStorage.setItem("accessToken", token),
  clear: () => localStorage.removeItem("accessToken"),
};

// როცა ტოკენს ვადა გაუვა, AuthContext აქ ჩაწერს, რა უნდა მოხდეს
let onTokenExpired = null;
export function setTokenExpiredHandler(fn) {
  onTokenExpired = fn;
}

// სერვერის შეცდომა: ინახავს status-ს, code-ს და errors-ს
export class ApiError extends Error {
  constructor(status, body) {
    super(body.message || "შეცდომა");
    this.status = status;
    this.code = body.code || "UNKNOWN";
    this.errors = body.errors;
    this.body = body;
  }
}

// ამ მოთხოვნებზე ტოკენს არ ვაგზავნით: ეს ავტორიზაციამდე მოთხოვნებია
const NO_TOKEN_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/verify-reset-code",
  "/auth/reset-password",
];

// ერთი ფუნქცია ყველა მოთხოვნისთვის
async function request(path, method = "GET", body, signal) {
  const token = tokenStorage.get();
  const sendToken = Boolean(token) && !NO_TOKEN_PATHS.includes(path);

  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (sendToken) headers["Authorization"] = "Bearer " + token;

  let res;
  try {
    res = await fetch(BASE_URL + path, {
      method: method,
      headers: headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new ApiError(0, {
      code: "NETWORK_ERROR",
      message: "სერვერთან დაკავშირება ვერ მოხერხდა",
    });
  }

  if (res.status === 204) return null;

  // პასუხი ყოველთვის JSON არ არის (მაგ. Render-ის 502 აბრუნებს HTML-ს)
  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  const data = isJson ? await res.json().catch(() => ({})) : {};

  if (!res.ok) {
    // ტოკენის ვადაგასულობად ვთვლით მხოლოდ იმ 401-ს, რომელიც ტოკენით გაგზავნილ
    // მოთხოვნაზე მოვიდა. არასწორი ლოგინი ("INVALID_CREDENTIALS") ამას არ იწვევს
    const tokenProblem =
      !data.code || ["UNAUTHORIZED", "TOKEN_EXPIRED"].includes(data.code);
    if (res.status === 401 && sendToken && tokenProblem && onTokenExpired) {
      onTokenExpired();
    }
    throw new ApiError(res.status, data);
  }
  return data;
}

// კატეგორია იშვიათად იცვლება, ამიტომ ერთხელ ვტვირთავთ და ვიმახსოვრებთ.
// signal-ს ამ მოთხოვნას არ ვაძლევთ: თუ ერთმა კომპონენტმა გააუქმა, მეორეს არ გაუფუჭდეს.
// კალათა, პროფილი და შეკვეთები არასდროს ინახება აქ (სხვა მომხმარებელს არ უნდა გამოუჩნდეს)
const categoryCache = new Map();

function cachedCategory(slug) {
  if (!categoryCache.has(slug)) {
    const promise = request("/categories/" + slug).catch((err) => {
      categoryCache.delete(slug); // წარუმატებელი არ ვიმახსოვროთ
      throw err;
    });
    categoryCache.set(slug, promise);
  }
  return categoryCache.get(slug);
}

// ენდპოინტები
export const api = {
  // ავტორიზაცია
  register: (body) => request("/auth/register", "POST", body),
  login: (body) => request("/auth/login", "POST", body),
  me: () => request("/auth/me"),
  updateMe: (body) => request("/auth/me", "PATCH", body),
  forgotPassword: (body) => request("/auth/forgot-password", "POST", body),
  verifyResetCode: (body) => request("/auth/verify-reset-code", "POST", body),
  resetPassword: (body) => request("/auth/reset-password", "POST", body),

  // კატალოგი
  category: (slug) => cachedCategory(slug),
  products: (query, signal) =>
    request("/products?" + query, "GET", undefined, signal),
  product: (slug, signal) =>
    request("/products/" + slug, "GET", undefined, signal),

  // კალათა
  cart: () => request("/cart"),
  addToCart: (body) => request("/cart/items", "POST", body),
  updateCartItem: (id, body) => request("/cart/items/" + id, "PATCH", body),
  removeCartItem: (id) => request("/cart/items/" + id, "DELETE"),

  // ჩექაუთი და შეკვეთები
  checkout: () => request("/checkout"),
  createOrder: (body) => request("/orders", "POST", body),
  confirmOrder: (id, code) => request("/orders/" + id + "/confirm", "POST", { code }),
  resendCode: (id) => request("/orders/" + id + "/resend-code", "POST"),
  order: (id) => request("/orders/" + id),
  orders: () => request("/orders"),
};