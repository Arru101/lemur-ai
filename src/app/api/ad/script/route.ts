import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CPM_AD_URL = "https://pl31713601.profitableratecpmnetwork.com/99/dc/7f/99dc7f93effa31288ad7ab054a4ee276.js";

/**
 * Same-Origin CPM Ad Script Proxy
 * Bypasses client-side DNS blocking, ad-blocker filters, and secure browser firewalls
 * by serving the verified ad script directly from the application's first-party domain.
 */
export async function GET(request: NextRequest) {
  try {
    const clientUserAgent = request.headers.get("user-agent") || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
    const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "";

    const response = await fetch(CPM_AD_URL, {
      method: "GET",
      headers: {
        "User-Agent": clientUserAgent,
        "Referer": "https://lemursai.netlify.app/",
        "Origin": "https://lemursai.netlify.app",
        "Accept": "*/*",
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

    // Fallback if upstream returns 0 bytes or errors
    return new NextResponse(
      `/* CPM Ad Network Proxy Fallback */
       (function() {
         console.info('[AdSystem] Primary CPM script stream routed through secure proxy.');
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
    console.error("[AdSystem Proxy Error]:", error);
    return new NextResponse(
      `/* CPM Proxy Error */ console.warn('[AdSystem] Could not proxy ad script');`,
      {
        status: 200,
        headers: {
          "Content-Type": "application/javascript; charset=utf-8",
        },
      }
    );
  }
}
