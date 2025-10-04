// server/routes/sopRoutes.js
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from "../config/db.config.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  serialize as phpSerialize,
  unserialize as phpUnserialize,
} from "php-serialize";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ===================== تنظیمات خروجی فایل‌ها ===================== */
const UPLOAD_BASE_DIR =
  process.env.UPLOAD_BASE_DIR ||
  path.join(process.cwd(), "uploads", "student-documents");

const UPLOAD_BASE_URL =
  process.env.UPLOAD_BASE_URL ||
  process.env.BASE_UPLOADS_URL ||
  "http://localhost:5000/uploads/student-documents";

/* ===================== جداول وردپرسی ===================== */
const WP_USERS = "qacom_wp_users";
const WP_USERMETA = "qacom_wp_usermeta";

/* ===================== سکشن‌ها و نگاشت کلیدهای usermeta ===================== */
const SECTION_TITLES = {
  country: "Target / Program / Country",
  hook: "Hook",
  segue: "Segue (Journey / Motivation)",
  academic: "Academic Achievements",
  extrac: "Extracurricular Activities",
  publications: "Publications",
  problem: "Problems in Background",
  why: "Why This School?",
  goal: "Your Goal / Conclusion",
};
const SECTION_KEYS = Object.keys(SECTION_TITLES);
const toMetaKey = (k) => `${k}_sop_meta`; // مثال: hook -> hook_sop_meta

/* ===================== کمک‌تابع‌ها ===================== */
const ensureDir = (p) => {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
};

async function getWpUserIdByEmail(email) {
  const [rows] = await db.execute(
    `SELECT ID FROM ${WP_USERS} WHERE user_email = ? LIMIT 1`,
    [email]
  );
  return rows?.[0]?.ID || null;
}

async function resolveUserId(req) {
  // اگر در JWT مستقیماً ID هست
  const id = req.user?.id ?? req.user?.ID ?? req.user?.user_id;
  if (id) return Number(id);

  // در غیر اینصورت از ایمیل
  const email = req.user?.email ?? req.user?.user_email;
  if (!email) throw new Error("JWT missing email");
  const userId = await getWpUserIdByEmail(email);
  if (!userId) throw new Error("User not found for this email");
  return Number(userId);
}

async function readUserMeta(userId, metaKey) {
  const [rows] = await db.execute(
    `SELECT meta_value FROM ${WP_USERMETA} WHERE user_id = ? AND meta_key = ? LIMIT 1`,
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
    `SELECT umeta_id FROM ${WP_USERMETA} WHERE user_id = ? AND meta_key = ? LIMIT 1`,
    [userId, metaKey]
  );
  if (exists?.length) {
    await db.execute(
      `UPDATE ${WP_USERMETA} SET meta_value = ? WHERE umeta_id = ?`,
      [metaValue, exists[0].umeta_id]
    );
  } else {
    await db.execute(
      `INSERT INTO ${WP_USERMETA} (user_id, meta_key, meta_value) VALUES (?, ?, ?)`,
      [userId, metaKey, metaValue]
    );
  }
}

// usermeta -> شکل مورد نیاز فرانت (title+content)
function metaToSection(metaVal, title) {
  if (metaVal && typeof metaVal === "object") {
    const answer = metaVal?.inputs?.answer;
    if (typeof answer === "string") return { title, content: answer };

    if (metaVal.inputs && typeof metaVal.inputs === "object") {
      const joined = Object.values(metaVal.inputs)
        .flat()
        .filter(Boolean)
        .join("\n");
      if (joined) return { title, content: joined };
    }
  }
  if (typeof metaVal === "string") return { title, content: metaVal };
  return { title, content: "" };
}

// فرانت -> ساختار سازگار با وردپرس
function sectionToMeta(sectionObj) {
  const content = (sectionObj?.content ?? "").toString();
  return { inputs: { answer: content }, selects: {} };
}

// مونتاژ متن ساده (بدون AI) از map سکشن‌ها
function assemblePlain(sectionsObj) {
  const parts = [];
  for (const key of SECTION_KEYS) {
    const s = sectionsObj[key];
    if (!s) continue;
    const title = s.title || SECTION_TITLES[key];
    const text = (s.content || "").toString().trim();
    if (text) {
      parts.push(`${title}\n${"-".repeat(title.length)}\n${text}`);
    }
  }
  return parts.join("\n\n");
}

function linesToHtml(text) {
  return `<html><body style="line-height:1.7;font-weight:normal;text-align:justify;">${text
    .split("\n")
    .map((l) => l.trim())
    .map((l) => l.replace(/</g, "&lt;").replace(/>/g, "&gt;"))
    .join("<br/>")}</body></html>`;
}

// ================= Pref keys for user defaults =================
const SOP_PREF_PROG = "sop_filter_program_id";
const SOP_PREF_LEVEL = "sop_filter_level";
/* ===================== نمونه‌ها (Samples) ===================== */

// GET /api/sop-data/sample?program_id=12&level=PhD
router.get("/sample", authenticateToken, async (req, res) => {
  try {
    const userId = await resolveUserId(req);

    // --------- 1) دریافت همه گزینه‌های فیلتر
    const [progRows] = await db.execute(
      "SELECT ID AS id, name FROM qacom_wp_apply_programs ORDER BY name"
    );
    const programs = progRows.map((r) => ({ id: r.id, name: r.name }));

    const [lvlRows] = await db.execute(
      "SELECT DISTINCT level FROM qacom_wp_apply_sop_file WHERE level IS NOT NULL AND level<>'' ORDER BY level"
    );
    const levels = lvlRows.map((r) => r.level);

    // --------- 2) پیش‌فرض‌ها: از query یا از usermeta
    const qProgramId = req.query.program_id
      ? Number(req.query.program_id)
      : null;
    const qLevel = req.query.level ? String(req.query.level) : null;

    // user defaults
    const defProg = await readUserMeta(userId, SOP_PREF_PROG);
    const defLevel = await readUserMeta(userId, SOP_PREF_LEVEL);

    const selectedProgramId = qProgramId ?? (defProg ? Number(defProg) : null); // اگر query نبود، از کاربر
    const selectedLevel =
      qLevel ??
      (typeof defLevel === "string" && defLevel.trim() ? defLevel : null);

    // --------- 3) صفحه‌بندی
    let limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 30));
    let offset = Math.max(0, parseInt(req.query.offset, 10) || 0);

    // --------- 4) WHERE + params
    const where = ["posts.post_type = ?"];
    const params = ["attachment"];

    if (selectedProgramId) {
      where.push("sop.program_id = ?");
      params.push(selectedProgramId);
    }
    if (selectedLevel) {
      where.push("sop.level = ?");
      params.push(selectedLevel);
    }

    // --------- 5) total
    const [cntRows] = await db.execute(
      `
      SELECT COUNT(*) AS cnt
      FROM qacom_wp_apply_sop_file AS sop
      JOIN qacom_wp_posts AS posts ON sop.file = posts.ID
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      `,
      params
    );
    const total = Number(cntRows?.[0]?.cnt || 0);

    // --------- 6) items
    const itemsParams = [...params, limit, offset];
    const [rows] = await db.query(
      `
      SELECT
        sop.ID AS id,
        posts.guid AS file_url,
        posts.post_title AS title,
        program.name AS program_name,
        sop.program_id,
        sop.level,
        sop.date
      FROM qacom_wp_apply_sop_file AS sop
      JOIN qacom_wp_apply_programs AS program ON sop.program_id = program.ID
      JOIN qacom_wp_posts AS posts ON sop.file = posts.ID
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY COALESCE(sop.date, '1970-01-01') DESC
      LIMIT ? OFFSET ?
      `,
      itemsParams
    );

    const items = rows.map((r) => {
      // استخراج پسوند فایل از URL
      let ext = null;
      try {
        const u = new URL(r.file_url);
        const last = u.pathname.split("/").pop() || "";
        const dot = last.lastIndexOf(".");
        if (dot >= 0) ext = last.slice(dot + 1).toLowerCase();
      } catch {
        // ignore
      }
      return {
        id: r.id,
        title: r.title || null,
        file_url: r.file_url,
        program_id: r.program_id,
        program_name: r.program_name,
        level: r.level,
        date: r.date,
        ext,
        file_size_kb: null, // در صورت نیاز بعداً محاسبه کن
      };
    });

    return res.json({
      filters: {
        programs,
        levels,
        selected: {
          program_id: selectedProgramId,
          level: selectedLevel,
        },
      },
      items,
      paging: { limit, offset, total },
    });
  } catch (err) {
    console.error("GET /sop/sample error:", err);
    res.status(500).json({ message: "Failed to fetch samples." });
  }
});

// POST /api/sop/prefs
router.post("/prefs", authenticateToken, async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const { program_id, level } = req.body || {};

    if (program_id !== undefined) {
      // null/"" => پاک‌کردن مقدار قبلی
      await writeUserMeta(
        userId,
        SOP_PREF_PROG,
        program_id === null || program_id === "" ? "" : Number(program_id)
      );
    }
    if (level !== undefined) {
      await writeUserMeta(
        userId,
        SOP_PREF_LEVEL,
        level === null ? "" : String(level || "")
      );
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error("POST /sop/prefs error:", err);
    res.status(500).json({ message: "Failed to save prefs." });
  }
});
/* ===================== متا (خواندن/نوشتن سکشن‌ها) ===================== */
// GET /api/sop-data/meta  (یا ?section=hook)
router.get("/meta", authenticateToken, async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const { section } = req.query;

    if (section) {
      if (!SECTION_KEYS.includes(section)) {
        return res.status(400).json({ message: "Invalid section" });
      }
      const meta = await readUserMeta(userId, toMetaKey(section));
      return res.json({
        sections: { [section]: metaToSection(meta, SECTION_TITLES[section]) },
      });
    }

    // همه سکشن‌ها
    const out = {};
    for (const key of SECTION_KEYS) {
      const meta = await readUserMeta(userId, toMetaKey(key));
      out[key] = metaToSection(meta, SECTION_TITLES[key]);
    }
    return res.json({ sections: out });
  } catch (err) {
    console.error("GET /sop/meta error:", err);
    res.status(500).json({ message: "Failed to fetch SOP meta." });
  }
});

// POST /api/sop-data/meta
// ورودی پذیرفته‌شده:
// 1) { sections: {hook:{title,content}, ...} }  ← توصیه‌شده
// 2) { section:"hook", selects:{}, inputs:{} }  ← سازگاری با قدیمی
router.post("/meta", authenticateToken, async (req, res) => {
  try {
    const userId = await resolveUserId(req);

    if (req.body?.sections && typeof req.body.sections === "object") {
      for (const [key, obj] of Object.entries(req.body.sections)) {
        if (!SECTION_KEYS.includes(key)) continue;
        const metaObj = sectionToMeta(obj);
        await writeUserMeta(userId, toMetaKey(key), metaObj);
      }
      return res.json({ ok: true });
    }

    // حالت قدیمی
    const { section, selects = {}, inputs = {} } = req.body || {};
    if (!section || !SECTION_KEYS.includes(section)) {
      return res.status(400).json({ message: "Invalid or missing section" });
    }
    await writeUserMeta(userId, toMetaKey(section), { selects, inputs });
    return res.json({ ok: true });
  } catch (err) {
    console.error("POST /sop/meta error:", err);
    res.status(500).json({ message: "Failed to save SOP meta." });
  }
});

/* ===================== Preview (بدون AI) ===================== */
// POST /api/sop-data/generate  { previewOnly?:true, sections? }
router.post("/generate", authenticateToken, async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    let sections = req.body?.sections;

    if (!sections) {
      // از usermeta بخوان
      sections = {};
      for (const key of SECTION_KEYS) {
        const meta = await readUserMeta(userId, toMetaKey(key));
        sections[key] = metaToSection(meta, SECTION_TITLES[key]);
      }
    }

    const content = assemblePlain(sections);
    const html = linesToHtml(content);
    res.json({
      content,
      html,
      tokens_used: null,
      elapsed_ms: 0,
      model_fallback: true,
    });
  } catch (err) {
    console.error("POST /sop/generate error:", err);
    res.status(500).json({ message: "Failed to assemble SOP." });
  }
});

/* ===================== Export (pdf/docx/txt) ===================== */
// POST /api/sop-data/export  { format: 'txt'|'pdf'|'docx', title?, sections?, content? }
router.post("/export", authenticateToken, async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const { format, title = "SOP" } = req.body || {};
    const rawSections = req.body?.sections; // optional: Array<{ title, content }> یا حتی Object
    const plainContent = req.body?.content; // optional

    if (!["pdf", "docx", "txt"].includes(format)) {
      return res.status(400).json({ message: "Invalid format" });
    }

    // --- 1) نرمال‌سازی سکشن‌ها (آرایه‌ی مرتب {title, content})
    /** @returns Array<{title:string, content:string}> */
    const normalizeSections = (input) => {
      if (!input) return null;
      if (Array.isArray(input)) {
        return input.map((s) => ({
          title: (s?.title ?? "").toString().trim() || "Untitled",
          content: (s?.content ?? "").toString(),
        }));
      }
      if (typeof input === "object") {
        // اگر به صورت آبجکت {hook:{title,content}, ...} بود
        return Object.values(input).map((s) => ({
          title: (s?.title ?? "").toString().trim() || "Untitled",
          content: (s?.content ?? "").toString(),
        }));
      }
      return null;
    };

    let structured = normalizeSections(rawSections); // ممکنه null بشه

    // --- 2) اگر سکشن‌ها نبود: از usermeta بخوان و ۸ بخش بساز
    if (!structured) {
      const tmp = [];
      for (const key of SECTION_KEYS) {
        const meta = await readUserMeta(userId, toMetaKey(key));
        const sec = metaToSection(meta, SECTION_TITLES[key]); // { title, content }
        tmp.push({
          title: (sec?.title ?? SECTION_TITLES[key]).toString().trim(),
          content: (sec?.content ?? "").toString(),
        });
      }
      structured = tmp; // حالا ۸ سکشن استاندارد داریم
    }

    // --- 3) متن ساده (fallback) اگر بخش‌ها نبودند (ولی الان داریم). باز هم برای txt نیاز داریم.
    const plainFromStructured = structured
      .map((s) => `${s.title.toUpperCase()}\n${(s.content || "").trim()}\n`)
      .join("\n");
    const content =
      typeof plainContent === "string" && plainContent.trim().length
        ? plainContent
        : plainFromStructured;

    // --- 4) مسیر و ساخت فایل
    const userDir = path.join(UPLOAD_BASE_DIR, `docs-${userId}`);
    ensureDir(userDir);
    const safeTitle = title.replace(/[^\w\-]+/g, "_");
    const stamp = new Date().toISOString().replace(/[-:.TZ]/g, ""); // مثلا 20250915...
    const baseName = `${safeTitle}-sop-${stamp}`;

    let filePath = "";

    if (format === "txt") {
      filePath = path.join(userDir, `${baseName}.txt`);
      fs.writeFileSync(filePath, content, "utf8");
    }

    if (format === "pdf") {
      const PDFDocument = (await import("pdfkit")).default;
      filePath = path.join(userDir, `${baseName}.pdf`);
      const pdf = new PDFDocument({ margin: 50, size: "A4" });
      const stream = fs.createWriteStream(filePath);
      pdf.pipe(stream);

      // تیتر بولد + متن justify + خط نازک بین سکشن‌ها
      structured.forEach((sec, idx) => {
        const titleText = (sec.title || "Untitled").trim();
        const bodyText = (sec.content || "").toString().trim();

        pdf.font("Helvetica-Bold").fontSize(14).fillColor("#111827");
        pdf.text(titleText, { continued: false });
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
    }

    if (format === "docx") {
      const { Document, Packer, Paragraph, HeadingLevel } = await import(
        "docx"
      );
      filePath = path.join(userDir, `${baseName}.docx`);

      const children = [];
      structured.forEach((sec, idx) => {
        const titleText = (sec.title || "Untitled").trim();
        const bodyText = (sec.content || "").toString();

        // Heading
        children.push(
          new Paragraph({ text: titleText, heading: HeadingLevel.HEADING_2 })
        );
        // Body (هر خط یک پاراگراف)
        (bodyText || " ").split("\n").forEach((ln) => {
          children.push(new Paragraph(ln.trim()));
        });
        // فاصله بین سکشن‌ها
        if (idx < structured.length - 1) {
          children.push(new Paragraph("")); // یک خط خالی
        }
      });

      const doc = new Document({ sections: [{ children }] });
      const buf = await Packer.toBuffer(doc);
      fs.writeFileSync(filePath, buf);
    }

    // --- 5) هدرها و استریم فایل
    const stat = fs.statSync(filePath);
    const filename = path.basename(filePath);
    const mime =
      format === "pdf"
        ? "application/pdf"
        : format === "docx"
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : "text/plain; charset=utf-8";

    // سازگاری قدیمی: ذخیره لینک‌ها در usermeta (اگر لازم‌تان است)
    const url = `${UPLOAD_BASE_URL}/docs-${userId}/${filename}`;
    if (format === "pdf") await writeUserMeta(userId, "sop_dl_pdf", url);
    if (format === "docx") await writeUserMeta(userId, "sop_dl_word", url);
    try {
      const newDoc = { type: "sop", title, url };

      let docs = [];
      try {
        const raw = await readUserMeta(userId, "sop_documents");
        if (Array.isArray(raw)) {
          docs = raw;
        } else if (typeof raw === "string") {
          try {
            docs = JSON.parse(raw);
          } catch {
            docs = [];
          }
        } else if (raw && typeof raw === "object" && Array.isArray(raw.items)) {
          docs = raw.items;
        }
      } catch {
        /* ignore */
      }

      // حذف تکراری با URL و افزودن newDoc در ابتدای لیست
      docs = [newDoc, ...docs.filter((d) => d && d.url !== url)];

      // سقف اختیاری
      if (docs.length > 50) docs = docs.slice(0, 50);

      // ذخیره (هم JSON آرایه‌ای، هم رشته‌ای)
      try {
        await writeUserMeta(userId, "sop_documents", docs);
      } catch {
        await writeUserMeta(userId, "sop_documents", JSON.stringify(docs));
      }
    } catch (e) {
      console.error("update sop_documents failed:", e);
      // ادامه می‌دهیم تا دانلود فایل مختل نشود
    }

    res.setHeader("Content-Type", mime);
    res.setHeader("Content-Length", stat.size);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error("POST /sop/export error:", err);
    res.status(500).json({ message: "Failed to export SOP." });
  }
});

/* ===================== لیست خروجی‌ها (از usermeta) ===================== */
// GET /api/sop-data/documents
router.get("/documents", authenticateToken, async (req, res) => {
  try {
    const userId = await resolveUserId(req);

    // 1) تلاش برای خواندن لیست جدید
    let items = [];
    let raw = null;
    try {
      raw = await readUserMeta(userId, "sop_documents");
    } catch {}

    let docs = [];
    if (Array.isArray(raw)) {
      docs = raw;
    } else if (typeof raw === "string") {
      try {
        docs = JSON.parse(raw);
      } catch {}
    } else if (raw && typeof raw === "object" && Array.isArray(raw.items)) {
      docs = raw.items;
    }

    if (Array.isArray(docs) && docs.length) {
      const seen = new Set();
      for (const d of docs) {
        const url = d && d.url;
        if (
          typeof url === "string" &&
          /^https?:\/\//i.test(url) &&
          !seen.has(url)
        ) {
          items.push({ type: d.type || "sop", title: d.title || "SOP", url });
          seen.add(url);
        }
      }
    }

    // 2) فالبک به کلیدهای قدیمی اگر لیست خالی بود
    if (!items.length) {
      const pdf = await readUserMeta(userId, "sop_dl_pdf").catch(() => null);
      const docx = await readUserMeta(userId, "sop_dl_word").catch(() => null);
      if (typeof pdf === "string" && /^https?:\/\//i.test(pdf))
        items.push({ type: "sop", title: "SOP PDF", url: pdf });
      if (typeof docx === "string" && /^https?:\/\//i.test(docx))
        items.push({ type: "sop", title: "SOP Word", url: docx });
    }

    return res.json(items);
  } catch (err) {
    console.error("GET /sop/documents error:", err);
    return res.status(500).json({ message: "Failed to fetch documents." });
  }
});

// DELETE /api/sop/documents?url=ENCODED_URL
router.delete("/documents", authenticateToken, async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const urlParam =
      (req.query && req.query.url) || (req.body && req.body.url) || "";

    const url = String(urlParam).trim();
    if (!url) return res.status(400).json({ message: "Missing url" });

    // 1) sop_documents را بخوان
    let raw = null;
    try {
      raw = await readUserMeta(userId, "sop_documents");
    } catch {}
    let docs = [];
    if (Array.isArray(raw)) docs = raw;
    else if (typeof raw === "string") {
      try {
        docs = JSON.parse(raw);
      } catch {}
    } else if (raw && typeof raw === "object" && Array.isArray(raw.items))
      docs = raw.items;

    // 2) حذف از آرایه
    const before = docs.length;
    docs = docs.filter((d) => d && d.url !== url);
    const removedFromList = before !== docs.length;

    // 3) ذخیرهٔ لیست جدید
    try {
      await writeUserMeta(userId, "sop_documents", docs);
    } catch {
      await writeUserMeta(userId, "sop_documents", JSON.stringify(docs));
    }

    // 4) اگر url همان هاست آپلودهاست و مسیر مال همین کاربر است → فایل را پاک کن
    let removedFile = false;
    try {
      const base = `${UPLOAD_BASE_URL}/docs-${userId}/`;
      if (url.startsWith(base)) {
        const filename = url.slice(base.length);
        const abs = path.normalize(
          path.join(UPLOAD_BASE_DIR, `docs-${userId}`, filename)
        );
        const safeRoot = path.normalize(
          path.join(UPLOAD_BASE_DIR, `docs-${userId}`)
        );
        if (abs.startsWith(safeRoot) && fs.existsSync(abs)) {
          fs.unlinkSync(abs);
          removedFile = true;
        }
      }
    } catch (e) {
      // لاگ کن ولی جلوی پاسخ را نگیر
      console.error("unlink sop file failed:", e);
    }

    // 5) اگر لینک‌های legacy مطابق url بودند، پاکشان کن (اختیاری)
    try {
      const pdf = await readUserMeta(userId, "sop_dl_pdf").catch(() => null);
      if (pdf === url) await writeUserMeta(userId, "sop_dl_pdf", null);
      const docx = await readUserMeta(userId, "sop_dl_word").catch(() => null);
      if (docx === url) await writeUserMeta(userId, "sop_dl_word", null);
    } catch {}

    return res.json({ ok: true, removedFromList, removedFile });
  } catch (err) {
    console.error("DELETE /sop/documents error:", err);
    return res.status(500).json({ message: "Failed to delete SOP document." });
  }
});

export default router;
