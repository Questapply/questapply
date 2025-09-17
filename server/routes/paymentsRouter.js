// routes/payments.js
import express from "express";
import {
  paypalCreateOrder,
  paypalCaptureOrder,
  paypalVerifyWebhookSignature,
} from "../utils/payments/providers/paypal.js";
import { ensurePaymentsTables } from "../utils/ensurePaymentsTables.js";
import { authenticateToken } from "../middleware/authMiddleware.js"; // همونی که داری
import db from "../config/db.config.js";

const router = express.Router();
const REVIEW_FEE = Number(process.env.REVIEW_FEE_USD || 50);
const CHAT_PPU = Number(process.env.CHAT_PRICE_PER_1000_CREDITS_USD || 2);

// helper: fetch userId by email
async function getUserIdByEmail(email) {
  const [urows] = await db.query(
    `SELECT ID FROM qacom_wp_users WHERE user_email = ? LIMIT 1`,
    [email]
  );
  return urows?.[0]?.ID || null;
}

// مبلغ/ارز را براساس intent امن محاسبه کن
async function computeAmountForIntent({ intent, userId, resourceId, credits }) {
  if (intent === "psu_submission") {
    if (!resourceId) throw new Error("Missing relId for psu_submission");
    const relId = Number(resourceId);
    const [rows] = await db.query(
      `SELECT application_fee, submission_fee, review_enabled, currency
         FROM qacom_psu_submissions
        WHERE user_id=? AND rel_id=? LIMIT 1`,
      [userId, relId]
    );
    const s = rows?.[0];
    if (!s) throw new Error("Submission not found for payment");
    const app = Number(s.application_fee || 0);
    const sub = Number(s.submission_fee || 0);
    const rev = s.review_enabled ? REVIEW_FEE : 0;
    const total = app + sub + rev;
    const currency = s.currency || "USD";
    return {
      amountMinor: Math.round(total * 100),
      currency,
      meta: { app, sub, rev, relId },
    };
  }

  if (intent === "chat_topup") {
    const qty = Number(credits || 0);
    if (!Number.isFinite(qty) || qty <= 0) throw new Error("Invalid credits");
    const currency = "USD";
    const total = (qty / 1000) * CHAT_PPU; // قیمت به ازای هر ۱۰۰۰
    return {
      amountMinor: Math.round(total * 100),
      currency,
      meta: { credits: qty },
    };
  }

  throw new Error("Unsupported intent");
}

// ایمن‌سازی: ساخت رکورد payment
async function createPaymentRecord({
  userId,
  intent,
  resourceType,
  resourceId,
  credits,
  amountMinor,
  currency,
  provider,
  returnUrl,
  cancelUrl,
  meta,
}) {
  const [ins] = await db.query(
    `INSERT INTO qacom_payments
      (user_id,intent,resource_type,resource_id,credits,amount_minor,currency,provider,return_url,cancel_url,meta_json)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [
      userId,
      intent,
      resourceType,
      resourceId ?? null,
      credits ?? null,
      amountMinor,
      currency,
      provider,
      returnUrl || null,
      cancelUrl || null,
      JSON.stringify(meta || {}),
    ]
  );
  return ins.insertId;
}

// پس‌اثر پرداخت موفق
async function applySideEffectOnSuccess({
  intent,
  userId,
  resourceId,
  credits,
  paymentId,
}) {
  if (intent === "psu_submission" && resourceId) {
    await db.query(
      `UPDATE qacom_psu_submissions
          SET paid=1, updated_at=NOW()
        WHERE user_id=? AND rel_id=? LIMIT 1`,
      [userId, Number(resourceId)]
    );
    return;
  }
  if (intent === "chat_topup" && credits) {
    await db.query(`
      CREATE TABLE IF NOT EXISTS qacom_credit_ledger (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT NOT NULL,
        delta_minor BIGINT NOT NULL,
        currency VARCHAR(8) NOT NULL,
        reason VARCHAR(64) NOT NULL,
        payment_id BIGINT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    await db.query(
      `INSERT INTO qacom_credit_ledger (user_id, delta_minor, currency, reason, payment_id)
       VALUES (?,?,?,?,?)`,
      [
        userId,
        Math.round(
          (Number(credits) / 1000) * CHAT_PPU * 100
        ) /* optional: پولی */,
        "USD",
        "chat_topup",
        paymentId,
      ]
    );
  }
}

// --- POST /api/payments/session ---
router.post("/payments/session", authenticateToken, async (req, res) => {
  try {
    await ensurePaymentsTables(db);

    const { email } = req.user || {};
    if (!email) return res.status(401).json({ error: "Unauthorized" });
    const userId = await getUserIdByEmail(email);
    if (!userId) return res.status(404).json({ error: "User not found" });

    const {
      intent, // "psu_submission" | "chat_topup"
      resourceId, // relId برای PSU
      credits, // برای chat_topup
      provider = "paypal",
      returnUrl,
      cancelUrl,
    } = req.body || {};

    const { amountMinor, currency, meta } = await computeAmountForIntent({
      intent,
      userId,
      resourceId,
      credits,
    });

    const paymentId = await createPaymentRecord({
      userId,
      intent,
      resourceType:
        intent === "psu_submission"
          ? "program"
          : intent === "chat_topup"
          ? "chat"
          : null,
      resourceId,
      credits,
      amountMinor,
      currency,
      provider,
      returnUrl,
      cancelUrl,
      meta: { ...meta },
    });

    if (provider === "manual") {
      return res.json({
        paymentId,
        provider,
        redirectUrl: null,
        manual: {
          cardNumber: process.env.MANUAL_CARD_NUMBER || "",
          sheba: process.env.MANUAL_SHEBA || "",
          owner: process.env.MANUAL_OWNER || "",
          amount: (amountMinor / 100).toFixed(2),
          currency: currency,
        },
      });
    }

    // PayPal
    const intentRef =
      intent === "psu_submission"
        ? `psu_submission:${resourceId}`
        : `chat_topup:${credits}`;

    const { orderId, approveUrl } = await paypalCreateOrder({
      amountMinor,
      currency,
      returnUrl: `${returnUrl}${
        returnUrl?.includes("?") ? "&" : "?"
      }paymentId=${paymentId}`,
      cancelUrl: `${cancelUrl}${
        cancelUrl?.includes("?") ? "&" : "?"
      }paymentId=${paymentId}`,
      paymentId,
      intentRef,
    });

    await db.query(
      `UPDATE qacom_payments SET provider_order_id=? WHERE id=? LIMIT 1`,
      [orderId, paymentId]
    );

    return res.json({
      paymentId,
      provider: "paypal",
      redirectUrl: approveUrl,
    });
  } catch (e) {
    console.error("POST /payments/session error:", e);
    res
      .status(400)
      .json({ error: e.message || "Failed to create payment session" });
  }
});

// --- (اختیاری) Capture بعد از برگشت کاربر ---
router.post(
  "/payments/:paymentId/capture",
  authenticateToken,
  async (req, res) => {
    try {
      const { paymentId } = req.params;
      const [rows] = await db.query(
        `SELECT * FROM qacom_payments WHERE id=? LIMIT 1`,
        [paymentId]
      );
      const p = rows?.[0];
      if (!p) return res.status(404).json({ error: "Payment not found" });
      if (p.provider !== "paypal")
        return res
          .status(400)
          .json({ error: "Capture not supported for this provider" });
      if (p.status === "succeeded")
        return res.json({ ok: true, status: p.status, txnId: p.txn_id });

      const cap = await paypalCaptureOrder(p.provider_order_id);
      if (cap.status !== "COMPLETED" && cap.status !== "CAPTURED") {
        return res
          .status(400)
          .json({ error: "Capture not completed", data: cap });
      }

      await db.query(
        `UPDATE qacom_payments SET status='succeeded', txn_id=?, updated_at=NOW() WHERE id=? LIMIT 1`,
        [cap.captureId || null, paymentId]
      );

      // side effects
      const meta = JSON.parse(p.meta_json || "{}");
      await applySideEffectOnSuccess({
        intent: p.intent,
        userId: p.user_id,
        resourceId: p.resource_id,
        credits: meta.credits,
        paymentId: p.id,
      });

      return res.json({
        ok: true,
        status: "succeeded",
        txnId: cap.captureId || null,
      });
    } catch (e) {
      console.error("POST /payments/:id/capture error:", e);
      res.status(500).json({ error: "Capture failed" });
    }
  }
);

// --- Webhook PayPal ---
router.post(
  "/payments/webhook/paypal",
  express.json({ type: "*/*" }),
  async (req, res) => {
    try {
      const verified = await paypalVerifyWebhookSignature(req);
      if (!verified) return res.status(400).send("Invalid signature");

      const event = req.body;
      // ما روی PAYMENT.CAPTURE.COMPLETED عمل می‌کنیم
      if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
        const capture = event.resource;
        const orderId = capture?.supplementary_data?.related_ids?.order_id;
        const captureId = capture?.id;
        const amount = capture?.amount?.value;
        const currency = capture?.amount?.currency_code;

        // پیدا کردن رکورد پرداخت
        const [rows] = await db.query(
          `SELECT * FROM qacom_payments WHERE provider_order_id=? LIMIT 1`,
          [orderId]
        );
        const p = rows?.[0];
        if (!p) {
          console.warn("Payment not found for order", orderId);
          return res.status(200).send("ok");
        }
        // idempotent
        if (p.status === "succeeded") return res.status(200).send("ok");

        await db.query(
          `UPDATE qacom_payments
           SET status='succeeded', txn_id=?, amount_minor=amount_minor, currency=currency, updated_at=NOW()
         WHERE id=? LIMIT 1`,
          [captureId || null, p.id]
        );

        // side effects
        const meta = JSON.parse(p.meta_json || "{}");
        await applySideEffectOnSuccess({
          intent: p.intent,
          userId: p.user_id,
          resourceId: p.resource_id,
          credits: meta.credits,
          paymentId: p.id,
        });
      }

      res.status(200).send("ok");
    } catch (e) {
      console.error("PayPal webhook error:", e);
      res.status(500).send("error");
    }
  }
);

// --- Status ---
router.get(
  "/payments/:paymentId/status",
  authenticateToken,
  async (req, res) => {
    try {
      const { email } = req.user || {};
      const userId = await getUserIdByEmail(email);
      const { paymentId } = req.params;
      const [rows] = await db.query(
        `SELECT * FROM qacom_payments WHERE id=? AND user_id=? LIMIT 1`,
        [paymentId, userId]
      );
      const p = rows?.[0];
      if (!p) return res.status(404).json({ error: "Payment not found" });

      const statusMap = {
        succeeded: "Paid",
        pending: "In Progress",
        failed: "Failed",
      };
      const out = {
        paymentId: p.id,
        status: p.status,
        uiStatus: statusMap[p.status] || p.status,
        amount: (p.amount_minor / 100).toFixed(2),
        currency: p.currency,
        intent: p.intent,
        resourceRef: {
          resourceType: p.resource_type,
          resourceId: p.resource_id,
          credits: p.credits,
        },
        provider: p.provider,
        txnId: p.txn_id,
      };
      res.json(out);
    } catch (e) {
      res.status(500).json({ error: "Internal error" });
    }
  }
);

// --- My payments list (برای صفحه history) ---
router.get("/payments/my", authenticateToken, async (req, res) => {
  try {
    const { email } = req.user || {};
    const userId = await getUserIdByEmail(email);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const [rows] = await db.query(
      `SELECT id, created_at, updated_at, amount_minor, currency, provider, status, txn_id
         FROM qacom_payments
        WHERE user_id=?
        ORDER BY created_at DESC
        LIMIT 200`,
      [userId]
    );

    const statusMap = {
      succeeded: "Paid",
      pending: "In Progress",
      failed: "Failed",
    };
    const data = rows.map((r) => ({
      date: r.updated_at || r.created_at,
      total: Number((r.amount_minor / 100).toFixed(2)),
      provider: r.provider,
      invoiceNumber: r.id,
      status: statusMap[r.status] || r.status,
      transactionId: r.txn_id,
    }));
    res.json({ payments: data });
  } catch (e) {
    console.error("GET /payments/my error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
