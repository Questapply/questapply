// src/api/payments.ts
const API_BASE = "/api";

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export type CreateSessionReq =
  | {
      intent: "psu_submission";
      resourceId: number | string;
      provider?: "paypal" | "manual";
      returnUrl: string;
      cancelUrl: string;
    }
  | {
      intent: "chat_topup";
      credits: number;
      provider?: "paypal" | "manual";
      returnUrl: string;
      cancelUrl: string;
    };

export async function createPaymentSession(
  body: CreateSessionReq,
  token: string
) {
  const res = await fetch(`${API_BASE}/payments/session`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{
    paymentId: number;
    provider: "paypal" | "manual";
    redirectUrl: string | null;
    manual?: {
      cardNumber: string;
      sheba: string;
      owner: string;
      amount: string;
      currency: string;
    };
  }>;
}

export async function getPaymentStatus(
  paymentId: number | string,
  token: string
) {
  const res = await fetch(`${API_BASE}/payments/${paymentId}/status`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{
    paymentId: number;
    status: "pending" | "succeeded" | "failed";
    uiStatus: "Paid" | "In Progress" | "Failed";
    amount: string;
    currency: string;
    intent: "psu_submission" | "chat_topup";
    resourceRef: {
      resourceType: string | null;
      resourceId: number | null;
      credits: number | null;
    };
    provider: "paypal" | "manual";
    txnId: string | null;
  }>;
}

export async function capturePayment(
  paymentId: number | string,
  token: string
) {
  const res = await fetch(`${API_BASE}/payments/${paymentId}/capture`, {
    method: "POST",
    headers: authHeaders(token),
  });
  // ممکنه بک‌اند اجازهٔ capture نده و وبهوک کافی باشه؛ پس 400 هم لزوماً خطای بحرانی نیست
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Capture failed");
  }
  return res.json();
}
