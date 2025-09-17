// server/utils/fees.js
import {
  getCurrencyForCountry,
  getCurrencySymbol,
  getDomesticMetaKeyForCountry,
} from "../config/constants.js";

/** FREE/no/… → 0 | "123" → 123 | null/غیرعددی → null */
export function normalizeFee(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s || s === "0") return 0;
  if (/^(free|no)$/i.test(s)) return 0;
  const n = parseFloat(s.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

/** خواندن یک meta از جدول رابطهٔ برنامه، اگر در SELECT اولیه join نشده باشد */
export async function getRelMeta(db, relId, metaKey) {
  const [rows] = await db.query(
    `
      SELECT meta_value
      FROM qacom_wp_apply_programs_relationship_meta
      WHERE program_rel_id = ? AND meta_key = ?
      LIMIT 1
    `,
    [relId, metaKey]
  );
  return rows?.[0]?.meta_value ?? null;
}

/**
 * نسخهٔ سازگار با کد قدیمی
 * ورودی همون signature قدیمیه:
 * computeFees({ userCountry, schoolCountry, metaIntl, metaUS })
 * - اگر کاربر هم‌کشور با دانشگاه باشه و meta داخلی داشته باشیم، همونو می‌گیریم
 * - در غیر این صورت intl می‌افته
 * - currency و symbol براساس کشور دانشگاه
 */
export function computeFees({ userCountry, schoolCountry, metaIntl, metaUS }) {
  const userC = Number(userCountry);
  const schoolC = Number(schoolCountry);
  const isDomestic =
    Number.isFinite(userC) && Number.isFinite(schoolC) && userC === schoolC;

  const currency = getCurrencyForCountry(schoolC);
  const symbol = getCurrencySymbol(currency);

  const intl = normalizeFee(metaIntl);

  let domestic = null;
  if (isDomestic) {
    // برای US کلید داخلی metaUS در کد قدیمی پاس می‌شد
    const domesticKey = getDomesticMetaKeyForCountry(schoolC);
    if (domesticKey) {
      if (schoolC === 24 /* United States */) {
        domestic = normalizeFee(metaUS);
      } else {
        // برای کشورهای دیگر اگر توی این endpoint متای داخلی پاس نمی‌دی
        // اینجا domestic=null می‌مونه و می‌افته روی intl.
        domestic = null;
      }
    }
  }

  const application = isDomestic && domestic !== null ? domestic : intl;

  const submission = 100; // فعلاً ثابت
  const review = 50; // فعلاً ثابت

  return {
    application,
    submission,
    total: (application || 0) + submission,
    review,
    currency,
    symbol,
    isDomestic,
    raw: { international: intl, domestic },
  };
}

/**
 * نسخهٔ جدیدتر و کامل‌تر که می‌تونه meta داخلی هر کشور رو از DB بخونه
 * - اگر فیلد داخلی در SELECT اولیه نبود، با getRelMeta از DB می‌خونه
 * - برای همهٔ کشورهایی که کلید داخلی تعریف کردی کار می‌کنه
 */
export async function buildFeesForProgram(db, relRow, userCountryId) {
  const relId = relRow.rel_id ?? relRow.id;
  const schoolCountry = Number(relRow.country);
  const currency = getCurrencyForCountry(schoolCountry);
  const symbol = getCurrencySymbol(currency);

  const intl = normalizeFee(relRow.extra_appication_fee);

  const isDomestic =
    Number.isFinite(Number(userCountryId)) &&
    Number(userCountryId) === schoolCountry;

  let domestic = null;
  if (isDomestic) {
    const domesticKey = getDomesticMetaKeyForCountry(schoolCountry);
    if (domesticKey) {
      let rawDomestic = relRow[domesticKey];
      if (typeof rawDomestic === "undefined") {
        rawDomestic = await getRelMeta(db, relId, domesticKey);
      }
      domestic = normalizeFee(rawDomestic);
    }
  }

  const application = isDomestic && domestic !== null ? domestic : intl;
  const submission = 100;
  const review = 50;

  return {
    application,
    submission,
    total: (application || 0) + submission,
    review,
    currency,
    symbol,
    isDomestic,
    raw: { international: intl, domestic },
  };
}
