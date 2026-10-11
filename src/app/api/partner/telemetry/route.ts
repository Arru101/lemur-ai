import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const UPSTREAM_PARTNER_CDN =
  "https://pl31713601.profitableratecpmnetwork.com/99/dc/7f/99dc7f93effa31288ad7ab054a4ee276.js";

/**
 * High-Resilience Partner Script Telemetry Endpoint
 * Delivers partner monetization payloads to all client environments,
 * bypassing DNS sinkholes, heuristic content blockers, and firewall filters.
 */
export async function GET(request: NextRequest) {
  try {
    const clientUserAgent =
      request.headers.get("user-agent") ||
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
    const clientIp =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "";
    const clientLang =
      request.headers.get("accept-language") || "en-US,en;q=0.9";

    const response = await fetch(UPSTREAM_PARTNER_CDN, {
      method: "GET",
      headers: {
        "User-Agent": clientUserAgent,
        "Referer": "https://lemursai.netlify.app/",
        "Origin": "https://lemursai.netlify.app",
        "Accept": "*/*",
        "Accept-Language": clientLang,
        "Sec-Fetch-Dest": "script",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "cross-site",
        ...(clientIp ? { "X-Forwarded-For": clientIp } : {}),
      },
      next: { revalidate: 300 },
    });

    if (response.ok) {
      const scriptCode = await response.text();
      if (scriptCode && scriptCode.length > 50) {
        return new NextResponse(scriptCode, {
          status: 200,
          headers: {
            "Content-Type": "application/javascript; charset=utf-8",
            "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
    }

    return new NextResponse(
      `/* Partner Telemetry Core Engine Ready */
       (function() {
         window.__PARTNER_TELEMETRY_LOADED__ = true;
       })();`,
      {
        status: 200,
        headers: {
          "Content-Type": "application/javascript; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("[Partner Telemetry Delivery Error]:", error);
    return new NextResponse(
      `/* Partner Telemetry Fallback */
       (function() {
         window.__PARTNER_TELEMETRY_FALLBACK__ = true;
       })();`,
      {
        status: 200,
        headers: {
          "Content-Type": "application/javascript; charset=utf-8",
        },
      }
    );
  }
}
