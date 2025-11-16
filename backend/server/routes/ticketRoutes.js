// routes/ticketRoutes.js
import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import db from "../config/db.config.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { serialize, unserialize } from "php-serialize";
import { T_POSTS, T_POSTMETA, T_USERS } from "../config/constants.js";
const router = express.Router();

/* ======================= Upload (attachments) ========================= */
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "tickets");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname.replace(/[^\w.\-]/g, "_");
    cb(null, `${ts}__${safe}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024, files: 10 }, // 20MB × 10
});

/* ============================ Helpers ================================= */
const OK_LANG = new Set(["fa", "en"]);
const OK_PRIORITY = new Set(["low", "medium", "high"]);
const OK_DEPT = new Set([
  "Account Issues",
  "Billing",
  "Technical Issue",
  "Application",
  "Other",
]);

function mapStatusMetaToLabel(status) {
  if (status === "answered") return "answered";
  if (status === "closed") return "closed";
  return "open";
}

function normalizeMessagesFromMeta(metaVal) {
  if (!metaVal) return [];
  try {
    const arr = unserialize(metaVal);
    if (!Array.isArray(arr)) return [];
    return arr.map((m) => ({
      sender: m?.sender === "Admin" ? "Admin" : "User", // userId یا "User" → سمت فرانت همه را User نشان می‌دهیم
      content: String(m?.content ?? ""),
      date: String(m?.date ?? ""),
    }));
  } catch {
    return [];
  }
}

function serializeMessagesToMeta(messages) {
  const safe = (messages || []).map((m) => ({
    sender: m.sender === "Admin" ? "Admin" : "User",
    content: String(m.content ?? ""),
    date: String(m.date ?? ""),
  }));
  return serialize(safe);
}

async function getMetaMap(postId) {
  const [rows] = await db.query(
    `SELECT meta_key, meta_value
     FROM ${T_POSTMETA}
     WHERE post_id=? AND meta_key IN ('ticket_status','ticket_priority','ticket_department','_ticket_chat_messages','ticket_attachments')`,
    [postId]
  );
  const map = {};
  for (const r of rows) map[r.meta_key] = r.meta_value;
  return map;
}

async function getWpUserIdFromReq(req) {
  // اگر middleware شما ID وردپرس را همینجا گذاشته، مستقیم برگردان
  if (req.user?.id) return req.user.id;

  const email = req.user?.email;
  if (!email) return null;

  const [[u]] = await db.query(
    `SELECT ID FROM ${T_USERS} WHERE user_email=? LIMIT 1`,
    [email]
  );
  return u?.ID ?? null;
}

/** فقط صاحب تیکت بتواند آن را ببیند/ریپلای کند */
async function ensureOwnTicket(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "Bad id" });

  const [[p]] = await db.query(
    `SELECT post_author FROM ${T_POSTS}
     WHERE ID=? AND post_type='ticket' AND post_status='publish' LIMIT 1`,
    [id]
  );
  if (!p) return res.status(404).json({ error: "Not found" });

  const currentUserId = await getWpUserIdFromReq(req);
  if (!currentUserId) return res.status(401).json({ error: "Unauthorized" });

  if (Number(p.post_author) !== Number(currentUserId)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}

async function getNextId(table, idCol) {
  const [[r]] = await db.query(
    `SELECT IFNULL(MAX(${idCol}),0)+1 AS nextId FROM ${table}`
  );
  return r?.nextId || 1;
}

// upsertMeta
async function upsertMeta(postId, key, value) {
  const [[row]] = await db.query(
    `SELECT meta_id FROM ${T_POSTMETA} WHERE post_id=? AND meta_key=? LIMIT 1`,
    [postId, key]
  );
  if (row?.meta_id) {
    await db.query(`UPDATE ${T_POSTMETA} SET meta_value=? WHERE meta_id=?`, [
      value,
      row.meta_id,
    ]);
  } else {
    const nextMetaId = await getNextId(T_POSTMETA, "meta_id"); // 👈 مهم
    await db.query(
      `INSERT INTO ${T_POSTMETA} (meta_id, post_id, meta_key, meta_value) VALUES (?, ?, ?, ?)`,
      [nextMetaId, postId, key, value]
    );
  }
}

/* ============================= Routes ================================= */

/** GET /api/tickets — لیست تیکت‌های کاربر جاری */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = await getWpUserIdFromReq(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const [rows] = await db.query(
      `SELECT p.ID, p.post_title, p.post_modified
       FROM ${T_POSTS} p
       WHERE p.post_type='ticket' AND p.post_status='publish' AND p.post_author=?
       ORDER BY p.post_modified DESC`,
      [userId]
    );

    const ids = rows.map((r) => r.ID);
    const list = [];
    if (ids.length) {
      const [metas] = await db.query(
        `SELECT post_id, meta_key, meta_value
         FROM ${T_POSTMETA}
         WHERE post_id IN (${ids.map(() => "?").join(",")})
           AND meta_key IN ('ticket_department','ticket_priority','ticket_status')`,
        ids
      );
      const metaByPostId = new Map();
      for (const m of metas) {
        if (!metaByPostId.has(m.post_id)) metaByPostId.set(m.post_id, {});
        metaByPostId.get(m.post_id)[m.meta_key] = m.meta_value;
      }
      for (const r of rows) {
        const mm = metaByPostId.get(r.ID) || {};
        list.push({
          id: r.ID,
          title: r.post_title,
          department: mm["ticket_department"] || "",
          priority: mm["ticket_priority"] || "low",
          status: mapStatusMetaToLabel(mm["ticket_status"] || "open"),
          updatedAt: r.post_modified,
        });
      }
    }
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load tickets" });
  }
});

/** GET /api/tickets/:id — جزییات تیکت + پیام‌ها */
router.get("/:id", authenticateToken, ensureOwnTicket, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [[p]] = await db.query(
      `SELECT p.ID, p.post_author, p.post_title, p.post_content, p.post_date, p.post_modified, u.display_name
       FROM ${T_POSTS} p
       JOIN ${T_USERS} u ON u.ID = p.post_author
       WHERE p.ID=? AND p.post_type='ticket' AND p.post_status='publish'`,
      [id]
    );
    if (!p) return res.status(404).json({ error: "Not found" });

    const meta = await getMetaMap(id);
    const messages = normalizeMessagesFromMeta(meta["_ticket_chat_messages"]);

    res.json({
      id: p.ID,
      title: p.post_title,
      department: meta["ticket_department"] || "",
      status: mapStatusMetaToLabel(meta["ticket_status"] || "open"),
      priority: meta["ticket_priority"] || "low",
      updatedAt: p.post_modified,
      content: p.post_content,
      createdAt: p.post_date,
      authorDisplayName: p.display_name,
      messages,
      attachments: meta["ticket_attachments"]
        ? JSON.parse(meta["ticket_attachments"])
        : [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load ticket" });
  }
});

router.post(
  "/",
  authenticateToken,
  upload.array("attachments"),
  async (req, res) => {
    try {
      const userId = await getWpUserIdFromReq(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const {
        language = "fa",
        title,
        priority = "low",
        department = "Account Issues",
        description,
      } = req.body;

      if (!title || !description)
        return res.status(400).json({ error: "Missing fields" });
      if (!OK_LANG.has(language))
        return res.status(400).json({ error: "Bad language" });
      if (!OK_PRIORITY.has(priority))
        return res.status(400).json({ error: "Bad priority" });
      if (!OK_DEPT.has(department))
        return res.status(400).json({ error: "Bad department" });

      // --- 1) تعیین nextId (چون ID در DB شما auto_increment نیست)
      const [[{ nextId }]] = await db.query(
        `SELECT IFNULL(MAX(ID), 0) + 1 AS nextId FROM ${T_POSTS}`
      );

      // --- 2) ساخت slug و guid امن
      const nowSql = new Date().toISOString().slice(0, 19).replace("T", " ");
      const slugBase =
        String(title)
          .trim()
          .toLowerCase()
          .replace(/[^\p{L}\p{N}]+/gu, "-")
          .replace(/^-+|-+$/g, "") || "ticket";
      const post_name = `${slugBase}-${nextId}`;
      const guid = ""; // اگر ستون guid NOT NULL است، مقدار خالی کافی است

      // --- 3) درج کامل رکورد با ID و سایر فیلدهای احتمالا NOT NULL
      await db.query(
        `INSERT INTO ${T_POSTS}
       (ID, post_author, post_date, post_date_gmt, post_modified, post_modified_gmt,
        post_title, post_content, post_excerpt,
        post_status, comment_status, ping_status,
        post_password, post_name, to_ping, pinged,
        post_content_filtered, post_parent, guid, menu_order, post_type, post_mime_type, comment_count)
       VALUES
       (?,  ?,         ?,         ?,               ?,                ?,
        ?,          ?,           '',
        'publish',  'closed',    'closed',
        '',         ?,       '',      '',
        '',                   0,          ?,    0,         'ticket',  '',           0)`,
        [
          nextId, // ID
          userId, // post_author
          nowSql,
          nowSql,
          nowSql,
          nowSql,
          title,
          description,
          post_name, // post_name
          guid, // guid
        ]
      );

      // --- 4) متاها
      await upsertMeta(nextId, "ticket_status", "open");
      await upsertMeta(nextId, "ticket_priority", priority);
      await upsertMeta(nextId, "ticket_department", department);

      // --- 5) فایل‌ها (اختیاری): در متای JSON ذخیره می‌شود
      if (req.files?.length) {
        const filesMeta = req.files.map((f) => ({
          filename: f.originalname,
          storedAs: path.relative(process.cwd(), f.path).replace(/\\/g, "/"),
          mimetype: f.mimetype,
          size: f.size,
        }));
        await upsertMeta(
          nextId,
          "ticket_attachments",
          JSON.stringify(filesMeta)
        );
      }

      return res.status(201).json({
        id: nextId,
        title,
        department,
        status: "open",
        priority,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create ticket" });
    }
  }
);

/** POST /api/tickets/:id/replies — ریپلای کاربر و بازگردانی status=open */
router.post(
  "/:id/replies",
  authenticateToken,
  ensureOwnTicket,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { content } = req.body || {};
      if (!content || !String(content).trim()) {
        return res.status(400).json({ error: "Missing content" });
      }

      // خواندن پیام‌های فعلی
      const [[row]] = await db.query(
        `SELECT meta_id, meta_value FROM ${T_POSTMETA}
       WHERE post_id=? AND meta_key='_ticket_chat_messages' LIMIT 1`,
        [id]
      );

      let messages = [];
      let metaId = null;
      if (row) {
        metaId = row.meta_id;
        messages = normalizeMessagesFromMeta(row.meta_value);
      }

      const nowStr = new Date().toISOString().slice(0, 19).replace("T", " ");
      messages.push({ sender: "User", content: content.trim(), date: nowStr });

      // ذخیره مجدد به شکل serialize سازگار با PHP
      const value = serializeMessagesToMeta(messages);
      const nextMetaId2 = await getNextId(T_POSTMETA, "meta_id");
      if (metaId) {
        await db.query(
          `UPDATE ${T_POSTMETA} SET meta_value=? WHERE meta_id=?`,
          [value, metaId]
        );
      } else {
        await db.query(
          `INSERT INTO ${T_POSTMETA} (meta_id, post_id, meta_key, meta_value)
   VALUES (?, ?, '_ticket_chat_messages', ?)`,
          [nextMetaId2, id, value]
        );
      }

      // وضعیت را open کن و زمان ویرایش پست را آپدیت کن
      await upsertMeta(nextId, "ticket_attachments", JSON.stringify(filesMeta));
      await db.query(
        `UPDATE ${T_POSTS} SET post_modified=?, post_modified_gmt=? WHERE ID=?`,
        [nowStr, nowStr, id]
      );

      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to send reply" });
    }
  }
);

export default router;
