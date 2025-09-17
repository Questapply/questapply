// server/routes/lorRoutes.js
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import db from "../config/db.config.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  serialize as phpSerialize,
  unserialize as phpUnserialize,
} from "php-serialize";
import { transporter } from "../config/mailer.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_NAME = process.env.DB_NAME; // questapply
/* ===================== ENV & Paths ===================== */
const UPLOAD_BASE_DIR =
  process.env.UPLOAD_BASE_DIR ||
  path.join(process.cwd(), "uploads", "student-documents");

const UPLOAD_BASE_URL =
  process.env.UPLOAD_BASE_URL ||
  process.env.BASE_UPLOADS_URL ||
  "http://localhost:5000/uploads/student-documents";

const BASE_APP_URL = process.env.BASE_APP_URL || "http://localhost:5173";

/* ===================== WP Tables (prefix-aware) ===================== */
const WP_PREFIX = (process.env.WP_PREFIX || "qacom_wp_").trim();

const WP_USERS = (process.env.WP_USERS_TABLE || `${WP_PREFIX}users`).trim();
const WP_USERMETA = (
  process.env.WP_USERMETA_TABLE || `${WP_PREFIX}usermeta`
).trim();
const WP_POSTS = (process.env.WP_POSTS_TABLE || `${WP_PREFIX}posts`).trim();

// LOR-specific
const TBL_LOR_SAMPLES = (
  process.env.WP_APPLY_LOR_FILE_TABLE || `${WP_PREFIX}apply_lor_file`
).trim();

// Requests table (env override → fallback to legacy name)
const TBL_LOR_REQ = (
  process.env.LOR_REQ_TABLE ||
  process.env.WP_APPLY_RECOMMENDER_REQUESTS_TABLE ||
  `${WP_PREFIX}recommender_request`
).trim();

console.info("[LOR] Using tables:", {
  TBL_LOR_REQ,
  TBL_LOR_SAMPLES,
  WP_USERS,
  WP_USERMETA,
  WP_POSTS,
});

let _reqColsCache = null;
async function getReqColMap() {
  if (_reqColsCache) return _reqColsCache;
  const [rows] = await db.execute(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
    [DB_NAME, TBL_LOR_REQ.replace(/`/g, "")]
  );
  const cols = new Set(rows.map((r) => String(r.COLUMN_NAME).toLowerCase()));
  const pick = (...names) =>
    names.find((n) => cols.has(n.toLowerCase())) || null;

  _reqColsCache = {
    teacher_id: pick("teacher_id"),
    teacher_name: pick("teacher_name", "name"),
    email: pick("teacher_email", "email"),
    recommender_type: pick("recommender_type", "type"),
    deadline: pick("deadline", "deadline_date"),
    recommend_status: pick("recommend_status", "status"),
    remind: pick("remind", "is_reminded"),
    created: pick("created", "created_at", "date_created"),
  };
  return _reqColsCache;
}

/* ===================== Utils ===================== */
function normalizeLevel(lvl) {
  if (!lvl) return null;
  const s = String(lvl).trim();
  if (/^phd$/i.test(s) || /^ph\.?d\.?$/i.test(s)) return "Ph.D.";
  return s;
}
function extFromUrl(url) {
  try {
    const u = new URL(url);
    const last = (u.pathname.split("/").pop() || "").toLowerCase();
    const dot = last.lastIndexOf(".");
    return dot >= 0 ? last.slice(dot + 1) : null;
  } catch {
    return null;
  }
}
const ensureDir = (p) => {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
};

/* ===================== Sections (order) ===================== */
const LOR_SECTIONS = [
  "greeting-recipient",
  "candidate",
  "recommender",
  "general-assessment",
  "comparison-with-peers",
  "skills-and-traits",
  "discussing-school",
  "final-endorsement",
  "date",
];
const toMetaKey = (slug, isStd = false) =>
  `${isStd ? "std_recommendation" : "recommendation"}-${slug}`;

/* ===================== DB helpers ===================== */
async function getWpUserIdByEmail(email) {
  const [rows] = await db.execute(
    `SELECT ID FROM \`${WP_USERS}\` WHERE user_email = ? LIMIT 1`,
    [email]
  );
  return rows?.[0]?.ID || null;
}
async function getWpDisplayNameById(id) {
  const [rows] = await db.execute(
    `SELECT display_name FROM \`${WP_USERS}\` WHERE ID = ? LIMIT 1`,
    [id]
  );
  return rows?.[0]?.display_name || null;
}
async function resolveUserId(req) {
  const id = req.user?.id ?? req.user?.ID ?? req.user?.user_id;
  if (id) return Number(id);
  const email = req.user?.email ?? req.user?.user_email;
  if (!email) throw new Error("JWT missing email");
  const uid = await getWpUserIdByEmail(email);
  if (!uid) throw new Error("User not found for this email");
  return Number(uid);
}
async function readUserMeta(userId, metaKey) {
  const [rows] = await db.execute(
    `SELECT meta_value FROM \`${WP_USERMETA}\` WHERE user_id = ? AND meta_key = ? LIMIT 1`,
    [userId, metaKey]
  );
  if (!rows?.length) return null;
  const raw = rows[0].meta_value;
  try {
    return phpUnserialize(raw);
  } catch {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
}
async function writeUserMeta(userId, metaKey, valueObj) {
  const metaValue =
    valueObj && typeof valueObj === "object"
      ? phpSerialize(valueObj)
      : String(valueObj ?? "");
  const [exists] = await db.execute(
    `SELECT umeta_id FROM \`${WP_USERMETA}\` WHERE user_id = ? AND meta_key = ? LIMIT 1`,
    [userId, metaKey]
  );
  if (exists?.length) {
    await db.execute(
      `UPDATE \`${WP_USERMETA}\` SET meta_value = ? WHERE umeta_id = ?`,
      [metaValue, exists[0].umeta_id]
    );
  } else {
    await db.execute(
      `INSERT INTO \`${WP_USERMETA}\` (user_id, meta_key, meta_value) VALUES (?, ?, ?)`,
      [userId, metaKey, metaValue]
    );
  }
}

/* ===================== Plain assembly helpers ===================== */
function lorMetaToPlain(_slug, metaVal) {
  if (!metaVal) return "";
  if (typeof metaVal === "object" && typeof metaVal.content === "string")
    return metaVal.content;
  if (typeof metaVal === "object") {
    if (metaVal.custom_text) return String(metaVal.custom_text || "");
    const parts = [];
    for (const [, v] of Object.entries(metaVal)) {
      if (typeof v === "string" && v.trim()) parts.push(v.trim());
    }
    return parts.join(" ");
  }
  if (typeof metaVal === "string") return metaVal;
  return "";
}
function assembleLORPlain(sectionsObj) {
  const parts = [];
  for (const slug of LOR_SECTIONS) {
    const s = sectionsObj?.[slug];
    const txt =
      (s && typeof s.content === "string" && s.content.trim()) ||
      (typeof s === "string" && s.trim()) ||
      "";
    if (!txt) continue;
    let title = s?.title || slug.replace(/-/g, " ");
    title = title.charAt(0).toUpperCase() + title.slice(1);
    parts.push(`${title}\n${"-".repeat(title.length)}\n${txt.trim()}`);
  }
  return parts.join("\n\n");
}
// helpers
function parseList(val) {
  if (Array.isArray(val)) return val;
  if (val == null) return [];
  if (typeof val === "string") {
    try {
      const v = JSON.parse(val);
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  }
  if (typeof val === "object" && val) {
    // آرایه‌نما؟
    const keys = Object.keys(val);
    if (keys.length && keys.every((k) => String(+k) === k)) {
      return keys.sort((a, b) => +a - +b).map((k) => val[k]);
    }
  }
  return [];
}

/* ===================== Mail ===================== */
async function sendEmail({ to, subject, text, html }) {
  if (!transporter) throw new Error("Mailer transporter not configured");
  const from =
    process.env.MAIL_FROM || `"QuestApply" <no-reply@questapply.local>`;
  return transporter.sendMail({ from, to, subject, text, html });
}

/* =========================================================
   Helper: robust insert into recommender requests
   - Tries with `created_at`, falls back to `created`
   ========================================================= */
// در lorRoutes.js جایگزین کن
async function insertRecommenderRequest({
  userId,
  teacherId,
  teacherName,
  email, // فقط برای ایمیل‌زدن؛ در جدول ذخیره نمی‌کنیم
  type,
  deadline,
}) {
  const conn = await db.getConnection(); // db باید Pool باشد
  const lockName = `lor_req_id_lock_${process.env.DB_NAME || "default"}`;

  try {
    // قفل نام‌دار (مشکل prepared statement نداره)
    const [[lock]] = await conn.query("SELECT GET_LOCK(?, 5) AS ok", [
      lockName,
    ]);
    if (lock?.ok !== 1) throw new Error("Could not acquire lock");

    // next id
    const [[row]] = await conn.query(
      `SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM \`${TBL_LOR_REQ}\``
    );
    const nextId = Number(row?.next_id || 1);

    // تلاش اول: با created_at
    try {
      await conn.query(
        `
        INSERT INTO \`${TBL_LOR_REQ}\`
          (id, user_id, teacher_id, teacher_name, recommender_type, deadline, recommend_status, remind, created_at)
        VALUES (?,  ?,       ?,          ?,            ?,               ?,       'sent',            0,      NOW())
        `,
        [nextId, userId, teacherId, teacherName, type, deadline]
      );
    } catch (e) {
      // اگر ستون created_at نبود → با created
      if (e?.code !== "ER_BAD_FIELD_ERROR") throw e;
      await conn.query(
        `
        INSERT INTO \`${TBL_LOR_REQ}\`
          (id, user_id, teacher_id, teacher_name, recommender_type, deadline, recommend_status, remind, created)
        VALUES (?,  ?,       ?,          ?,            ?,               ?,       'sent',            0,      NOW())
        `,
        [nextId, userId, teacherId, teacherName, type, deadline]
      );
    }
  } finally {
    try {
      await conn.query("SELECT RELEASE_LOCK(?)", [lockName]);
    } catch {}
    conn.release();
  }
}

/* =========================================================
   1) Method (self | other)
   ========================================================= */
router.post("/lor/method", authenticateToken, async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    let { method } = req.body || {};
    if (!method) return res.status(400).json({ message: "method is required" });
    method = /^(1|self)$/i.test(method)
      ? "self"
      : /^(2|other)$/i.test(method)
      ? "other"
      : null;
    if (!method) return res.status(400).json({ message: "Invalid method" });
    await writeUserMeta(userId, "lor_recommendation_method", method);
    res.json({ success: true, data: { method } });
  } catch (e) {
    console.error("POST /lor/method error:", e);
    res.status(500).json({ message: "Failed to set method." });
  }
});

/* =========================================================
   2) Meta CRUD
   ========================================================= */
router.get("/lor/meta", authenticateToken, async (req, res) => {
  try {
    const me = await resolveUserId(req);
    const stdId = req.query.std_id ? Number(req.query.std_id) : null;
    const forStd = !!stdId && stdId > 0 && stdId !== me;
    const uid = forStd ? stdId : me;

    const { section } = req.query || {};
    if (section) {
      if (!LOR_SECTIONS.includes(section))
        return res.status(400).json({ message: "Invalid section" });
      const metaKey = toMetaKey(section, forStd);
      const meta = await readUserMeta(uid, metaKey);
      return res.json({ sections: { [section]: meta } });
    }

    const out = {};
    for (const slug of LOR_SECTIONS) {
      const metaKey = toMetaKey(slug, forStd);
      out[slug] = await readUserMeta(uid, metaKey);
    }
    res.json({ sections: out });
  } catch (e) {
    console.error("GET /lor/meta error:", e);
    res.status(500).json({ message: "Failed to fetch LOR meta." });
  }
});

router.post("/lor/meta", authenticateToken, async (req, res) => {
  try {
    const me = await resolveUserId(req);
    const stdId = req.body?.std_id ? Number(req.body.std_id) : null;
    const forStd = !!stdId && stdId > 0 && stdId !== me;
    const uid = forStd ? stdId : me;

    if (req.body?.sections && typeof req.body.sections === "object") {
      for (const [slug, obj] of Object.entries(req.body.sections)) {
        if (!LOR_SECTIONS.includes(slug)) continue;
        const metaKey = toMetaKey(slug, forStd);
        await writeUserMeta(uid, metaKey, obj);
      }
      return res.json({ ok: true });
    }

    const { section, data } = req.body || {};
    if (!section || !LOR_SECTIONS.includes(section))
      return res.status(400).json({ message: "Invalid or missing section" });

    await writeUserMeta(uid, toMetaKey(section, forStd), data || {});
    res.json({ ok: true });
  } catch (e) {
    console.error("POST /lor/meta error:", e);
    res.status(500).json({ message: "Failed to save LOR meta." });
  }
});

/* =========================================================
   3) Recommender request + remind
   ========================================================= */
// create
router.post("/lor/recommender/request", authenticateToken, async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const { fullname, email, type, deadline, template } = req.body || {};
    if (!fullname || !email || !type || !deadline)
      return res
        .status(400)
        .json({ message: "fullname, email, type, deadline are required" });

    const teacherId = await getWpUserIdByEmail(email);
    const teacherName =
      fullname ||
      (teacherId ? await getWpDisplayNameById(teacherId) : "Recommender");

    await insertRecommenderRequest({
      userId,
      teacherId,
      teacherName,
      email,
      type,
      deadline,
    });

    const subject =
      process.env.LOR_REQ_SUBJECT ||
      "Recommendation Request from QuestApply user";
    const submitUrl =
      process.env.LOR_SUBMIT_URL ||
      `${BASE_APP_URL}/recommendation/submit?email=${encodeURIComponent(
        email
      )}`;

    const bodyText =
      (template &&
        template
          .replace(/\[Recommender’s Name\]/gi, teacherName)
          .replace(/\[Recommender's Name\]/gi, teacherName)) ||
      `Dear ${teacherName},

I hope you're well. I’m applying and would be grateful if you could write a recommendation letter for me.
You can submit or reply via: ${submitUrl}

Thank you!`;

    await sendEmail({
      to: email,
      subject,
      text: bodyText,
      html: `<div style="font:14px/1.6 sans-serif">${bodyText.replace(
        /\n/g,
        "<br/>"
      )}<br/><br/><a href="${submitUrl}" target="_blank">Submit / Reply</a></div>`,
    });

    res.json({
      ok: true,
      message:
        "We will contact your recommender via email to request the recommendation letter.",
    });
  } catch (e) {
    console.error("POST /lor/recommender/request error:", e);
    res.status(500).json({ message: "Failed to send recommender request." });
  }
});

// list
router.get("/lor/recommender/requests", authenticateToken, async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const [rows] = await db.execute(
      `
      SELECT
        r.id,
        r.user_id,
        r.teacher_id,
        r.teacher_name,
        u.user_email AS teacher_email,       -- ایمیل از wp_users
        r.recommender_type,
        r.deadline,
        r.recommend_status,
        r.remind,
        COALESCE(r.created) AS created_at
      FROM \`${TBL_LOR_REQ}\` AS r
      LEFT JOIN \`${WP_USERS}\` AS u ON u.ID = r.teacher_id
      WHERE r.user_id = ?
      ORDER BY r.id DESC
      `,
      [userId]
    );
    res.json(rows || []);
  } catch (e) {
    console.error("GET /lor/recommender/requests error:", e);
    res.status(500).json({ message: "Failed to fetch requests." });
  }
});

// remind
router.post("/lor/recommender/remind", authenticateToken, async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const { id, email, value } = req.body || {};
    if (!id || !email)
      return res.status(400).json({ message: "id and email are required" });

    const [rows] = await db.execute(
      `SELECT id FROM \`${TBL_LOR_REQ}\` WHERE id = ? AND user_id = ? LIMIT 1`,
      [id, userId]
    );
    if (!rows?.length) return res.status(404).json({ message: "Not found" });

    const text =
      value ||
      `Dear Recommender,

Just a friendly reminder about my recommendation letter. Please let me know if you need anything from me. Thank you!`;

    await sendEmail({
      to: email,
      subject:
        process.env.LOR_REMIND_SUBJECT ||
        "Gentle Reminder: Recommendation Letter",
      text,
      html: `<div style="font:14px/1.6 sans-serif">${text.replace(
        /\n/g,
        "<br/>"
      )}</div>`,
    });

    await db.execute(
      `UPDATE \`${TBL_LOR_REQ}\` SET remind = 1 WHERE id = ? LIMIT 1`,
      [id]
    );
    res.json({ ok: true, data: { message: "Reminder sent." } });
  } catch (e) {
    console.error("POST /lor/recommender/remind error:", e);
    res.status(500).json({ message: "Failed to send reminder." });
  }
});

/* =========================================================
   4) Generate (plain, no-AI)
   ========================================================= */
router.post("/lor/generate", authenticateToken, async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    let sections = req.body?.sections;

    if (!sections) {
      sections = {};
      for (const slug of LOR_SECTIONS) {
        const meta = await readUserMeta(userId, toMetaKey(slug, false));
        sections[slug] =
          typeof meta === "object"
            ? { title: slug, content: lorMetaToPlain(slug, meta) }
            : { title: slug, content: String(meta || "") };
      }
    }

    const content = assembleLORPlain(sections);
    const html = `<html><body style="line-height:1.7;text-align:justify;font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial">${content
      .split("\n")
      .map((l) => l.trim())
      .join("<br/>")}</body></html>`;

    res.json({ content, html, model_fallback: true });
  } catch (e) {
    console.error("POST /lor/generate error:", e);
    res.status(500).json({ message: "Failed to assemble LOR." });
  }
});

/* =========================================================
   5) Export (txt/pdf/docx)
   ========================================================= */
// router.post("/lor/export", authenticateToken, async (req, res) => {
//   try {
//     const userId = await resolveUserId(req);
//     const { format, title = "LOR" } = req.body || {};
//     if (!["txt", "pdf", "docx"].includes(format))
//       return res.status(400).json({ message: "Invalid format" });

//     const normalizeSections = (input) => {
//       if (!input) return null;
//       if (Array.isArray(input))
//         return input.map((s) => ({
//           title: (s?.title ?? "").toString().trim() || "Untitled",
//           content: (s?.content ?? "").toString(),
//         }));
//       if (typeof input === "object")
//         return Object.values(input).map((s) => ({
//           title: (s?.title ?? "").toString().trim() || "Untitled",
//           content: (s?.content ?? "").toString(),
//         }));
//       return null;
//     };

//     let structured = normalizeSections(req.body?.sections);
//     if (!structured) {
//       const tmp = [];
//       for (const slug of LOR_SECTIONS) {
//         const meta = await readUserMeta(userId, toMetaKey(slug, false));
//         const content = lorMetaToPlain(slug, meta);
//         tmp.push({ title: slug.replace(/-/g, " "), content });
//       }
//       structured = tmp;
//     }

//     const content =
//       typeof req.body?.content === "string" && req.body.content.trim()
//         ? req.body.content
//         : structured
//             .map(
//               (s) =>
//                 `${(s.title || "Untitled").toUpperCase()}\n${(s.content || "")
//                   .toString()
//                   .trim()}\n`
//             )
//             .join("\n");

//     const userDir = path.join(UPLOAD_BASE_DIR, `docs-${userId}`);
//     ensureDir(userDir);
//     const baseName = `${title.replace(/[^\w\-]+/g, "_")}-lor`;
//     let filePath = "";

//     if (format === "txt") {
//       filePath = path.join(userDir, `${baseName}.txt`);
//       fs.writeFileSync(filePath, content, "utf8");
//     }

//     if (format === "pdf") {
//       const PDFDocument = (await import("pdfkit")).default;
//       filePath = path.join(userDir, `${baseName}.pdf`);
//       const pdf = new PDFDocument({ margin: 50, size: "A4" });
//       const stream = fs.createWriteStream(filePath);
//       pdf.pipe(stream);

//       structured.forEach((sec, idx) => {
//         const titleText = (sec.title || "Untitled").trim();
//         const bodyText = (sec.content || "").toString().trim();

//         pdf.font("Helvetica-Bold").fontSize(14).fillColor("#111827");
//         pdf.text(titleText);
//         pdf.moveDown(0.35);

//         pdf.font("Helvetica").fontSize(11).fillColor("#111827");
//         pdf.text(bodyText || " ", { align: "justify" });

//         if (idx < structured.length - 1) {
//           pdf.moveDown(0.6);
//           const x1 = pdf.page.margins.left;
//           const x2 = pdf.page.width - pdf.page.margins.right;
//           const y = pdf.y + 2;
//           pdf
//             .save()
//             .moveTo(x1, y)
//             .lineTo(x2, y)
//             .lineWidth(0.5)
//             .strokeColor("#e5e7eb")
//             .stroke()
//             .restore();
//           pdf.moveDown(0.6);
//         }
//       });

//       pdf.end();
//       await new Promise((resolve, reject) => {
//         stream.on("finish", resolve);
//         stream.on("error", reject);
//       });
//     }

//     if (format === "docx") {
//       const { Document, Packer, Paragraph, HeadingLevel } = await import(
//         "docx"
//       );
//       filePath = path.join(userDir, `${baseName}.docx`);
//       const children = [];
//       structured.forEach((sec, idx) => {
//         const titleText = (sec.title || "Untitled").trim();
//         const bodyText = (sec.content || "").toString();
//         children.push(
//           new Paragraph({ text: titleText, heading: HeadingLevel.HEADING_2 })
//         );
//         (bodyText || " ")
//           .split("\n")
//           .forEach((ln) => children.push(new Paragraph(ln.trim())));
//         if (idx < structured.length - 1) children.push(new Paragraph(""));
//       });
//       const doc = new Document({ sections: [{ children }] });
//       const buf = await Packer.toBuffer(doc);
//       fs.writeFileSync(filePath, buf);
//     }

//     const stat = fs.statSync(filePath);
//     const filename = path.basename(filePath);
//     const mime =
//       format === "pdf"
//         ? "application/pdf"
//         : format === "docx"
//         ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//         : "text/plain; charset=utf-8";

//     const url = `${UPLOAD_BASE_URL}/docs-${userId}/${filename}`;
//     if (format === "pdf") await writeUserMeta(userId, "lor_dl_pdf", url);
//     if (format === "docx") await writeUserMeta(userId, "lor_dl_word", url);

//     res.setHeader("Content-Type", mime);
//     res.setHeader("Content-Length", stat.size);
//     res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
//     fs.createReadStream(filePath).pipe(res);
//   } catch (e) {
//     console.error("POST /lor/export error:", e);
//     res.status(500).json({ message: "Failed to export LOR." });
//   }
// });

router.post("/lor/export", authenticateToken, async (req, res) => {
  try {
    const me = await resolveUserId(req);
    const stdId = req.body?.std_id ? Number(req.body.std_id) : null;
    const forStd = !!stdId && stdId > 0 && stdId !== me;
    const uid = forStd ? stdId : me;

    const { format, title = "LOR" } = req.body || {};
    const returnJson = req.query.json === "1" || req.body?.return === "json";
    if (!["txt", "pdf", "docx"].includes(format)) {
      return res.status(400).json({ message: "Invalid format" });
    }

    const normalizeSections = (input) => {
      if (!input) return null;
      if (Array.isArray(input)) {
        return input.map((s) => ({
          title: (s?.title ?? "").toString().trim() || "Untitled",
          content: (s?.content ?? "").toString(),
        }));
      }
      if (typeof input === "object") {
        return Object.values(input).map((s) => ({
          title: (s?.title ?? "").toString().trim() || "Untitled",
          content: (s?.content ?? "").toString(),
        }));
      }
      return null;
    };

    let structured = normalizeSections(req.body?.sections);
    if (!structured) {
      const tmp = [];
      for (const slug of LOR_SECTIONS) {
        const meta = await readUserMeta(uid, toMetaKey(slug, false));
        const content = lorMetaToPlain(slug, meta);
        tmp.push({ title: slug.replace(/-/g, " "), content });
      }
      structured = tmp;
    }

    const content =
      typeof req.body?.content === "string" && req.body.content.trim()
        ? req.body.content
        : structured
            .map(
              (s) =>
                `${(s.title || "Untitled").toUpperCase()}\n${(s.content || "")
                  .toString()
                  .trim()}\n`
            )
            .join("\n");

    // --- فایل با نام یکتا
    const userDir = path.join(UPLOAD_BASE_DIR, `docs-${uid}`);
    ensureDir(userDir);
    const safeTitle =
      (title || "LOR").toString().replace(/[^\w\-]+/g, "_") || "LOR";
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const baseName = `${safeTitle}-lor-${stamp}`;

    let filePath = "";
    let mime = "text/plain; charset=utf-8";

    if (format === "txt") {
      filePath = path.join(userDir, `${baseName}.txt`);
      fs.writeFileSync(filePath, content, "utf8");
      mime = "text/plain; charset=utf-8";
    } else if (format === "pdf") {
      const PDFDocument = (await import("pdfkit")).default;
      filePath = path.join(userDir, `${baseName}.pdf`);
      const pdf = new PDFDocument({ margin: 50, size: "A4" });
      const stream = fs.createWriteStream(filePath);
      pdf.pipe(stream);
      structured.forEach((sec, idx) => {
        const titleText = (sec.title || "Untitled").trim();
        const bodyText = (sec.content || "").toString().trim();
        pdf.font("Helvetica-Bold").fontSize(14).fillColor("#111827");
        pdf.text(titleText);
        pdf.moveDown(0.35);
        pdf.font("Helvetica").fontSize(11).fillColor("#111827");
        pdf.text(bodyText || " ", { align: "justify" });
        if (idx < structured.length - 1) {
          pdf.moveDown(0.6);
          const x1 = pdf.page.margins.left;
          const x2 = pdf.page.width - pdf.page.margins.right;
          const y = pdf.y + 2;
          pdf
            .save()
            .moveTo(x1, y)
            .lineTo(x2, y)
            .lineWidth(0.5)
            .strokeColor("#e5e7eb")
            .stroke()
            .restore();
          pdf.moveDown(0.6);
        }
      });
      pdf.end();
      await new Promise((resolve, reject) => {
        stream.on("finish", resolve);
        stream.on("error", reject);
      });
      mime = "application/pdf";
    } else if (format === "docx") {
      const { Document, Packer, Paragraph, HeadingLevel } = await import(
        "docx"
      );
      filePath = path.join(userDir, `${baseName}.docx`);
      const children = [];
      structured.forEach((sec, idx) => {
        const titleText = (sec.title || "Untitled").trim();
        const bodyText = (sec.content || "").toString();
        children.push(
          new Paragraph({ text: titleText, heading: HeadingLevel.HEADING_2 })
        );
        (bodyText || " ")
          .split("\n")
          .forEach((ln) => children.push(new Paragraph(ln.trim())));
        if (idx < structured.length - 1) children.push(new Paragraph(""));
      });
      const docxDoc = new Document({ sections: [{ children }] });
      const buf = await Packer.toBuffer(docxDoc);
      fs.writeFileSync(filePath, buf);
      mime =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }

    const filename = path.basename(filePath);
    const url = `${UPLOAD_BASE_URL}/docs-${uid}/${filename}`;

    // سازگاری قدیمی
    if (format === "pdf") await writeUserMeta(uid, "lor_dl_pdf", url);
    if (format === "docx") await writeUserMeta(uid, "lor_dl_word", url);

    // --- تاریخچهٔ چندفایلی (با پارس ایمن)
    const parseArray = (val) => {
      if (Array.isArray(val)) return val;
      if (val == null) return [];
      if (typeof val === "string") {
        try {
          const v = JSON.parse(val);
          return Array.isArray(v) ? v : [];
        } catch {
          return [];
        }
      }
      // اگر بعضی استورها object برگردونن
      if (typeof val === "object") {
        // آرایه‌نما؟ (کلیدهای 0..n)
        const keys = Object.keys(val);
        if (keys.every((k) => String(+k) === k)) {
          return keys.sort((a, b) => +a - +b).map((k) => val[k]);
        }
        return [];
      }
      return [];
    };

    let list = parseArray(await readUserMeta(uid, "lor_docs"));
    const entry = {
      type: "lor",
      title:
        format === "pdf"
          ? "LOR PDF"
          : format === "docx"
          ? "LOR Word"
          : "LOR Text",
      url,
      ext: format,
      created_at: new Date().toISOString(),
    };
    list = list.filter((it) => it && it.url !== url);
    list.unshift(entry);
    list = list.slice(0, 100);
    await writeUserMeta(uid, "lor_docs", list);

    if (returnJson) {
      return res.json({
        ok: true,
        url,
        filename,
        format,
        listLen: list.length,
      });
    }

    const stat = fs.statSync(filePath);
    res.setHeader("Content-Type", mime);
    res.setHeader("Content-Length", stat.size);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (e) {
    console.error("POST /lor/export error:", e);
    res.status(500).json({ message: "Failed to export LOR." });
  }
});

/* =========================================================
   6) Documents list
   ========================================================= */
router.get("/lor/documents", authenticateToken, async (req, res) => {
  try {
    const me = await resolveUserId(req);
    const stdId = req.query.std_id ? Number(req.query.std_id) : null;
    const forStd = !!stdId && stdId > 0 && stdId !== me;
    const uid = forStd ? stdId : me;

    const parseArray = (val) => {
      if (Array.isArray(val)) return val;
      if (val == null) return [];
      if (typeof val === "string") {
        try {
          const v = JSON.parse(val);
          return Array.isArray(v) ? v : [];
        } catch {
          return [];
        }
      }
      if (typeof val === "object") {
        const keys = Object.keys(val);
        if (keys.every((k) => String(+k) === k)) {
          return keys.sort((a, b) => +a - +b).map((k) => val[k]);
        }
        return [];
      }
      return [];
    };

    let list = parseArray(await readUserMeta(uid, "lor_docs"));
    if (list.length) {
      // اگر لازم داری مرتب‌سازی: جدیدترین اول
      list.sort((a, b) =>
        String(b.created_at || "").localeCompare(String(a.created_at || ""))
      );
      console.log("DOCS OUT (lor_docs):", { uid, count: list.length });
      return res.json(list);
    }

    // فالبک قدیمی
    const pdf = await readUserMeta(uid, "lor_dl_pdf");
    const doc = await readUserMeta(uid, "lor_dl_word");
    const items = [];
    if (typeof pdf === "string" && pdf)
      items.push({ type: "lor", title: "LOR PDF", url: pdf, created_at: null });
    if (typeof doc === "string" && doc)
      items.push({
        type: "lor",
        title: "LOR Word",
        url: doc,
        created_at: null,
      });

    console.log("DOCS OUT (fallback):", { uid, count: items.length });
    res.json(items);
  } catch (e) {
    console.error("GET /lor/documents error:", e);
    res.status(500).json({ message: "Failed to fetch LOR documents." });
  }
});

/* =========================================================
   7) Samples (list + single)
   ========================================================= */
router.get("/lor/sample", authenticateToken, async (req, res) => {
  try {
    const typeQ = (req.query.recom_type || req.query.type || "").toString();
    const programIdQ = req.query.program_id
      ? Number(req.query.program_id)
      : null;
    const levelQ = normalizeLevel(req.query.level);

    let limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 30));
    let offset = Math.max(0, parseInt(req.query.offset, 10) || 0);

    const where = [];
    const params = [];
    const type = typeQ && typeQ.toLowerCase() !== "all" ? typeQ : null;
    if (type) {
      where.push("lor.type = ?");
      params.push(type);
    }
    if (programIdQ) {
      where.push("lor.program_id = ?");
      params.push(programIdQ);
    }
    if (levelQ) {
      where.push("lor.level = ?");
      params.push(levelQ);
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [cntRows] = await db.execute(
      `SELECT COUNT(*) AS cnt FROM \`${TBL_LOR_SAMPLES}\` AS lor ${whereSql}`,
      params
    );
    const total = Number(cntRows?.[0]?.cnt || 0);

    const [rows] = await db.execute(
      `
      SELECT lor.id, lor.type, lor.level, lor.program_id, lor.date,
             p.guid AS file_url, p.post_title AS title
      FROM \`${TBL_LOR_SAMPLES}\` AS lor
      LEFT JOIN \`${WP_POSTS}\` AS p ON p.ID = lor.file
      ${whereSql}
      ORDER BY COALESCE(lor.date,'1970-01-01') DESC, lor.id DESC
      LIMIT ? OFFSET ?
    `,
      [...params, limit, offset]
    );

    const items = rows.map((r) => ({
      id: r.id,
      title: r.title || null,
      type: r.type || null,
      level: r.level || null,
      program_id: r.program_id ?? null,
      date: r.date || null,
      file_url: r.file_url || null,
      ext: r.file_url ? extFromUrl(r.file_url) : null,
    }));

    res.json({
      filters: {
        selected: {
          recom_type: type || "all",
          program_id: programIdQ ?? null,
          level: levelQ ?? null,
        },
      },
      items,
      paging: { limit, offset, total },
    });
  } catch (e) {
    console.error("GET /lor/sample error:", e);
    res.status(500).json({ message: "Failed to fetch LOR samples." });
  }
});

router.get("/lor/sample/:id", authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id))
      return res.status(400).json({ message: "Invalid id" });

    const [rows] = await db.execute(
      `
      SELECT lor.id, lor.type, lor.level, lor.program_id, lor.date,
             p.guid AS file_url, p.post_title AS title
      FROM \`${TBL_LOR_SAMPLES}\` AS lor
      LEFT JOIN \`${WP_POSTS}\` AS p ON p.ID = lor.file
      WHERE lor.id = ?
      LIMIT 1
    `,
      [id]
    );
    if (!rows?.length) return res.status(404).json({ message: "Not found" });

    const r = rows[0];
    res.json({
      id: r.id,
      title: r.title || null,
      type: r.type || null,
      level: r.level || null,
      program_id: r.program_id ?? null,
      date: r.date || null,
      file_url: r.file_url || null,
      ext: r.file_url ? extFromUrl(r.file_url) : null,
    });
  } catch (e) {
    console.error("GET /lor/sample/:id error:", e);
    res.status(500).json({ message: "Failed to fetch LOR sample." });
  }
});

// DELETE /api/lor/documents?url=ENCODED_URL
router.delete("/lor/documents", authenticateToken, async (req, res) => {
  try {
    const me = await resolveUserId(req);
    const stdId = req.query?.std_id ? Number(req.query.std_id) : null;
    const forStd = !!stdId && stdId > 0 && stdId !== me;
    const uid = forStd ? stdId : me;

    const url = String(req.query?.url || req.body?.url || "").trim();
    if (!url) return res.status(400).json({ message: "Missing url" });

    // 1) لیست‌ها را (قدیمی و جدید) بخوان
    let list = parseList(await readUserMeta(uid, "lor_docs"));
    if (!list.length) {
      // سازگاری با ورژن قدیمی
      const legacy = await readUserMeta(uid, "lor_documents");
      list = parseList(legacy);
    }

    const before = list.length;
    list = list.filter((it) => it && it.url !== url);
    const removedFromList = before !== list.length;

    // 2) لیست را در کلید جدید ذخیره کن (و برای سازگاری قدیمی هم بنویس)
    await writeUserMeta(uid, "lor_docs", list);
    try {
      await writeUserMeta(uid, "lor_documents", list);
    } catch {}

    // 3) حذف فایل روی دیسک (اگر مال همان کاربر باشد)
    let removedFile = false;
    try {
      const base = `${UPLOAD_BASE_URL}/docs-${uid}/`;
      if (url.startsWith(base)) {
        const filename = url.slice(base.length);
        const abs = path.normalize(
          path.join(UPLOAD_BASE_DIR, `docs-${uid}`, filename)
        );
        const root = path.normalize(path.join(UPLOAD_BASE_DIR, `docs-${uid}`));
        if (abs.startsWith(root) && fs.existsSync(abs)) {
          fs.unlinkSync(abs);
          removedFile = true;
        }
      }
    } catch (e) {
      console.error("unlink LOR file failed:", e);
    }

    return res.json({ ok: true, removedFromList, removedFile });
  } catch (err) {
    console.error("DELETE /lor/documents error:", err);
    return res.status(500).json({ message: "Failed to delete LOR document." });
  }
});
// DELETE /api/lor/recommender/requests/:id
router.delete(
  "/lor/recommender/requests/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const userId = await resolveUserId(req);
      const id = String(req.params.id || "").trim();
      if (!id) return res.status(400).json({ message: "Missing id" });

      let ok = false;
      try {
        ok = await deleteRecommenderRequestForUser(userId, id); // TODO: پیاده‌سازی واقعی
      } catch {}
      // حتی اگر پیدا نشد، 200 بده تا UI قفل نشه
      return res.json({ ok: true, note: ok ? undefined : "not-found" });
    } catch (err) {
      console.error("DELETE /lor/recommender/requests/:id error:", err);
      return res.status(500).json({ message: "Failed to delete LOR request." });
    }
  }
);

export default router;
