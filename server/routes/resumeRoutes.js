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
  if (typeof personal === "object") return personal; // اگر JSON ساختاری است

  const lines = String(personal)
    .split(/\r?\n/)
    .map((s) => s.trim());
  const out = {
    name: "",
    title: "",
    city: "",
    phone: "",
    email: "",
    linkedin: "",
  };

  out.name = clean(lines[0]);

  // اگر 3 خط: خط 2 عنوان، خط 3 کانتکت. وگرنه خط 2 کانتکت.
  let contactLine = "";
  if (lines.length >= 3) {
    out.title = clean(lines[1]);
    contactLine = lines[2] || "";
  } else {
    contactLine = lines[1] || "";
  }

  const tokens = contactLine
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const raw of tokens) {
    const t = clean(raw);
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
  try {
    const { resumeId } = req.params;
    const [user] = await db.execute(
      "SELECT ID FROM qacom_wp_users WHERE user_email = ?",
      [req.user.email]
    );
    const userId = user?.[0]?.ID;
    if (!userId)
      return res
        .status(401)
        .json({ message: "Unauthorized: User ID not found." });

    const [rows] = await db.execute(
      `SELECT section, content, template_id, created_at
       FROM qacom_wp_user_resume
       WHERE user_id = ? AND resume_id = ?`,
      [userId, resumeId]
    );
    if (!rows?.length)
      return res
        .status(404)
        .json({ message: "Resume not found or not owned by user." });

    const sections = {};
    for (const r of rows) sections[r.section] = r.content;

    res.json({
      resume_id: resumeId,
      template_id: rows[0].template_id,
      sections,
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

    const currentResumeId =
      resume_id && resume_id !== "new_resume_placeholder"
        ? resume_id
        : uuidv4();

    await connection.beginTransaction();

    for (const sectionId of Object.keys(sections)) {
      const content = sections[sectionId];
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
            typeof content === "string" ? content : JSON.stringify(content),
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
            typeof content === "string" ? content : JSON.stringify(content),
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

    const templateData = {
      personal_name: clean(p.name),
      personal_line2,
      summary: clean(sections.summary),
      interests: clean(sections.interests),
      education: clean(sections.education),
      experience: clean(sections.experience),
      publications: clean(sections.publications),
      skills: clean(sections.skills),
      awards: clean(sections.awards),
      memberships: clean(sections.memberships),
      hobbies: clean(sections.hobbies),
      refs: clean(sections.refs),
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
