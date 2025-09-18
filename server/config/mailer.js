// config/mailer.js
import nodemailer from "nodemailer";

const bool = (v) => String(v).toLowerCase() === "true";

// اگر SMTP ست نبود، می‌ریم روی dev-logger تا برنامه کرش نکنه
export const transporter =
  process.env.NODE_ENV === "production"
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      })
    : nodemailer.createTransport({ jsonTransport: true }); // ایمیل‌ها در لاگ به صورت JSON

// اختیاری: تست اتصال در استارتاپ
try {
  const ok = await transporter.verify();
  if (ok) console.log("[mailer] SMTP ready");
} catch (e) {
  console.warn(
    "[mailer] SMTP verify failed (using jsonTransport on dev?)",
    e?.message || e
  );
}
