// ESM
import axios from "axios";

const PP_BASE =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_SECRET) {
    throw new Error(
      "Missing PayPal credentials (PAYPAL_CLIENT_ID / PAYPAL_SECRET)"
    );
  }

  const { data } = await axios.post(
    `${PP_BASE}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      auth: {
        username: process.env.PAYPAL_CLIENT_ID,
        password: process.env.PAYPAL_SECRET,
      },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );
  return data.access_token;
}

export async function paypalCreateOrder({
  amountMinor,
  currency,
  returnUrl,
  cancelUrl,
  paymentId,
  intentRef,
}) {
  const access = await getAccessToken();
  const value = (amountMinor / 100).toFixed(2);

  const { data } = await axios.post(
    `${PP_BASE}/v2/checkout/orders`,
    {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { currency_code: currency, value },
          custom_id: String(paymentId),
          reference_id: intentRef,
        },
      ],
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
      },
    },
    { headers: { Authorization: `Bearer ${access}` } }
  );

  const approveUrl = (data.links || []).find((l) => l.rel === "approve")?.href;
  if (!approveUrl) throw new Error("No approve link from PayPal");
  return { orderId: data.id, approveUrl };
}

export async function paypalCaptureOrder(orderId) {
  const access = await getAccessToken();
  const { data } = await axios.post(
    `${PP_BASE}/v2/checkout/orders/${orderId}/capture`,
    {},
    { headers: { Authorization: `Bearer ${access}` } }
  );

  const cap = data?.purchase_units?.[0]?.payments?.captures?.[0];
  return {
    status: cap?.status || data?.status,
    captureId: cap?.id || null,
    amount: cap?.amount?.value ? Number(cap.amount.value) : null,
    currency: cap?.amount?.currency_code || null,
    orderId: data?.id,
  };
}

export async function paypalVerifyWebhookSignature(req) {
  const access = await getAccessToken();
  const headers = req.headers;
  const body = req.body; // JSON-parsed

  const { data } = await axios.post(
    `${PP_BASE}/v1/notifications/verify-webhook-signature`,
    {
      auth_algo: headers["paypal-auth-algo"],
      cert_url: headers["paypal-cert-url"],
      transmission_id: headers["paypal-transmission-id"],
      transmission_sig: headers["paypal-transmission-sig"],
      transmission_time: headers["paypal-transmission-time"],
      webhook_id: process.env.PAYPAL_WEBHOOK_ID,
      webhook_event: body,
    },
    { headers: { Authorization: `Bearer ${access}` } }
  );

  return data?.verification_status === "SUCCESS";
}
