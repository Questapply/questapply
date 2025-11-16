// config/mailer.js
// utils/mailer.js
import nodemailer from "nodemailer";

const toBool = (v) => String(v).toLowerCase() === "true";

const ENV = {
  NODE_ENV: process.env.NODE_ENV || "production",
  MAIL_ENABLED: process.env.MAIL_ENABLED, // "false" ⇒ غیرفعال
  MAIL_TRANSPORT: (process.env.MAIL_TRANSPORT || "").toLowerCase(), // "json" | "smtp"
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: Number(process.env.SMTP_PORT || 587),
  SMTP_SECURE: toBool(process.env.SMTP_SECURE || "false"),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
};

// تصمیم‌گیری حالت ارسال
const EXPLICIT_DISABLED = ENV.MAIL_ENABLED === "false";
const EXPLICIT_JSON = ENV.MAIL_TRANSPORT === "json";
const HAS_SMTP_CONFIG = !!(ENV.SMTP_HOST && (ENV.SMTP_USER || ENV.SMTP_PASS));

// حالت نهایی:
const MODE = EXPLICIT_DISABLED
  ? "disabled"
  : EXPLICIT_JSON
  ? "json"
  : HAS_SMTP_CONFIG
  ? "smtp"
  : ENV.NODE_ENV === "production"
  ? "json" // حتی در پروداکشن اگر SMTP نداریم، کرش نکن—json بزن
  : "json";

// ساخت ترنسپورتر
export const transporter =
  MODE === "smtp"
    ? nodemailer.createTransport({
        host: ENV.SMTP_HOST,
        port: ENV.SMTP_PORT,
        secure: ENV.SMTP_SECURE,
        auth:
          ENV.SMTP_USER && ENV.SMTP_PASS
            ? { user: ENV.SMTP_USER, pass: ENV.SMTP_PASS }
            : undefined,
        tls: { rejectUnauthorized: false },
        pool: true,
      })
    : nodemailer.createTransport({ jsonTransport: true });

// تست اتصال فقط وقتی SMTP واقعی داریم
try {
  if (MODE === "smtp") {
    const ok = await transporter.verify();
    if (ok) console.log("[mailer] SMTP ready");
  } else {
    console.log(`[mailer] mode=${MODE} (no SMTP verify)`);
  }
} catch (e) {
  console.warn("[mailer] SMTP verify failed:", e?.message || e);
}

export async function sendMail(opts) {
  if (MODE === "disabled") {
    console.log("[mailer] disabled, skip:", opts.subject);
    return { skipped: true };
  }
  return transporter.sendMail(opts);
}
