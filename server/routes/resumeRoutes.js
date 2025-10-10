// server/routes/resumeRoutes.js   (ESM)

import express from "express";
import db from "../config/db.config.js";
import { v4 as uuidv4 } from "uuid";
import { authenticateToken } from "../middleware/authMiddleware.js";

import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { execFile } from "child_process";
import { promisify } from "util";
const execFileAsync = promisify(execFile);

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/* ----------------- Helpers ----------------- */

const toStr = (x) => (x === undefined || x === null ? "" : String(x)).trim();
const clean = (s) => {
  const t = toStr(s);
  return t && t.toLowerCase() !== "undefined" && t.toLowerCase() !== "null"
    ? t
    : "";
};

function parsePersonal(personal) {
  if (!personal) return {};
  if (typeof personal === "object") {
    // اگر از API/DB به‌صورت ساختاری آمد، تلاش کنیم فیلدهای استاندارد بسازیم
    return {
      name: clean(personal.fullName || personal.name || ""),
      title: clean(personal.headline || personal.title || ""),
      city: clean(personal.city || ""),
      phone: clean(personal.phone || ""),
      email: clean(personal.email || ""),
      linkedin: clean(personal.linkedin || ""),
    };
  }

  const lines = String(personal)
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const out = {
    name: clean(lines[0] || ""),
    title: "",
    city: "",
    phone: "",
    email: "",
    linkedin: "",
  };

  if (lines.length >= 2) {
    // اگر خط دوم شبیه ایمیل/لینکدین/تلفن نیست، عنوان فرض می‌کنیم
    const l2 = lines[1];
    const looksLikeContact =
      /@/.test(l2) ||
      /linkedin\.com/i.test(l2) ||
      /phone/i.test(l2) ||
      /\d/.test(l2);
    if (!looksLikeContact) out.title = clean(l2);
  }

  // بقیه‌ی خطوط را به‌عنوان کانتکت بررسی می‌کنیم (از خط 2 به بعد)
  const contactCandidates = lines.slice(out.title ? 2 : 1);

  // هر خط را اگر خودش شامل '|' بود تکه‌تکه می‌کنیم
  const tokens = contactCandidates
    .flatMap((ln) => ln.split("|"))
    .map((s) => s.trim())
    .filter(Boolean);

  for (const raw of tokens) {
    const t = clean(raw.replace(/^(phone|tel|email|linkedin)\s*:\s*/i, ""));
    if (!t) continue;
    if (/@/.test(t)) out.email = t;
    else if (/linkedin\.com/i.test(t)) out.linkedin = t;
    else if (/\d/.test(t)) out.phone = t;
    else out.city = out.city ? `${out.city} | ${t}` : t;
  }

  return out;
}

function getSofficePath() {
  if (process.env.LIBREOFFICE_PATH) return process.env.LIBREOFFICE_PATH;

  if (process.platform === "win32") {
    const candidates = [
      "C:\\Program Files\\LibreOffice\\program\\soffice.com",
      "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.com",
      "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
      "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe",
    ];
    for (const c of candidates) {
      try {
        if (fs.existsSync(c)) return c;
      } catch {}
    }
    return "soffice.com";
  }

  const candidates = [
    "/usr/bin/soffice",
    "/usr/local/bin/soffice",
    "/snap/bin/libreoffice",
    "/Applications/LibreOffice.app/Contents/MacOS/soffice",
  ];
  for (const c of candidates) {
    try {
      if (fs.existsSync(c)) return c;
    } catch {}
  }
  return "soffice";
}

/* ---------------- helpers: safe JSON parse + user meta/context + legacy fallback ---------------- */

function safeParseJSON(raw) {
  if (typeof raw !== "string") return raw;
  try {
    const v = JSON.parse(raw);
    if (v && typeof v === "object") return v;
    return raw; // رشته‌ی معمولی
  } catch {
    return raw; // متن ساده
  }
}
// ---------- Helpers to stringify structured sections for export/preview ----------

function textFromItemList(v) {
  try {
    if (!v) return "";
    if (typeof v === "string") return v;
    if (Array.isArray(v?.items))
      return v.items.map((t) => `• ${toStr(t)}`).join("\n");
    if (Array.isArray(v)) return v.map((t) => `• ${toStr(t)}`).join("\n");
    return toStr(v);
  } catch {
    return toStr(v);
  }
}

function textFromExperience(v) {
  try {
    if (!v) return "";
    if (typeof v === "string") return v;
    const blocks = Array.isArray(v?.blocks) ? v.blocks : [];
    return blocks
      .map((b) => {
        const header = [
          toStr(b.role),
          [toStr(b.organization), toStr(b.location)].filter(Boolean).join(", "),
          [toStr(b.startDate), toStr(b.endDate)].filter(Boolean).join(" - "),
        ]
          .filter(Boolean)
          .join("\n");
        const bullets = Array.isArray(b.bullets) ? b.bullets : [];
        const lines = bullets.map((t) => `• ${toStr(t)}`).join("\n");
        return [header, lines].filter(Boolean).join("\n");
      })
      .filter(Boolean)
      .join("\n\n");
  } catch {
    return toStr(v);
  }
}

function textFromEducation(v) {
  try {
    if (!v) return "";
    if (typeof v === "string") return v;
    const blocks = Array.isArray(v?.blocks) ? v.blocks : [];
    return blocks
      .map((b) => {
        const line1 = toStr(b.title);
        const line2 = [toStr(b.university)].filter(Boolean).join("");
        const line3 = [toStr(b.start), toStr(b.end)]
          .filter(Boolean)
          .join(" - ");
        const line4 = toStr(b.description);
        return [line1, line2, line3, line4].filter(Boolean).join("\n");
      })
      .filter(Boolean)
      .join("\n\n");
  } catch {
    return toStr(v);
  }
}

function textFromCertsSkills(v) {
  try {
    if (!v) return "";
    if (typeof v === "string") return v;
    const blocks = Array.isArray(v?.blocks) ? v.blocks : [];
    const lines = [];
    blocks.forEach((b, idx) => {
      if (toStr(b.header)) lines.push(`${idx + 1}. ${toStr(b.header)}`);
      if (Array.isArray(b.skills) && b.skills.length) {
        lines.push(b.skills.map((s) => `• ${toStr(s)}`).join("\n"));
      }
    });
    return lines.filter(Boolean).join("\n");
  } catch {
    return toStr(v);
  }
}

function textFromAwards(v) {
  try {
    if (!v) return "";
    if (typeof v === "string") return v;
    const blocks = Array.isArray(v?.blocks) ? v.blocks : [];
    return blocks
      .map(
        (b, i) =>
          `${i + 1}. ${toStr(b.title)}${
            b.orgAndDate ? " — " + toStr(b.orgAndDate) : ""
          }`
      )
      .join("\n");
  } catch {
    return toStr(v);
  }
}

function textFromMemberships(v) {
  try {
    if (!v) return "";
    if (typeof v === "string") return v;
    const blocks = Array.isArray(v?.blocks) ? v.blocks : [];
    return blocks
      .map(
        (b, i) =>
          `${i + 1}. ${toStr(b.organization)}${
            b.date ? " (" + toStr(b.date) + ")" : ""
          }`
      )
      .join("\n");
  } catch {
    return toStr(v);
  }
}

function textFromRefs(v) {
  try {
    if (!v) return "";
    if (typeof v === "string") return v;
    const blocks = Array.isArray(v?.blocks) ? v.blocks : [];
    return blocks
      .map((b, i) => {
        const line1 = `${i + 1}. ${toStr(b.nameTitle)}${
          b.place ? " — " + toStr(b.place) : ""
        }`;
        const line2 = toStr(b.contact);
        return [line1, line2].filter(Boolean).join("\n");
      })
      .join("\n\n");
  } catch {
    return toStr(v);
  }
}

// همه‌ی user_meta را به‌صورت map برمی‌گرداند
async function getUserMetaMap(connectionOrDb, userId) {
  const [rows] = await connectionOrDb.execute(
    "SELECT meta_key, meta_value FROM qacom_wp_usermeta WHERE user_id = ?",
    [userId]
  );
  const map = {};
  for (const r of rows || []) {
    map[r.meta_key] = r.meta_value;
  }
  return map;
}

// ساختن context برای Badgeها از user_meta
function buildContextFromUserMeta(meta) {
  const firstName = meta["first_name"] || meta["profile_first_name"] || "";
  const lastName = meta["last_name"] || meta["profile_last_name"] || "";
  const user_name = (meta["display_name"] || `${firstName} ${lastName}`).trim();

  const target =
    meta["target"] ||
    meta["profile_target"] ||
    meta["desired_program"] ||
    meta["cv_target"] ||
    "";

  const country =
    meta["country"] ||
    meta["profile_country"] ||
    meta["location_country"] ||
    "";

  return { user_name, target, country };
}

// مپ کلید سکشن‌ها به meta_key های قدیمی PHP
const LEGACY_META_MAP = {
  personal: ["cv_header"],
  summary: ["cv_summary", "profile_summary"],
  interests: ["cv_research_interest"],
  education: ["cv_education", "profile_education"],
  experience: ["cv_professional_history", "profile_work_experience"],
  publications: ["cv_publication"],
  skills: ["cv_certification", "profile_skills"],
  awards: ["cv_honors_and_awards"],
  memberships: ["cv_memberships"],
  hobbies: ["cv_interest_and_hobbies"],
  refs: ["cv_references"],
};

// تلاش برای ساخت سکشن از meta قدیمی
function tryBuildSectionFromLegacyMeta(sectionKey, meta) {
  const keys = LEGACY_META_MAP[sectionKey] || [];
  for (const k of keys) {
    const raw = meta[k];
    if (!raw) continue;

    // اگر داده‌ها JSON باشند parse می‌شود؛ اگر نه، همان raw برمی‌گردد
    const parsed = safeParseJSON(raw);

    const isObj = parsed && typeof parsed === "object";
    const isNonEmptyString =
      typeof parsed === "string" && parsed.trim().length > 0;

    if (isObj || isNonEmptyString) {
      return parsed;
    }
  }
  return null;
}

// -- کمک‌تابع‌ها: --

function getMeta(map, key) {
  return map[key] !== undefined ? map[key] : null;
}

function asString(v, fallback = "") {
  if (v == null) return fallback;
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

// ساخت خروجی ساختاری برای Research Interests
function buildInterests(metaVal) {
  // انتظار: { research_interest: ["AI","ML", ...] } یا آرایهٔ ساده
  const v = safeParseJSON(metaVal);
  let items = [];
  if (v && typeof v === "object") {
    if (Array.isArray(v.research_interest)) items = v.research_interest;
    else if (Array.isArray(v)) items = v;
  }
  if (!items || !items.length) return null; // خالی بفرست تا فرانت fallback کند
  return { items };
}

// ساخت خروجی ساختاری برای Experience
function buildExperience(metaVal) {
  // انتظار: آرایه‌ای از ردیف‌ها: { role, organization, location, startDate, endDate, bullets[] }
  // ولی از PHP ممکنه شکل‌های دیگه باشه؛ اینجا best-effort می‌کنیم.
  const v = safeParseJSON(metaVal);
  if (!v) return null;

  let rows = [];
  if (Array.isArray(v)) rows = v;
  else if (v && typeof v === "object" && Array.isArray(v.rows)) rows = v.rows;

  const blocks = (rows || [])
    .map((r) => {
      const bullets = Array.isArray(r?.bullets)
        ? r.bullets
        : Array.isArray(r?.items)
        ? r.items
        : [];
      return {
        role: r?.role || r?.position || r?.title || "",
        organization: r?.organization || r?.company_name || r?.university || "",
        location: r?.location || "",
        startDate: r?.startDate || r?.from || "",
        endDate: r?.endDate || r?.to || "",
        bullets,
      };
    })
    .filter((b) => b.role || b.organization || (b.bullets && b.bullets.length));

  if (!blocks.length) return null;
  return { blocks };
}
// interests / hobbies / publications → ItemListData { items: string[] }
function buildItemList(metaVal, { pick } = {}) {
  const v = safeParseJSON(metaVal);
  let items = [];
  if (pick === "research_interest") {
    if (v && typeof v === "object") {
      if (Array.isArray(v.research_interest)) items = v.research_interest;
      else if (Array.isArray(v)) items = v;
    }
  } else if (pick === "hobbies") {
    items = Array.isArray(v?.interest) ? v.interest : Array.isArray(v) ? v : [];
  } else if (pick === "publications") {
    const lines = [];
    const j = Array.isArray(v?.journals) ? v.journals : [];
    j.forEach((it) => {
      const line = `${asString(it.author, "")} — "${asString(
        it.title || it.name,
        ""
      )}". ${asString(it.name || it.journal, "")} ${asString(
        it.volume || "",
        ""
      )} ${asString(it.page_numbers || "", "")} (${asString(
        it.date || "",
        ""
      )})`
        .replace(/\s+/g, " ")
        .trim();
      if (line) lines.push(line);
    });
    const c = Array.isArray(v?.conferences) ? v.conferences : [];
    c.forEach((it) => {
      const line = `${asString(it.author, "")} — "${asString(
        it.presentation_title || it.title,
        ""
      )}". ${asString(it.conference_name || "", "")}, ${asString(
        it.location || "",
        ""
      )} (${asString(it.date || "", "")})`
        .replace(/\s+/g, " ")
        .trim();
      if (line) lines.push(line);
    });
    items = lines;
  } else {
    items = Array.isArray(v) ? v : [];
  }
  return items.length ? { items } : null;
}

// Education → { blocks: [{ title, university, description?, start?, end? }] }
function buildEducationBlocks(metaVal) {
  const v = safeParseJSON(metaVal);
  const rows = Array.isArray(v) ? v : Array.isArray(v?.rows) ? v.rows : [];
  const blocks = rows
    .map((r) => ({
      title: [r?.level, r?.program].filter(Boolean).join(" — ") || "",
      university: r?.university || r?.school || "",
      description: r?.description || r?.thesis || r?.dissertation || "",
      start: r?.startDate || r?.from || "",
      end: r?.endDate || r?.to || "",
    }))
    .filter((b) => b.title || b.university || b.description);
  return blocks.length ? { blocks } : null;
}

// Experience → { blocks: [{ role, organization, location?, startDate?, endDate?, bullets: string[] }] }
function buildExperienceBlocks(metaVal) {
  const v = safeParseJSON(metaVal);
  let rows = [];
  if (Array.isArray(v)) rows = v;
  else if (v && typeof v === "object" && Array.isArray(v.rows)) rows = v.rows;

  const blocks = (rows || [])
    .map((r) => {
      const bullets = Array.isArray(r?.bullets)
        ? r.bullets
        : Array.isArray(r?.items)
        ? r.items
        : [];
      return {
        role: r?.role || r?.position || r?.title || "",
        organization: r?.organization || r?.company_name || r?.university || "",
        location: r?.location || "",
        startDate: r?.startDate || r?.from || "",
        endDate: r?.endDate || r?.to || "",
        bullets: bullets.filter(Boolean),
      };
    })
    .filter(
      (b) =>
        b.role ||
        b.organization ||
        (Array.isArray(b.bullets) && b.bullets.length)
    );

  return blocks.length ? { blocks } : null;
}

// Certifications & Skills → { blocks: [{ header, skills: string[] }, ...] }
function buildCertsSkillsBlocks(certMeta, skillsMeta) {
  const cert = safeParseJSON(certMeta);
  const skills = safeParseJSON(skillsMeta);

  const certs = Array.isArray(cert)
    ? cert
    : Array.isArray(cert?.items)
    ? cert.items
    : [];
  const blocks = certs
    .map((c) => {
      const header = `${asString(c?.title, "")}${
        c?.company_name || c?.issuer
          ? " (" + asString(c?.company_name || c?.issuer, "") + ")"
          : ""
      }${
        c?.date || c?.issued ? ", " + asString(c?.date || c?.issued, "") : ""
      }${c?.license_number ? " #" + asString(c?.license_number, "") : ""}`
        .replace(/\s+/g, " ")
        .trim();
      return header ? { header, skills: [] } : null;
    })
    .filter(Boolean);

  const skillItems = Array.isArray(skills?.item)
    ? skills.item
    : Array.isArray(skills)
    ? skills
    : [];
  if (skillItems.length) {
    if (blocks.length === 0) blocks.push({ header: "Skills", skills: [] });
    blocks[0].skills = skillItems.map((s) => String(s)).filter(Boolean);
  }

  return blocks.length ? { blocks } : null;
}

// Awards → { blocks: [{ title, orgAndDate }] }
function buildAwardsBlocks(metaVal) {
  const v = safeParseJSON(metaVal);
  const rows = Array.isArray(v) ? v : Array.isArray(v?.rows) ? v.rows : [];
  const blocks = rows
    .map((r) => ({
      title: asString(r?.title, ""),
      orgAndDate: `${asString(r?.organization_name || r?.org, "")}${
        r?.date ? " , " + asString(r?.date, "") : ""
      }`
        .replace(/\s+/g, " ")
        .trim(),
    }))
    .filter((b) => b.title || b.orgAndDate);
  return blocks.length ? { blocks } : null;
}

// Memberships → { blocks: [{ organization, date }] }
function buildMembershipsBlocks(metaVal) {
  const v = safeParseJSON(metaVal);
  const rows = Array.isArray(v) ? v : Array.isArray(v?.rows) ? v.rows : [];
  const blocks = rows
    .map((r) => ({
      organization: asString(r?.organization_name || r?.organization, ""),
      date: asString(r?.date || "", ""),
    }))
    .filter((b) => b.organization || b.date);
  return blocks.length ? { blocks } : null;
}

// Refs → { blocks: [{ nameTitle, place, contact }] }
function buildRefsBlocks(metaVal) {
  const v = safeParseJSON(metaVal);
  const rows = Array.isArray(v) ? v : Array.isArray(v?.rows) ? v.rows : [];
  const blocks = rows
    .map((r) => ({
      nameTitle: `${asString(r?.name, "")}${
        r?.title ? " - " + asString(r?.title, "") : ""
      }`.trim(),
      place: asString(r?.place || "", ""),
      contact: [
        r?.tel ? `Tel: ${asString(r?.tel, "")}` : "",
        r?.email ? `Email: ${asString(r?.email, "")}` : "",
      ]
        .filter(Boolean)
        .join(" - "),
    }))
    .filter((b) => b.nameTitle || b.place || b.contact);
  return blocks.length ? { blocks } : null;
}

// ---------- GET /resume-data/prefill ----------
router.get("/prefill", authenticateToken, async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    // 1) userId از ایمیل توکن
    const [userRows] = await connection.execute(
      "SELECT ID FROM qacom_wp_users WHERE user_email = ?",
      [req.user.email]
    );
    const userId = userRows?.[0]?.ID;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User ID not found." });
    }

    // 2) خواندن متاهای ضروری یک‌جا
    const metaKeys = [
      // Header / Summary / Interests / Education / Experience ...
      "cv_header",
      "cv_summary",
      "cv_research_interest",
      "cv_education",
      "cv_professional_history",
      "cv_publication",
      "cv_certification",
      "cv_honors_and_awards",
      "cv_memberships",
      "cv_interest_and_hobbies",
      "cv_references",

      // fallbacks
      "profile_education",
      "profile_work_experience",
      "profile_skills",
      "profile_summary",

      "application_level", // <<— به جای target_level
      "country",

      // فالبک پرسونال
      "first_name",
    ];

    const placeholders = metaKeys.map(() => "?").join(",");
    const [metaRows] = await connection.execute(
      `SELECT meta_key, meta_value
   FROM qacom_wp_usermeta
   WHERE user_id = ?
     AND meta_key IN (${placeholders})`,
      [userId, ...metaKeys]
    );

    const metaMap = new Map();
    for (const r of metaRows) {
      metaMap.set(r.meta_key, r.meta_value);
    }
    const get = (k) => {
      const v = metaMap.get(k);
      if (v == null) return null;
      // اگر value سریالایز شده‌ی PHP باشد و JSON نباشد،
      // همین حالا به متن ساده/JSON تبدیلش نمی‌کنیم؛
      // در ادامه فقط جاهایی که لازم است، parse می‌کنیم.
      return v;
    };

    // 1) personal/header
    let personal = get("cv_header"); // متن آماده اگر قبلاً ذخیره شده باشد

    if (!personal || !String(personal).trim()) {
      const firstName = get("first_name"); // از usermeta
      const emailFromToken = req.user?.email || ""; // از توکن
      if (firstName || emailFromToken) {
        // یک فالبک ساده و تمیز بساز
        personal = [firstName || "", emailFromToken || ""]
          .filter(Boolean)
          .join("\n");
      } else {
        personal = ""; // بگذار UI placeholder خودش را نشان دهد
      }
    }

    // 3) ساخت سکشن‌ها (خالی اگر نداریم؛ فرانت fallback دارد)
    const sections = {
      personal: {
        title: "Personal Informations",
        content: personal, // رشته یا آبجکت؛ فرانت parse می‌کند
      },
      summary: {
        title: "Summary",
        content:
          asString(getMeta(metaMap, "cv_summary"), "") ||
          asString(getMeta(metaMap, "profile_summary"), ""),
      },
      interests: {
        title: "Research Interests",
        content:
          buildItemList(getMeta(metaMap, "cv_research_interest"), {
            pick: "research_interest",
          }) || null,
      },
      education: {
        title: "Education",
        content:
          buildEducationBlocks(getMeta(metaMap, "cv_education")) ||
          buildEducationBlocks(getMeta(metaMap, "profile_education")) ||
          null,
      },
      experience: {
        title: "Professional History / Experience",
        content:
          buildExperienceBlocks(getMeta(metaMap, "cv_professional_history")) ||
          buildExperienceBlocks(getMeta(metaMap, "profile_work_experience")) ||
          null,
      },
      publications: {
        title: "Publications",
        content:
          buildItemList(getMeta(metaMap, "cv_publication"), {
            pick: "publications",
          }) || null,
      },
      skills: {
        title: "Certifications and Skills",
        content:
          buildCertsSkillsBlocks(
            getMeta(metaMap, "cv_certification"),
            getMeta(metaMap, "profile_skills")
          ) || null,
      },
      awards: {
        title: "Honors and Awards",
        content:
          buildAwardsBlocks(getMeta(metaMap, "cv_honors_and_awards")) || null,
      },
      memberships: {
        title: "Memberships",
        content:
          buildMembershipsBlocks(getMeta(metaMap, "cv_memberships")) || null,
      },
      hobbies: {
        title: "Interest and Hobbies",
        content:
          buildItemList(getMeta(metaMap, "cv_interest_and_hobbies"), {
            pick: "hobbies",
          }) || null,
      },
      refs: {
        title: "References",
        content: buildRefsBlocks(getMeta(metaMap, "cv_references")) || null,
      },
    };

    const applicationLevel = get("application_level");
    const country = get("country");
    // 4) کانتکست برای Badgeها
    const context = {
      target_level: applicationLevel || null, // قبلاً target_level بود
      country: country || null,
    };

    return res.json({ sections, context });
  } catch (err) {
    console.error("prefill error:", err);
    return res
      .status(500)
      .json({ message: "Failed to prefill.", error: err?.message });
  }
});

/* ------------------------- GET /templates ------------------------- */
router.get("/templates", authenticateToken, async (req, res) => {
  try {
    if (!db || typeof db.execute !== "function") {
      return res.status(500).json({ message: "DB not ready" });
    }
    const query = `
      SELECT cv.ID AS id, posts.guid AS image, cv.program_id, cv.level, cv.date
      FROM qacom_wp_apply_cv_file cv
      JOIN qacom_wp_posts posts ON cv.file = posts.ID
      WHERE posts.post_type = 'attachment'
    `;
    const [rows] = await db.execute(query);
    const processed = rows.map((t) => ({
      id: t.id,
      image: t.image,
      program_id: t.program_id,
      level: t.level,
      date: t.date,
      name: `Resume Template ${t.id}`,
      description: "A professional and modern resume template.",
      popular: Math.random() > 0.7,
    }));
    res.json(processed);
  } catch (error) {
    console.error("Error fetching resume templates:", error);
    res.status(500).json({
      message: "Failed to fetch resume templates.",
      error: error.message,
    });
  }
});

/* -------------------- GET /user-resumes-summary ------------------- */
router.get("/user-resumes-summary", authenticateToken, async (req, res) => {
  try {
    const [user] = await db.execute(
      "SELECT ID FROM qacom_wp_users WHERE user_email=?",
      [req.user.email]
    );
    const userId = user?.[0]?.ID;
    if (!userId)
      return res
        .status(401)
        .json({ message: "Unauthorized: User ID not found." });

    const query = `
      SELECT resume_id, template_id ,MAX(created_at) AS updated_at ,COUNT(*) AS sections_count
      FROM qacom_wp_user_resume
      WHERE user_id = ?
      GROUP BY resume_id, template_id
    `;
    const [rows] = await db.execute(query, [userId]);
    const summary = rows.map((row, i) => ({
      resume_id: row.resume_id,
      template_id: row.template_id,
      display_name: `Resume ${i + 1} (T: ${row.template_id})`,
    }));
    res.json(summary);
  } catch (error) {
    console.error("Error fetching user resumes summary:", error);
    res.status(500).json({
      message: "Failed to fetch user resumes summary.",
      error: error.message,
    });
  }
});

/* ------------------------ GET /resume/:id ------------------------- */
router.get("/resume/:resumeId", authenticateToken, async (req, res) => {
  function tryParseJSON(s) {
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  }

  try {
    const { resumeId } = req.params;

    // 1) گرفتن user_id از ایمیل توکن
    const [user] = await db.execute(
      "SELECT ID FROM qacom_wp_users WHERE user_email = ?",
      [req.user.email]
    );
    const userId = user?.[0]?.ID;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User ID not found." });
    }

    // 2) خواندن سکشن‌های رزومه
    const [rows] = await db.execute(
      `SELECT section, content, template_id, created_at
       FROM qacom_wp_user_resume
       WHERE user_id = ? AND resume_id = ?`,
      [userId, resumeId]
    );
    if (!rows?.length) {
      return res
        .status(404)
        .json({ message: "Resume not found or not owned by user." });
    }

    // 3) آن‌رب محتوا
    const sections = {};
    for (const r of rows) {
      let val = r.content;
      if (typeof val === "string") {
        const parsed = tryParseJSON(val);
        if (parsed && typeof parsed === "object") {
          // حالت قدیمی: {"title":"...","content": ...} یا مستقیماً آبجکت محتوا
          if ("content" in parsed) {
            sections[r.section] = parsed.content; // فقط محتوا
          } else {
            sections[r.section] = parsed; // خود آبجکت محتوا
          }
        } else {
          sections[r.section] = val; // متن ساده
        }
      } else if (val && typeof val === "object") {
        sections[r.section] = val; // به ندرت: اگر DB json-type باشد
      } else {
        sections[r.section] = ""; // خالی
      }
    }

    // 4) context برای Badgeها از usermeta
    const [meta] = await db.execute(
      `SELECT meta_key, meta_value 
         FROM qacom_wp_usermeta 
        WHERE user_id = ? 
          AND meta_key IN ('application_level','application_country')`,
      [userId]
    );
    const ctx = {};
    for (const m of meta || []) {
      if (m.meta_key === "application_level")
        ctx.target_level = m.meta_value || null;
      if (m.meta_key === "application_country")
        ctx.country = m.meta_value || null;
    }

    res.json({
      resume_id: resumeId,
      template_id: rows[0].template_id,
      sections,
      context: ctx,
      display_name: `Resume (T: ${rows[0].template_id})`,
      created_at: rows[0].created_at,
    });
  } catch (error) {
    console.error("Error fetching resume:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch resume.", error: error.message });
  }
});

/* ------------------------- POST /save-resume ---------------------- */
router.post("/save-resume", authenticateToken, async (req, res) => {
  const { resume_id, template_id, sections } = req.body || {};
  if (!sections || typeof sections !== "object") {
    return res.status(400).json({ message: "sections is required" });
  }

  let connection;
  try {
    connection = await db.getConnection();

    // 1) user_id
    const [userRows] = await connection.execute(
      "SELECT ID FROM qacom_wp_users WHERE user_email = ?",
      [req.user.email]
    );
    const userId = userRows?.[0]?.ID;
    if (!userId) {
      connection.release();
      return res
        .status(401)
        .json({ message: "Unauthorized: User ID not found." });
    }

    // 2) تعیین resumeId
    const currentResumeId =
      resume_id && resume_id !== "new_resume_placeholder"
        ? resume_id
        : uuidv4();

    await connection.beginTransaction();

    // 3) حلقه‌ی سکشن‌ها با نرمال‌سازی content
    for (const sectionId of Object.keys(sections)) {
      const payload = sections[sectionId];
      let dbContent;

      if (typeof payload === "string") {
        // متن ساده
        dbContent = payload;
      } else if (payload && typeof payload === "object") {
        // { title, content } یا مستقیماً content
        const inner = "content" in payload ? payload.content : payload;
        if (typeof inner === "string") {
          dbContent = inner; // متن
        } else {
          dbContent = JSON.stringify(inner || {}); // آبجکت ساختاری
        }
      } else {
        dbContent = "";
      }

      // آیا قبلاً این سکشن برای این رزومه ذخیره شده؟
      const [existing] = await connection.execute(
        `SELECT 1 FROM qacom_wp_user_resume WHERE user_id=? AND resume_id=? AND section=?`,
        [userId, currentResumeId, sectionId]
      );

      if (existing.length) {
        await connection.execute(
          `UPDATE qacom_wp_user_resume
              SET content=?, template_id=?
            WHERE user_id=? AND resume_id=? AND section=?`,
          [
            dbContent,
            Number(template_id ?? 0),
            userId,
            currentResumeId,
            sectionId,
          ]
        );
      } else {
        await connection.execute(
          `INSERT INTO qacom_wp_user_resume
             (resume_id, user_id, template_id, section, content, created_at)
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [
            currentResumeId,
            userId,
            Number(template_id ?? 0),
            sectionId,
            dbContent,
          ]
        );
      }
    }

    await connection.commit();
    res.json({
      success: true,
      message:
        resume_id && resume_id !== "new_resume_placeholder"
          ? "Resume saved successfully!"
          : "New resume created and saved successfully!",
      new_resume_id: currentResumeId,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error saving resume:", error);
    res
      .status(500)
      .json({ message: "Failed to save resume.", error: error.message });
  } finally {
    if (connection) connection.release();
  }
});
/* ----------------------- DELETE /resume/:id ----------------------- */
router.delete("/resume/:resumeId", authenticateToken, async (req, res) => {
  try {
    const { resumeId } = req.params;

    // 1) user_id را از ایمیل توکن پیدا کن
    const [user] = await db.execute(
      "SELECT ID FROM qacom_wp_users WHERE user_email = ?",
      [req.user.email]
    );
    const userId = user?.[0]?.ID;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User ID not found." });
    }

    // 2) مطمئن شو این رزومه برای همین کاربره
    const [exists] = await db.execute(
      `SELECT 1 FROM qacom_wp_user_resume
       WHERE user_id = ? AND resume_id = ?
       LIMIT 1`,
      [userId, resumeId]
    );
    if (!exists?.length) {
      return res
        .status(404)
        .json({ message: "Resume not found or not owned by user." });
    }

    // 3) حذف همه‌ی سکشن‌های همین رزومه برای این کاربر
    await db.execute(
      `DELETE FROM qacom_wp_user_resume
       WHERE user_id = ? AND resume_id = ?`,
      [userId, resumeId]
    );

    // 4) بدون بدنه
    return res.status(204).end();
  } catch (error) {
    console.error("Error deleting resume:", error);
    return res
      .status(500)
      .json({ message: "Failed to delete resume.", error: error.message });
  }
});

/* ------------------------- POST /export --------------------------- */
// router.post("/export", authenticateToken, async (req, res) => {
//   try {
//     const {
//       resume_id,
//       template_id: bodyTemplateId,
//       format = "pdf",
//     } = req.body || {};
//     if (!resume_id)
//       return res.status(400).json({ error: "resume_id is required" });

//     // 1) user_id
//     const [u] = await db.execute(
//       "SELECT ID FROM qacom_wp_users WHERE user_email=?",
//       [req.user.email]
//     );
//     const userId = u?.[0]?.ID;
//     if (!userId) return res.status(401).json({ error: "Unauthorized" });

//     // 2) سکشن‌ها برای همین کاربر+رزومه
//     const [rows] = await db.execute(
//       `SELECT section, content, template_id
//          FROM qacom_wp_user_resume
//         WHERE user_id=? AND resume_id=?
//         ORDER BY created_at ASC`,
//       [userId, resume_id]
//     );
//     if (!rows?.length)
//       return res.status(404).json({ error: "Resume not found" });

//     // 3) templateId مؤثر: body → ذخیره‌شده → دیفالت
//     const storedTemplateId =
//       rows.find((r) => r.template_id)?.template_id || rows[0].template_id || 80;
//     const effectiveTemplateId = Number.isFinite(+bodyTemplateId)
//       ? +bodyTemplateId
//       : storedTemplateId;
//     res.setHeader("X-Template-Used", String(effectiveTemplateId));

//     // 4) sections
//     const sections = {};
//     for (const r of rows) {
//       const v = r.content;
//       try {
//         const p = typeof v === "string" ? JSON.parse(v) : v;
//         sections[r.section] = p?.content ?? p?.text ?? p ?? "";
//       } catch {
//         sections[r.section] = v ?? "";
//       }
//     }

//     // 5) داده‌ها برای تمپلیت
//     const p = parsePersonal(sections.personal);
//     const personal_line2 = [p.title, p.city, p.phone, p.email, p.linkedin]
//       .map(clean)
//       .filter(Boolean)
//       .join(" | ");

//     const templateData = {
//       personal_name: clean(p.name),
//       personal_line2,
//       summary: clean(sections.summary),
//       interests: clean(sections.interests),
//       education: clean(sections.education),
//       experience: clean(sections.experience),
//       publications: clean(sections.publications),
//       skills: clean(sections.skills),
//       awards: clean(sections.awards),
//       memberships: clean(sections.memberships),
//       hobbies: clean(sections.hobbies),
//       refs: clean(sections.refs),
//     };

//     // 6) بارگذاری و Merge
//     const templatePath = path.resolve(
//       __dirname,
//       "..",
//       "templates",
//       `${effectiveTemplateId}.docx`
//     );
//     const buf = fs.readFileSync(templatePath);
//     const isZipLike =
//       Buffer.isBuffer(buf) &&
//       buf.length > 4 &&
//       buf[0] === 0x50 &&
//       buf[1] === 0x4b;
//     if (!isZipLike) {
//       console.error("Template is not a valid DOCX (zip)", {
//         templatePath,
//         size: buf.length,
//         head: buf.slice(0, 16).toString("hex"),
//         effectiveTemplateId,
//       });
//       return res.status(500).json({
//         error: "Template file is not a valid DOCX (zip).",
//         templatePath,
//         effectiveTemplateId,
//       });
//     }

//     const zip = new PizZip(buf);
//     const doc = new Docxtemplater(zip, {
//       paragraphLoop: true,
//       linebreaks: true,
//       delimiters: { start: "{{", end: "}}" },
//     });

//     let outDocx;
//     try {
//       doc.render(templateData);
//       outDocx = doc.getZip().generate({ type: "nodebuffer" });
//     } catch (e) {
//       console.error(
//         "Docx render error:",
//         JSON.stringify(e.properties || e, null, 2)
//       );
//       return res.status(500).json({ error: "Docx render error: Multi error" });
//     }

//     // 7) خروجی
//     const fmt = String(format).toLowerCase();

//     if (fmt === "doc" || fmt === "docx") {
//       res.setHeader(
//         "Content-Type",
//         "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//       );
//       res.setHeader(
//         "Content-Disposition",
//         `attachment; filename="resume-${resume_id}.docx"`
//       );
//       return res.end(outDocx);
//     }

//     if (fmt === "pdf") {
//       const tmpDir = path.resolve(__dirname, "..", "tmp");
//       if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

//       const docxPath = path.join(tmpDir, `resume-${resume_id}.docx`);
//       const pdfPath = path.join(tmpDir, `resume-${resume_id}.pdf`);
//       fs.writeFileSync(docxPath, outDocx);

//       const sofficePath = getSofficePath();

//       try {
//         await execFileAsync(sofficePath, [
//           "--headless",
//           "--nologo",
//           "--nodefault",
//           "--nofirststartwizard",
//           "--nolockcheck",
//           "--norestore",
//           "--convert-to",
//           "pdf:writer_pdf_Export",
//           "--outdir",
//           tmpDir,
//           docxPath,
//         ]);
//       } catch (convErr) {
//         console.error("LibreOffice convert error:", convErr);
//         return res.status(500).json({
//           error:
//             "PDF export failed (LibreOffice missing or wrong path). Set LIBREOFFICE_PATH.",
//         });
//       }

//       if (!fs.existsSync(pdfPath)) {
//         return res
//           .status(500)
//           .json({ error: "PDF export failed (output not found)" });
//       }

//       const pdf = fs.readFileSync(pdfPath);
//       res.setHeader("Content-Type", "application/pdf");
//       res.setHeader(
//         "Content-Disposition",
//         `inline; filename="resume-${resume_id}.pdf"`
//       );
//       return res.end(pdf);
//     }

//     // txt fallback
//     const txt = Object.entries(sections)
//       .map(([k, v]) => `${String(k).toUpperCase()}\n${toStr(v)}\n`)
//       .join("\n");
//     res.setHeader("Content-Type", "text/plain; charset=utf-8");
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename="resume-${resume_id}.txt"`
//     );
//     return res.send(txt);
//   } catch (err) {
//     console.error("EXPORT ERROR:", err);
//     return res.status(500).json({ error: String(err?.message || err) });
//   }
// });

/*--------------------------------POST /export for PaaS -------------------*/
router.post("/export", authenticateToken, async (req, res) => {
  try {
    const {
      resume_id,
      template_id: bodyTemplateId,
      format = "pdf",
    } = req.body || {};
    if (!resume_id)
      return res.status(400).json({ error: "resume_id is required" });

    // 1) user_id
    const [u] = await db.execute(
      "SELECT ID FROM qacom_wp_users WHERE user_email=?",
      [req.user.email]
    );
    const userId = u?.[0]?.ID;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // 2) sections
    const [rows] = await db.execute(
      `SELECT section, content, template_id
         FROM qacom_wp_user_resume
        WHERE user_id=? AND resume_id=?
        ORDER BY created_at ASC`,
      [userId, resume_id]
    );
    if (!rows?.length)
      return res.status(404).json({ error: "Resume not found" });

    // 3) templateId
    const storedTemplateId =
      rows.find((r) => r.template_id)?.template_id || rows[0].template_id || 80;
    const effectiveTemplateId = Number.isFinite(+bodyTemplateId)
      ? +bodyTemplateId
      : storedTemplateId;
    res.setHeader("X-Template-Used", String(effectiveTemplateId));

    // 4) build sections obj
    const sections = {};
    for (const r of rows) {
      const v = r.content;
      try {
        const p = typeof v === "string" ? JSON.parse(v) : v;
        sections[r.section] = p?.content ?? p?.text ?? p ?? "";
      } catch {
        sections[r.section] = v ?? "";
      }
    }

    // 5) data for template
    const p = parsePersonal(sections.personal);
    const personal_line2 = [p.title, p.city, p.phone, p.email, p.linkedin]
      .map(clean)
      .filter(Boolean)
      .join(" | ");

    // تبدیل محتوا به متن خوانا (object → text)
    const S = {
      summary: clean(textFromItemList(sections.summary) || sections.summary),
      interests: clean(
        textFromItemList(sections.interests) || sections.interests
      ),
      education: clean(
        textFromEducation(sections.education) || sections.education
      ),
      experience: clean(
        textFromExperience(sections.experience) || sections.experience
      ),
      publications: clean(
        textFromItemList(sections.publications) || sections.publications
      ),
      skills: clean(textFromCertsSkills(sections.skills) || sections.skills),
      awards: clean(textFromAwards(sections.awards) || sections.awards),
      memberships: clean(
        textFromMemberships(sections.memberships) || sections.memberships
      ),
      hobbies: clean(textFromItemList(sections.hobbies) || sections.hobbies),
      refs: clean(textFromRefs(sections.refs) || sections.refs),
    };

    const templateData = {
      personal_name: clean(p.name),
      personal_line2,
      summary: S.summary,
      interests: S.interests,
      education: S.education,
      experience: S.experience,
      publications: S.publications,
      skills: S.skills,
      awards: S.awards,
      memberships: S.memberships,
      hobbies: S.hobbies,
      refs: S.refs,
    };

    // ******** NEW: تعیین فرمت و HTML preview قبل از DOCX merge
    const fmt = String(format || "").toLowerCase();

    // 6-a) HTML inline preview (for PaaS / preview only; no download)
    if (fmt === "html") {
      const esc = (s) =>
        String(s ?? "").replace(
          /[&<>"']/g,
          (c) =>
            ({
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#39;",
            }[c])
        );

      const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Resume Preview</title>
<style>
  /* اجبار به تم روشن داخل iframe */
  html, body {
    background: #ffffff !important;
    color: #111111 !important;
    margin: 24px;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  }
  /* جلوی مداخله‌ی تم تیره مرورگر/اکستنشن‌ها را بگیر */
  @media (prefers-color-scheme: dark) {
    html, body { background: #ffffff !important; color: #111111 !important; }
  }

  .name { font-size: 28px; font-weight: 700; }
  .line2 { color: #555; margin-top: 4px; font-size: 14px; }
  h2 { margin: 20px 0 8px; font-size: 16px; text-transform: uppercase; letter-spacing: .04em; color: #222; }
  .sec { white-space: pre-wrap; line-height: 1.5; font-size: 14px; color: #222; }
  hr { border: 0; border-top: 1px solid #ddd; margin: 16px 0; }
</style>
</head>
<body>
  <div class="name">${esc(templateData.personal_name)}</div>
  <div class="line2">${esc(personal_line2)}</div>
  ${[
    ["Summary", templateData.summary],
    ["Education", templateData.education],
    ["Experience", templateData.experience],
    ["Publications", templateData.publications],
    ["Skills", templateData.skills],
    ["Awards", templateData.awards],
    ["Memberships", templateData.memberships],
    ["Interests", templateData.interests],
    ["Hobbies", templateData.hobbies],
    ["References", templateData.refs],
  ]
    .map(([title, content]) =>
      content
        ? `<hr/><h2>${esc(title)}</h2><div class="sec">${esc(content)}</div>`
        : ""
    )
    .join("")}
</body>
</html>`;

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="resume-${resume_id}.html"`
      );
      return res.send(html);
    }
    // ******** END HTML preview

    // 6-b) از اینجا به بعد فقط زمانی اجرا می‌شود که HTML نخواستیم: DOCX merge
    const templatePath = path.resolve(
      __dirname,
      "..",
      "templates",
      `${effectiveTemplateId}.docx`
    );
    if (!fs.existsSync(templatePath)) {
      console.error("Template file not found:", templatePath);
      return res
        .status(500)
        .json({ error: "Template file not found", templatePath });
    }
    const buf = fs.readFileSync(templatePath);
    const isZipLike =
      Buffer.isBuffer(buf) &&
      buf.length > 4 &&
      buf[0] === 0x50 &&
      buf[1] === 0x4b;
    if (!isZipLike) {
      console.error("Template is not a valid DOCX (zip)", {
        templatePath,
        size: buf.length,
        head: buf.slice(0, 16).toString("hex"),
        effectiveTemplateId,
      });
      return res.status(500).json({
        error: "Template file is not a valid DOCX (zip).",
        templatePath,
        effectiveTemplateId,
      });
    }

    const zip = new PizZip(buf);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: "{{", end: "}}" },
    });

    let outDocx;
    try {
      doc.render(templateData);
      outDocx = doc.getZip().generate({ type: "nodebuffer" });
    } catch (e) {
      console.error(
        "Docx render error:",
        JSON.stringify(e.properties || e, null, 2)
      );
      return res.status(500).json({ error: "Docx render error: Multi error" });
    }

    // 7) outputs: prefer requested, fallback if needed
    const ALLOW_PDF =
      String(process.env.EXPORT_ALLOW_PDF || "").toLowerCase() === "true";
    const DEFAULT_FORMAT = (
      process.env.EXPORT_DEFAULT_FORMAT || "docx"
    ).toLowerCase();
    const requestedFmt = String(format || "").toLowerCase() || DEFAULT_FORMAT;

    // DOCX branch (safe everywhere)
    if (requestedFmt === "doc" || requestedFmt === "docx") {
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="resume-${resume_id}.docx"`
      );
      return res.end(outDocx);
    }

    // PDF branch (only if allowed; در تست به DOCX فالبک می‌کنیم)
    if (requestedFmt === "pdf") {
      if (!ALLOW_PDF) {
        // fallback to DOCX (no LibreOffice requirement)
        res.setHeader("X-Format-Fallback", "pdf->docx");
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="resume-${resume_id}.docx"`
        );
        return res.end(outDocx);
      }

      // اگر PDF فعال است ولی تبدیل را فعلاً استفاده نمی‌کنیم، باز هم فالبک امن به DOCX:
      res.setHeader("X-Format-Fallback", "pdf->docx(disabled)");
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="resume-${resume_id}.docx"`
      );
      return res.end(outDocx);

      // ---- اگر بعداً خواستی تبدیل واقعی را فعال کنی، بلاک LibreOffice را اینجا برگردان و در نهایت return کن. ----
    }

    // txt fallback (rare)
    const txt = Object.entries(sections)
      .map(([k, v]) => `${String(k).toUpperCase()}\n${toStr(v)}\n`)
      .join("\n");
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="resume-${resume_id}.txt"`
    );
    return res.send(txt);
  } catch (err) {
    console.error("EXPORT ERROR:", err);
    return res.status(500).json({ error: String(err?.message || err) });
  }
});

export default router;
