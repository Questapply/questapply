// export const BASE_UPLOADS_URL =
//   process.env.BASE_UPLOADS_URL || "http://questapply.com/wp-content/uploads/";

export const BASE_UPLOADS_URL = (
  process.env.BASE_UPLOADS_URL || "http://questapply.com/wp-content/uploads"
).replace(/\/$/, "");

export const IMAGE_PROXY_URL = (process.env.IMAGE_PROXY_URL || "").replace(
  /\/$/,
  ""
);

export function buildUploadsUrl(raw = "") {
  if (!raw) return "";

  const uploadsBase = String(BASE_UPLOADS_URL || "").replace(/\/+$/, "");
  const baseProto = (() => {
    try {
      return new URL(uploadsBase).protocol;
    } catch {
      return "https:";
    }
  })();

  if (/^https?:\/\//i.test(raw)) {
    try {
      const u = new URL(raw);
      u.protocol = baseProto;
      const abs = u.toString();
      return IMAGE_PROXY_URL
        ? `${IMAGE_PROXY_URL}?url=${encodeURIComponent(abs)}`
        : abs;
    } catch {}
  }

  let rel = String(raw)
    .trim()
    .replace(/^\/?(wp-content\/uploads|uploads)\//i, "")
    .replace(/^\/+/, "");
  const absolute = `${uploadsBase}/${rel}`;

  return IMAGE_PROXY_URL
    ? `${IMAGE_PROXY_URL}?url=${encodeURIComponent(absolute)}`
    : absolute;
}

export const countryMap = {
  24: "United States",
  25: "Canada",
  233: "England",
  363: "Germany",
  298: "Italy",
  447: "Netherlands",
  460: "Sweden",
  479: "Switzerland",
  490: "Denmark",
  528: "Austria",
  499: "Spain",
  539: "Finland",
  538: "Norway",
  380: "Australia",
};

// ========= ارز هر کشور (ISO currency code) =========
export const countryCurrency = {
  24: "USD", // United States
  25: "CAD", // Canada
  233: "GBP", // England (UK)
  363: "EUR", // Germany
  298: "EUR", // Italy
  447: "EUR", // Netherlands
  460: "SEK", // Sweden
  479: "CHF", // Switzerland
  490: "DKK", // Denmark
  528: "EUR", // Austria
  499: "EUR", // Spain
  539: "EUR", // Finland
  538: "NOK", // Norway
  380: "AUD", // Australia
};

// (اختیاری) نماد ارز برای نمایش UI
export const currencySymbol = {
  USD: "$",
  CAD: "C$",
  GBP: "£",
  EUR: "€",
  SEK: "kr",
  CHF: "CHF",
  DKK: "kr",
  NOK: "kr",
  AUD: "A$",
};
// ========= کلید متای «Application Fee داخلی» هر کشور در DB =========
// فعلاً داده قدیمی فقط کلید US/CA رو داره؛ برای کشورهای جدید اگر متای جدا ساختید، اینجا اضافه کنید.
export const domesticFeeMetaByCountry = {
  24: "extra_appication_fee_us", // United States
  25: "extra_appication_fee_us", // Canada
  // وقتی فیلد داخلی کشور جدید در DB اضافه شد، اینجا مپ کن:
  // 447: "extra_appication_fee_nl", // Netherlands (مثال)
  // 460: "extra_appication_fee_se", // Sweden
  // ...
};

// ========= Helperها (برای استفاده در روت‌ها/سرویس‌ها) =========
export const getCurrencyForCountry = (countryId) =>
  countryCurrency?.[Number(countryId)] || "USD";

export const getCurrencySymbol = (cur) => currencySymbol?.[cur] || "$";

export const getDomesticMetaKeyForCountry = (countryId) =>
  domesticFeeMetaByCountry?.[Number(countryId)] || null;
