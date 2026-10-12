import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const PARTNER_DESTINATION_URL =
  "https://kettledroopingcontinuation.com/dnn2hkn8?key=99dc7f93effa31288ad7ab054a4ee276";

/**
 * First-Party Partner Showcase Gateway
 * Navigates users smoothly to the partner destination, protecting them from
 * broken JavaScript file links and adblocker client-side URL interception.
 */
export async function GET(request: NextRequest) {
  try {
    const targetUrl = new URL(PARTNER_DESTINATION_URL);
    // Forward query parameters and ping click tracking pixel if present
    const searchParams = request.nextUrl.searchParams;
    const clkParam = searchParams.get("clk");
    if (clkParam) {
      const fullClkUrl = clkParam.startsWith("http")
        ? clkParam
        : "https://pl31713601.profitableratecpmnetwork.com" + clkParam;
      fetch(fullClkUrl, {
        method: "GET",
        headers: {
          "User-Agent": request.headers.get("user-agent") || "",
          "Referer": "https://lemursai.netlify.app/",
        },
        signal: AbortSignal.timeout(3000),
      }).catch(() => {});
    }

    searchParams.forEach((value, key) => {
      if (key !== "clk") {
        targetUrl.searchParams.set(key, value);
      }
    });

    return NextResponse.redirect(targetUrl.toString(), {
      status: 307,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Referrer-Policy": "no-referrer-when-downgrade",
      },
    });
  } catch (error) {
    console.error("[Partner Redirect Error]:", error);
    return NextResponse.redirect(new URL("/", request.url), { status: 302 });
  }
}
