// routes/notificationsRoutes.js
import { Router } from "express";
import db from "../config/db.config.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
const router = Router();
const WP_PREFIX = process.env.WP_PREFIX || "qacom_wp_";

async function resolveUserId(req, conn) {
  const u = req.user || {};
  const fromToken = u.id ?? u.userId ?? u.ID ?? null;
  if (fromToken) return Number(fromToken);

  const email = u.email ?? u.user_email ?? null;
  if (email) {
    const [rows] = await conn.query(
      `SELECT ID FROM ${WP_PREFIX}users WHERE user_email = ? LIMIT 1`,
      [email]
    );
    if (rows[0]?.ID) return Number(rows[0].ID);
  }

  if (req.query.userId) return Number(req.query.userId);

  throw new Error("UNAUTHORIZED: user id not found");
}

/** شمارش کل unread (شخصی + عمومی) */
async function getTotalUnreadCount(conn, userId) {
  const [pRows] = await conn.query(
    `SELECT COUNT(*) AS c
     FROM ${WP_PREFIX}notify n
     WHERE n.user_id = ? AND COALESCE(n.status,'unread')='unread'`,
    [userId]
  );

  const [pubRows] = await conn.query(
    `SELECT COUNT(*) AS c
     FROM ${WP_PREFIX}notify n
     LEFT JOIN ${WP_PREFIX}notify_status s
       ON s.notify_id = n.id AND s.user_id = ?
     WHERE n.user_id = 0
       AND COALESCE(s.status,'unread')='unread'`,
    [userId]
  );

  return Number(pRows[0]?.c || 0) + Number(pubRows[0]?.c || 0);
}
async function upsertNotifyStatus(conn, userId, notifId, newStatus = "read") {
  // 1) Try update
  const [upd] = await conn.query(
    `UPDATE ${WP_PREFIX}notify_status
     SET status = ?, read_at = NOW()
     WHERE user_id = ? AND notify_id = ?`,
    [newStatus, userId, notifId]
  );
  if (upd.affectedRows > 0) return;

  // 2) Try insert without id
  try {
    await conn.query(
      `INSERT INTO ${WP_PREFIX}notify_status (user_id, notify_id, status, read_at)
       VALUES (?, ?, ?, NOW())`,
      [userId, notifId, newStatus]
    );
    return;
  } catch (e) {
    // 3) If id has no default -> compute next id and insert with id
    if (e?.code === "ER_NO_DEFAULT_FOR_FIELD") {
      const [rows] = await conn.query(
        `SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM ${WP_PREFIX}notify_status`
      );
      const nextId = Number(rows[0]?.next_id || 1);
      await conn.query(
        `INSERT INTO ${WP_PREFIX}notify_status (id, user_id, notify_id, status, read_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [nextId, userId, notifId, newStatus]
      );
      return;
    }
    throw e; // سایر خطاها
  }
}

// GET /api/notifications/unread?limit=3
router.get("/notifications/unread", authenticateToken, async (req, res) => {
  const conn = await db.getConnection();
  try {
    const userId = await resolveUserId(req, conn);
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 3));

    const total_unread_count = await getTotalUnreadCount(conn, userId);

    const [rows] = await conn.query(
      `
      (
        SELECT
          n.id, n.user_id, n.subject, n.content, n.kind,
          COALESCE(n.date, '1970-01-01') AS display_date,
          COALESCE(s.status, n.status, 'unread') AS final_status
        FROM ${WP_PREFIX}notify n
        LEFT JOIN ${WP_PREFIX}notify_status s
          ON s.notify_id = n.id AND s.user_id = ?
        WHERE n.user_id = ? AND COALESCE(n.status,'unread')='unread'
      )
      UNION ALL
      (
        SELECT
          n.id, n.user_id, n.subject, n.content, n.kind,
          COALESCE(n.date, '1970-01-01') AS display_date,
          COALESCE(s.status, 'unread') AS final_status
        FROM ${WP_PREFIX}notify n
        LEFT JOIN ${WP_PREFIX}notify_status s
          ON s.notify_id = n.id AND s.user_id = ?
        WHERE n.user_id = 0 AND COALESCE(s.status,'unread')='unread'
      )
      ORDER BY display_date DESC, id DESC
      LIMIT ?
      `,
      [userId, userId, userId, limit]
    );

    // قانون تاریخ ویژه id=6 → تاریخ ثبت‌نام کاربر
    const [userRow] = await conn.query(
      `SELECT user_registered FROM ${WP_PREFIX}users WHERE ID = ? LIMIT 1`,
      [userId]
    );
    const regDate = userRow[0]?.user_registered || null;

    res.json({
      total_unread_count,
      notifications: rows.map((r) => ({
        id: r.id,
        user_id: r.user_id,
        subject: r.subject,
        content: r.content,
        kind: r.kind,
        final_status: r.final_status || "unread",
        date: r.id === 6 && regDate ? regDate : r.display_date,
      })),
    });
  } catch (err) {
    console.error("[GET /notifications/unread]", err);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  } finally {
    conn.release();
  }
});

// GET /api/notifications  (لیست کامل با pagination)
router.get("/notifications", authenticateToken, async (req, res) => {
  const conn = await db.getConnection();
  try {
    const userId = await resolveUserId(req, conn);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const [countRows] = await conn.query(
      `SELECT COUNT(*) AS c
       FROM ${WP_PREFIX}notify n
       WHERE (n.user_id = ? OR n.user_id = 0)`,
      [userId]
    );
    const total = Number(countRows[0]?.c || 0);

    const [rows] = await conn.query(
      `
      SELECT
        n.id, n.user_id, n.subject, n.kind,
        CASE
          WHEN n.user_id = 0 THEN COALESCE(s.status, 'unread')
          ELSE COALESCE(s.status, n.status, 'unread')
        END AS final_status,
        CASE WHEN n.id = 6 THEN u.user_registered ELSE n.date END AS display_date
      FROM ${WP_PREFIX}notify n
      LEFT JOIN ${WP_PREFIX}notify_status s
        ON s.notify_id = n.id AND s.user_id = ?
      LEFT JOIN ${WP_PREFIX}users u
        ON u.ID = ?
      WHERE (n.user_id = ? OR n.user_id = 0)
      ORDER BY COALESCE(display_date, '1970-01-01') DESC, n.id DESC
      LIMIT ? OFFSET ?
      `,
      [userId, userId, userId, limit, offset]
    );

    res.json({
      page,
      limit,
      total,
      items: rows.map((r) => ({
        id: r.id,
        user_id: r.user_id,
        subject: r.subject,
        kind: r.kind,
        final_status: r.final_status || "unread",
        date: r.display_date,
      })),
    });
  } catch (err) {
    console.error("[GET /notifications]", err);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  } finally {
    conn.release();
  }
});

// GET /api/notifications/:id  (جزئیات)
router.get("/notifications/:id", authenticateToken, async (req, res) => {
  const conn = await db.getConnection();
  try {
    const userId = await resolveUserId(req, conn);
    const notifId = Number(req.params.id);

    const [rows] = await conn.query(
      `
      SELECT
        n.*,
        CASE
          WHEN n.user_id = 0 THEN COALESCE(s.status, 'unread')
          ELSE COALESCE(s.status, n.status, 'unread')
        END AS final_status,
        CASE WHEN n.id = 6 THEN u.user_registered ELSE n.date END AS display_date
      FROM ${WP_PREFIX}notify n
      LEFT JOIN ${WP_PREFIX}notify_status s
        ON s.notify_id = n.id AND s.user_id = ?
      LEFT JOIN ${WP_PREFIX}users u
        ON u.ID = ?
      WHERE n.id = ? AND (n.user_id = ? OR n.user_id = 0)
      LIMIT 1
      `,
      [userId, userId, notifId, userId]
    );

    const n = rows[0];
    if (!n) return res.status(404).json({ error: "NOT_FOUND" });

    res.json({
      id: n.id,
      user_id: n.user_id,
      subject: n.subject,
      content: n.content,
      kind: n.kind,
      final_status: n.final_status || "unread",
      date: n.display_date,
    });
  } catch (err) {
    console.error("[GET /notifications/:id]", err);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  } finally {
    conn.release();
  }
});

// POST /api/notifications/:id/mark-read
router.post(
  "/notifications/:id/mark-read",
  authenticateToken,
  async (req, res) => {
    const conn = await db.getConnection();
    try {
      const userId = await resolveUserId(req, conn);
      const notifId = Number(req.params.id);

      const [rows] = await conn.query(
        `SELECT id, user_id FROM ${WP_PREFIX}notify WHERE id = ? LIMIT 1`,
        [notifId]
      );
      const n = rows[0];
      if (!n) return res.status(404).json({ error: "NOT_FOUND" });

      if (n.user_id === 0) {
        // عمومی: به‌جای INSERT مستقیم، از هلسپر resilent استفاده کن
        await upsertNotifyStatus(conn, userId, notifId, "read");
      } else {
        // شخصی: مثل قبل
        await conn.query(
          `UPDATE ${WP_PREFIX}notify
     SET status='read'
     WHERE id=? AND user_id=?`,
          [notifId, userId]
        );
      }

      res.json({ ok: true });
    } catch (err) {
      console.error("[POST /notifications/:id/mark-read]", err);
      res.status(500).json({ error: "INTERNAL_ERROR" });
    } finally {
      conn.release();
    }
  }
);

// POST /api/notifications/mark-all-read
router.post(
  "/notifications/mark-all-read",
  authenticateToken,
  async (req, res) => {
    const conn = await db.getConnection();
    try {
      const userId = await resolveUserId(req, conn);

      // شخصی‌ها
      await conn.query(
        `UPDATE ${WP_PREFIX}notify
       SET status='read'
       WHERE user_id=? AND COALESCE(status,'unread')='unread'`,
        [userId]
      );

      // عمومی‌ها (receipt/upsert گروهی)
      const [todo] = await conn.query(
        `SELECT n.id AS notif_id
   FROM ${WP_PREFIX}notify n
   LEFT JOIN ${WP_PREFIX}notify_status s
     ON s.notify_id = n.id AND s.user_id = ?
   WHERE n.user_id = 0 AND COALESCE(s.status,'unread')='unread'`,
        [userId]
      );

      for (const row of todo) {
        await upsertNotifyStatus(conn, userId, row.notif_id, "read");
      }

      res.json({ ok: true });
    } catch (err) {
      console.error("[POST /notifications/mark-all-read]", err);
      res.status(500).json({ error: "INTERNAL_ERROR" });
    } finally {
      conn.release();
    }
  }
);

export default router;
