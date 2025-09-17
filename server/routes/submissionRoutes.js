// server/routes/submissionRoutes.js
import express from "express";
import db from "../config/db.config.js";
import { computeFees } from "../utils/fees.js"; // همونی که قبلاً ساختیم
import { authenticateToken } from "../middleware/authMiddleware.js";
import { buildFeesForProgram } from "../utils/fees.js";
import multer from "multer";
import fs from "fs/promises";
import path from "path";

const router = express.Router();
//Helpers for upload docs
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const ok = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "application/zip",
      "application/x-zip-compressed",
    ];
    if (ok.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Unsupported file type"));
  },
});

const safeName = (s) => s.replace(/[^a-zA-Z0-9._-]+/g, "_");
const REVIEW_FEE = 50;
/* ----------------------------------------------------
   0) ایجاد جدول (اگر نبود) — ذخیره‌ی ساده‌ی PSU در یک جدول
---------------------------------------------------- */
async function ensureSubmissionTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS qacom_psu_submissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      rel_id BIGINT NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'draft',
      review_enabled TINYINT(1) NOT NULL DEFAULT 0,
      currency VARCHAR(8) DEFAULT NULL,
      application_fee DECIMAL(10,2) DEFAULT 0,
      submission_fee DECIMAL(10,2) DEFAULT 0,
      total_fee DECIMAL(10,2) DEFAULT 0,
      docs_json LONGTEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_user_rel (user_id, rel_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

/* ----------------------------------------------------
   Helpers
---------------------------------------------------- */

function getUserCountryFromMeta(rows = []) {
  // سعی می‌کنیم از application_country یا country بخونیم
  let found = null;
  for (const r of rows) {
    if (r.meta_key === "application_country" || r.meta_key === "country") {
      found = String(r.meta_value || "").trim();
      if (found) break;
    }
  }
  return found; // همون term_id (string) یا null
}

async function fetchProgramLiteForDocs(relId) {
  const [rows] = await db.query(
    `
    SELECT
      pr.id AS rel_id,
      s.country AS school_country,
      pr.GRE_requirement,
      pr.MIN_TOEFL, pr.MIN_IELTS, pr.MIN_Duolingo, pr.MIN_MELAB, pr.MIN_PTE, pr.MIN_Cael,
      pr.MIN_GPA,
      fee_int.meta_value  AS extra_appication_fee,
      fee_us.meta_value   AS extra_appication_fee_us,
      sop.meta_value      AS extra_SOP,
      rec_val.meta_value  AS extra_recom_value
    FROM qacom_wp_apply_programs_relationship pr
    JOIN qacom_wp_apply_schools s ON s.id = pr.school_id
    LEFT JOIN qacom_wp_apply_programs_relationship_meta fee_int
      ON fee_int.program_rel_id = pr.id AND fee_int.meta_key = 'extra_appication_fee'
    LEFT JOIN qacom_wp_apply_programs_relationship_meta fee_us
      ON fee_us.program_rel_id  = pr.id AND fee_us.meta_key  = 'extra_appication_fee_us'
    LEFT JOIN qacom_wp_apply_programs_relationship_meta sop
      ON sop.program_rel_id = pr.id AND sop.meta_key = 'extra_SOP'
    LEFT JOIN qacom_wp_apply_programs_relationship_meta rec_val
      ON rec_val.program_rel_id = pr.id AND rec_val.meta_key = 'extra_recom_value'
    WHERE pr.status='publish' AND pr.id = ?
    LIMIT 1
  `,
    [relId]
  );
  return rows?.[0] || null;
}

function computeProgress(docs = []) {
  const total = docs.length || 1;
  const completed = docs.filter((d) => d.status === "completed").length;
  return Math.round((completed / total) * 100);
}
// === Helpers: پیش‌فرض مدارک PSU بر اساس متای برنامه ===
function buildDefaultDocs(programLite) {
  // از فیلدهای SELECT برنامه استفاده می‌کنیم:
  const greRequired =
    String(programLite.GRE_requirement || "").toLowerCase() === "required";

  const recCountRaw = programLite.extra_recom_value;
  const recCount = Number.parseInt(recCountRaw, 10);
  const recCountSafe = Number.isFinite(recCount) ? recCount : 2; // پیش‌فرض 2

  // الگوی کلیدها مطابق نسخه‌ی قدیمی (PHP)
  return [
    {
      key: "resume",
      name: "Resume/CV",
      required: true,
      status: "missing",
      url: null,
    },
    {
      key: "sop",
      name: "Statement of Purpose",
      required: true,
      status: "missing",
      url: null,
    },
    {
      key: "transcript-bachelor",
      name: "Transcript Bachelor",
      required: true,
      status: "missing",
      url: null,
    },
    {
      key: "english-test",
      name: "English Test",
      required: true,
      status: "missing",
      url: null,
    },
    {
      key: "passport",
      name: "Passport",
      required: true,
      status: "missing",
      url: null,
    },
    {
      key: "gre-gmat",
      name: "Standardized Test (GRE/GMAT/…)",
      required: greRequired,
      status: "missing",
      url: null,
    },
    {
      key: "transcript-master",
      name: "Transcript Master",
      required: false,
      status: "missing",
      url: null,
    },
    {
      key: "recommendation",
      name: "Letters of Recommendation",
      required: recCountSafe > 0,
      status: "missing",
      url: null,
      meta: { count: recCountSafe },
    },
    {
      key: "papers",
      name: "Papers",
      required: false,
      status: "missing",
      url: null,
    },
    {
      key: "others",
      name: "Others",
      required: false,
      status: "missing",
      url: null,
    },
  ];
}

// کمک‌تابع: گرفتن userId از ایمیل
async function getUserIdByEmail(db, email) {
  const [urows] = await db.query(
    `SELECT ID FROM qacom_wp_users WHERE user_email = ? LIMIT 1`,
    [email]
  );
  return urows?.[0]?.ID || null;
}

// کمک‌تابع: گرفتن fees پایه (application, submission, currency) بر اساس relId و کاربر
async function getBaseFeesForRel(db, relId, email) {
  // برنامه + متای فی‌ها
  const [rows] = await db.query(
    `
      SELECT
        pr.id AS rel_id,
        s.country AS country,
        fee_int.meta_value  AS extra_appication_fee,
        fee_us.meta_value   AS extra_appication_fee_us
      FROM qacom_wp_apply_programs_relationship pr
      JOIN qacom_wp_apply_schools s ON s.id = pr.school_id
      LEFT JOIN qacom_wp_apply_programs_relationship_meta fee_int
        ON fee_int.program_rel_id = pr.id AND fee_int.meta_key = 'extra_appication_fee'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta fee_us
        ON fee_us.program_rel_id  = pr.id AND fee_us.meta_key  = 'extra_appication_fee_us'
      WHERE pr.status = 'publish' AND pr.id = ?
      LIMIT 1
    `,
    [relId]
  );
  const program = rows?.[0];
  if (!program) return null;

  // کشور کاربر از متا
  const [userMetaRows] = await db.query(
    `
      SELECT um.meta_key, um.meta_value
      FROM qacom_wp_users u
      LEFT JOIN qacom_wp_usermeta um ON um.user_id = u.ID
      WHERE u.user_email = ?
    `,
    [email]
  );
  const userCountryId =
    userMetaRows?.find((m) => m.meta_key === "application_country")
      ?.meta_value ?? null;

  // خروجی استاندارد: { application, submission, currency }
  // اگر buildFeesForProgram داری، از همون استفاده کن:
  if (typeof buildFeesForProgram === "function") {
    const base = await buildFeesForProgram(db, program, userCountryId);
    return {
      application: Number(base?.application ?? base?.applicationFee ?? 0),
      submission: Number(base?.submission ?? base?.submissionFee ?? 0),
      currency: base?.currency || "USD",
    };
  }

  // در غیر اینصورت، از computeFees قدیمی استفاده کن:
  if (typeof computeFees === "function") {
    const userCountry = getUserCountryFromMeta(userMetaRows || []);
    const raw = computeFees({
      userCountry,
      schoolCountry: String(program.country || ""),
      metaIntl: program.extra_appication_fee,
      metaUS: program.extra_appication_fee_us,
    });
    return {
      application: Number(raw?.application ?? raw?.applicationFee ?? 0),
      submission: Number(raw?.submission ?? raw?.submissionFee ?? 0),
      currency: raw?.currency || "USD",
    };
  }

  // اگر هیچ‌کدام نبود:
  return { application: 0, submission: 0, currency: "USD" };
}

// کمک‌تابع: ساخت پاسخ fees استاندارد از رکورد submission
function feesFromSubmissionRow(s) {
  const application = Number(s.application_fee || 0);
  const submission = Number(s.submission_fee || 0);
  const reviewEnabled = !!s.review_enabled;
  const review = reviewEnabled ? REVIEW_FEE : 0;
  const total = application + submission + review;
  return {
    application,
    submission,
    review,
    total,
    currency: s.currency || "USD",
    reviewEnabled,
  };
}

/* ----------------------------------------------------
   1) GET  /submission/:relId/docs
   - اگر چیزی ثبت نشده باشد، بر اساس متای برنامه default می‌سازیم و ذخیره می‌کنیم
---------------------------------------------------- */
// GET /submission/:relId/docs
router.get("/submission/:relId/docs", authenticateToken, async (req, res) => {
  try {
    await ensureSubmissionTable();

    const relId = Number(req.params.relId);
    if (!Number.isFinite(relId)) {
      return res.status(400).json({ error: "Invalid relId" });
    }

    const { email } = req.user || {};
    if (!email) return res.status(401).json({ error: "Unauthorized" });

    const userId = await getUserIdByEmail(db, email);
    if (!userId) return res.status(404).json({ error: "User not found" });

    // آیا submission موجود است؟
    const [srows] = await db.query(
      `SELECT * FROM qacom_psu_submissions WHERE user_id = ? AND rel_id = ? LIMIT 1`,
      [userId, relId]
    );

    if (srows && srows.length) {
      const s = srows[0];
      const docs = s.docs_json ? JSON.parse(s.docs_json) : [];
      const fees = feesFromSubmissionRow(s);

      return res.json({
        submissionId: s.id,
        relId,
        status: s.status,
        fees, // { application, submission, review, total, currency, reviewEnabled }
        docs, // همیشه همین کلید
        progress: computeProgress(docs), // بر اساس "completed"
      });
    }

    // اگر نبود، default بسازیم
    const programLite = await fetchProgramLiteForDocs(relId);
    if (!programLite) {
      return res.status(404).json({ error: "Program not found" });
    }

    // fees پایه
    const baseFees = await getBaseFeesForRel(db, relId, email);
    if (!baseFees) return res.status(404).json({ error: "Program not found" });

    const docs = buildDefaultDocs(programLite);

    // درج رکورد draft
    await db.query(
      `
        INSERT INTO qacom_psu_submissions
          (user_id, rel_id, status, review_enabled, currency, application_fee, submission_fee, total_fee, docs_json, created_at, updated_at)
        VALUES
          (?, ?, 'draft', 0, ?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          currency        = VALUES(currency),
          application_fee = VALUES(application_fee),
          submission_fee  = VALUES(submission_fee),
          total_fee       = VALUES(total_fee),
          docs_json       = IF(docs_json IS NULL OR docs_json = '', VALUES(docs_json), docs_json),
          updated_at      = NOW()
      `,
      [
        userId,
        relId,
        baseFees.currency,
        baseFees.application,
        baseFees.submission,
        baseFees.application + baseFees.submission, // بدون review در حالت اولیه
        JSON.stringify(docs),
      ]
    );

    // گرفتن رکورد ساخته‌شده برای برگرداندن submissionId
    const [afterRows] = await db.query(
      `SELECT * FROM qacom_psu_submissions WHERE user_id=? AND rel_id=? LIMIT 1`,
      [userId, relId]
    );
    const s = afterRows[0];

    return res.json({
      submissionId: s.id,
      relId,
      status: s.status,
      fees: feesFromSubmissionRow(s),
      docs,
      progress: computeProgress(docs),
    });
  } catch (err) {
    console.error("GET /submission/:relId/docs error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ----------------------------------------------------
   2) POST /submission/:relId/start
   - رکورد را (اگر نبود) می‌سازد؛ اگر بود همان را برمی‌گرداند
   - status را می‌گذارد 'started'
   - می‌تواند reviewEnabled را از body بگیرد (اختیاری)
---------------------------------------------------- */
router.post("/submission/:relId/start", authenticateToken, async (req, res) => {
  try {
    await ensureSubmissionTable();

    const relId = Number(req.params.relId);
    if (!Number.isFinite(relId)) {
      return res.status(400).json({ error: "Invalid relId" });
    }

    const { email } = req.user || {};
    if (!email) return res.status(401).json({ error: "Unauthorized" });

    const reviewEnabled = !!req.body?.reviewEnabled;

    const userId = await getUserIdByEmail(db, email);
    if (!userId) return res.status(404).json({ error: "User not found" });

    // آیا submission موجود است؟
    const [srows] = await db.query(
      `SELECT * FROM qacom_psu_submissions WHERE user_id=? AND rel_id=? LIMIT 1`,
      [userId, relId]
    );

    // اگر نبود: بساز
    if (!srows || !srows.length) {
      const programLite = await fetchProgramLiteForDocs(relId);
      if (!programLite) {
        return res.status(404).json({ error: "Program not found" });
      }

      // fees پایه
      const baseFees = await getBaseFeesForRel(db, relId, email);
      if (!baseFees)
        return res.status(404).json({ error: "Program not found" });

      const docs = buildDefaultDocs(programLite);
      const review = reviewEnabled ? REVIEW_FEE : 0;
      const total = baseFees.application + baseFees.submission + review;

      const [ins] = await db.query(
        `
          INSERT INTO qacom_psu_submissions
            (user_id, rel_id, status, review_enabled, currency, application_fee, submission_fee, total_fee, docs_json, created_at, updated_at)
          VALUES
            (?, ?, 'started', ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `,
        [
          userId,
          relId,
          reviewEnabled ? 1 : 0,
          baseFees.currency,
          baseFees.application,
          baseFees.submission,
          total,
          JSON.stringify(docs),
        ]
      );

      return res.json({
        submissionId: ins.insertId,
        relId,
        status: "started",
        fees: {
          application: baseFees.application,
          submission: baseFees.submission,
          review,
          total,
          currency: baseFees.currency,
          reviewEnabled,
        },
        docs,
        progress: computeProgress(docs),
      });
    }

    // اگر بود: به‌روزرسانی
    const s = srows[0];
    const docs = s.docs_json ? JSON.parse(s.docs_json) : [];
    const application = Number(s.application_fee || 0);
    const submission = Number(s.submission_fee || 0);
    const review = reviewEnabled ? REVIEW_FEE : 0;
    const total = application + submission + review;

    await db.query(
      `UPDATE qacom_psu_submissions
         SET status='started', review_enabled=?, total_fee=?, updated_at=NOW()
       WHERE id=?`,
      [reviewEnabled ? 1 : 0, total, s.id]
    );

    return res.json({
      submissionId: s.id,
      relId,
      status: "started",
      fees: {
        application,
        submission,
        review,
        total,
        currency: s.currency || "USD",
        reviewEnabled,
      },
      docs,
      progress: computeProgress(docs),
    });
  } catch (err) {
    console.error("POST /submission/:relId/start error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ----------------------------------------------------
   3) (اختیاری) PATCH /submission/:relId/docs
   - برای به‌روزرسانی وضعیت/URL هر مدرک (بعداً آپلود را وصل می‌کنیم)
---------------------------------------------------- */
router.patch("/submission/:relId/docs", authenticateToken, async (req, res) => {
  try {
    await ensureSubmissionTable();

    const relId = Number(req.params.relId);
    if (!Number.isFinite(relId)) {
      return res.status(400).json({ error: "Invalid relId" });
    }

    const { email } = req.user || {};
    if (!email) return res.status(401).json({ error: "Unauthorized" });

    const { docs: newDocs } = req.body || {};
    if (!Array.isArray(newDocs)) {
      return res.status(400).json({ error: "docs must be an array" });
    }

    const [urows] = await db.query(
      `SELECT ID FROM qacom_wp_users WHERE user_email = ? LIMIT 1`,
      [email]
    );
    const userId = urows?.[0]?.ID;
    if (!userId) return res.status(404).json({ error: "User not found" });

    const [srows] = await db.query(
      `SELECT * FROM qacom_psu_submissions WHERE user_id=? AND rel_id=? LIMIT 1`,
      [userId, relId]
    );
    if (!srows || !srows.length) {
      return res.status(404).json({ error: "Submission not found" });
    }

    await db.query(
      `UPDATE qacom_psu_submissions
       SET docs_json=?, updated_at=NOW()
       WHERE id=?`,
      [JSON.stringify(newDocs), srows[0].id]
    );

    return res.json({
      relId,
      submissionId: srows[0].id,
      documents: newDocs,
      progress: computeProgress(newDocs),
    });
  } catch (err) {
    console.error("PATCH /submission/:relId/docs error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
// APi  for fee
router.get("/submission/:relId/fees", authenticateToken, async (req, res) => {
  try {
    await ensureSubmissionTable();

    const relId = Number(req.params.relId);
    if (!Number.isFinite(relId)) {
      return res.status(400).json({ error: "Invalid relId" });
    }

    const { email } = req.user || {};
    if (!email) return res.status(401).json({ error: "Unauthorized" });

    const userId = await getUserIdByEmail(db, email);
    if (!userId) return res.status(404).json({ error: "User not found" });

    // اگر submission موجود است، از رکورد خودش برگردان
    const [srows] = await db.query(
      `SELECT * FROM qacom_psu_submissions WHERE user_id=? AND rel_id=? LIMIT 1`,
      [userId, relId]
    );

    if (srows && srows.length) {
      const s = srows[0];
      return res.json(feesFromSubmissionRow(s));
    }

    // اگر submission نبود: fees پایه
    const base = await getBaseFeesForRel(db, relId, email);
    if (!base) return res.status(404).json({ error: "Program not found" });

    const reviewEnabled = false;
    const review = 0;
    const total = base.application + base.submission + review;

    return res.json({
      application: base.application,
      submission: base.submission,
      review,
      total,
      currency: base.currency,
      reviewEnabled,
    });
  } catch (e) {
    console.error("GET /submission/:relId/fees error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /submission/:relId/upload  (real upload)
router.post(
  "/submission/:relId/upload",
  authenticateToken,
  upload.single("file"),
  async (req, res) => {
    try {
      const relId = Number(req.params.relId);
      if (!Number.isFinite(relId)) {
        return res.status(400).json({ error: "Invalid relId" });
      }
      const { email } = req.user || {};
      if (!email) return res.status(401).json({ error: "Unauthorized" });

      // دریافت userId
      const [urows] = await db.query(
        `SELECT ID FROM qacom_wp_users WHERE user_email = ? LIMIT 1`,
        [email]
      );
      const userId = urows?.[0]?.ID;
      if (!userId) return res.status(404).json({ error: "User not found" });

      // فایل و docKey
      const file = req.file;
      const docKey = String(req.body.docKey || "");
      if (!file) return res.status(400).json({ error: "No file uploaded" });
      if (!docKey) return res.status(400).json({ error: "docKey is required" });

      // وجود submission را چک/ایجاد کن (مثل GET /docs)
      const [srows] = await db.query(
        `SELECT * FROM qacom_psu_submissions WHERE user_id=? AND rel_id=? LIMIT 1`,
        [userId, relId]
      );

      let docs = [];
      let currency = "USD";
      let application_fee = null;
      let submission_fee = null;
      let total_fee = null;
      let review_enabled = 0;

      if (srows && srows.length) {
        const s = srows[0];
        docs = s.docs_json ? JSON.parse(s.docs_json) : [];
        currency = s.currency || "USD";
        application_fee = s.application_fee ?? null;
        submission_fee = s.submission_fee ?? null;
        total_fee = s.total_fee ?? null;
        review_enabled = s.review_enabled ? 1 : 0;
      } else {
        // اگر نبود، مثل GET /docs پیش‌فرض بساز
        const programLite = await fetchProgramLiteForDocs(relId);
        if (!programLite)
          return res.status(404).json({ error: "Program not found" });

        const [userMetaRows] = await db.query(
          `
          SELECT um.meta_key, um.meta_value
          FROM qacom_wp_users u
          LEFT JOIN qacom_wp_usermeta um ON um.user_id = u.ID
          WHERE u.user_email = ?
        `,
          [email]
        );
        const userCountry = getUserCountryFromMeta(userMetaRows || []);
        const fees = computeFees({
          userCountry,
          schoolCountry: String(programLite.school_country || ""),
          metaIntl: programLite.extra_appication_fee,
          metaUS: programLite.extra_appication_fee_us,
        });

        docs = buildDefaultDocs(programLite);
        currency = fees.currency || "USD";
        application_fee = fees.application ?? null;
        submission_fee = fees.submission ?? null;
        total_fee = fees.total ?? null;

        await db.query(
          `
          INSERT INTO qacom_psu_submissions
            (user_id, rel_id, status, review_enabled, currency, application_fee, submission_fee, total_fee, docs_json)
          VALUES
            (?, ?, 'draft', 0, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            currency        = VALUES(currency),
            application_fee = VALUES(application_fee),
            submission_fee  = VALUES(submission_fee),
            total_fee       = VALUES(total_fee),
            docs_json       = IF(docs_json IS NULL OR docs_json = '', VALUES(docs_json), docs_json)
        `,
          [
            userId,
            relId,
            currency,
            application_fee,
            submission_fee,
            total_fee,
            JSON.stringify(docs),
          ]
        );
      }

      // بررسی وجود docKey
      const idx = docs.findIndex((d) => d.key === docKey);
      if (idx === -1) {
        return res.status(400).json({ error: "Unknown docKey" });
      }

      // ذخیره واقعی فایل روی دیسک
      const root = path.join(
        process.cwd(),
        "uploads",
        "psu",
        String(userId),
        String(relId)
      );
      await fs.mkdir(root, { recursive: true });
      const filename = `${Date.now()}-${safeName(file.originalname)}`;
      const fullpath = path.join(root, filename);
      await fs.writeFile(fullpath, file.buffer);

      // URL عمومی
      const publicUrl = `/uploads/psu/${userId}/${relId}/${filename}`;

      // آپدیت داکیومنت
      docs[idx] = {
        ...docs[idx],
        status: "completed",
        url: publicUrl,
      };

      // ذخیره در DB
      await db.query(
        `
        UPDATE qacom_psu_submissions
        SET docs_json = ?
        WHERE user_id=? AND rel_id=? LIMIT 1
      `,
        [JSON.stringify(docs), userId, relId]
      );

      return res.json({
        ok: true,
        relId,
        doc: docs[idx],
        documents: docs,
        progress: computeProgress(docs),
      });
    } catch (err) {
      console.error("POST /submission/:relId/upload error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
