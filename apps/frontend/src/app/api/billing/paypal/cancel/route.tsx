import { NextRequest } from "next/server";
import { SubscriptionManager } from "@/features/billing/utils/subscriptionManager";
import { DateTime } from "luxon";

export async function POST(req: NextRequest) {
  try {
    const { userId, subscriptionId, reason } = await req.json();
    if (!userId) {
      return jsonError("User not authenticated", 401);
    }
    if (!subscriptionId) {
      return jsonError("Missing subscriptionId in request body", 400);
    }
    const paypalApiUrl = `https://api.paypal.com/v1/billing/subscriptions/${subscriptionId}/cancel`;
    const accessToken = await getPayPalAccessToken();
    const response = await fetch(paypalApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        reason: reason || "User requested cancellation",
      }),
    });
    const resultText = await response.text();
    let resultJson: any;
    try {
      resultJson = JSON.parse(resultText);
    } catch {
      resultJson = { raw: resultText };
    }
    if (!response.ok) {
      console.error("❌ PayPal cancel failed:", resultJson);
      const errorMsg =
        resultJson?.error_description ||
        resultJson?.message ||
        "PayPal cancellation failed";
      return jsonError(errorMsg, response.status);
    }
    try {
      await SubscriptionManager.cancel(userId, {
        subscriptionId,
        reason,
        canceledAt: DateTime.now(),
      });
    } catch (subErr) {
      console.error("⚠️ Failed to update local subscription:", subErr);
    }
    return new Response(JSON.stringify(resultJson), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("🔥 Unexpected error in PayPal cancellation:", error);
    return jsonError(error.message || "Internal server error", 500);
  }
}

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const tokenUrl = "https://api.paypal.com/v1/oauth2/token";
  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to retrieve PayPal access token: ${err}`);
  }
  const data = await res.json();
  return data.access_token;
}

function jsonError(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

