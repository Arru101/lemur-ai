import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CPM_SBAR_URL =
  "https://pl31713601.profitableratecpmnetwork.com/sbar.json?key=99dc7f93effa31288ad7ab054a4ee276";
const PARTNER_DOMAIN = "https://pl31713601.profitableratecpmnetwork.com";

interface SbarCreativeItem {
  cu?: string;
  impr?: string;
  clk?: string;
  w?: string;
  h?: string;
  url?: string;
}

/**
 * First-Party Autonomous Ad Delivery Pipeline (Brave Shields & Anti-Block Resilient)
 * Fetches the real CPM network creative server-side, inlines styling and assets,
 * pings monetization impressions server-to-server, and yields a self-contained
 * iframe srcdoc document that cannot be blocked by DNS sinkholes or cosmetic rules.
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
    const clientLang = request.headers.get("accept-language") || "en-US,en;q=0.9";

    // 1. Fetch real creative metadata from CPM ad network
    const sbarRes = await fetch(CPM_SBAR_URL, {
      method: "GET",
      headers: {
        "User-Agent": clientUserAgent,
        "Referer": "https://lemursai.netlify.app/",
        "Origin": "https://lemursai.netlify.app",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": clientLang,
        ...(clientIp ? { "X-Forwarded-For": clientIp } : {}),
      },
      signal: AbortSignal.timeout(4500),
    });

    if (!sbarRes.ok) {
      return NextResponse.json({ success: false, reason: "upstream_unavailable" }, { status: 200 });
    }

    const sbarData = (await sbarRes.json()) as SbarCreativeItem[];
    if (!Array.isArray(sbarData) || sbarData.length === 0 || !sbarData[0]?.cu) {
      return NextResponse.json({ success: false, reason: "empty_creative" }, { status: 200 });
    }

    const item = sbarData[0];
    if (!item.cu) {
      return NextResponse.json({ success: false, reason: "missing_creative_url" }, { status: 200 });
    }
    const cuUrlStr: string = item.cu;
    const cuUrl = new URL(cuUrlStr);
    const cuBase =
      cuUrl.origin + cuUrl.pathname.substring(0, cuUrl.pathname.lastIndexOf("/") + 1);

    // 2. Ping impression server-side to guarantee publisher CPM credit
    if (item.impr) {
      const imprStr: string = item.impr;
      const fullImprUrl: string = imprStr.startsWith("http")
        ? imprStr
        : PARTNER_DOMAIN + imprStr;
      fetch(fullImprUrl, {
        method: "GET",
        headers: {
          "User-Agent": clientUserAgent,
          "Referer": "https://lemursai.netlify.app/",
          ...(clientIp ? { "X-Forwarded-For": clientIp } : {}),
        },
        signal: AbortSignal.timeout(3000),
      }).catch(() => {
        // Silently continue if telemetry ping times out
      });
    }

    // 3. Fetch real creative HTML
    const htmlRes = await fetch(cuUrlStr, {
      headers: {
        "User-Agent": clientUserAgent,
        "Referer": "https://lemursai.netlify.app/",
      },
      signal: AbortSignal.timeout(4000),
    });

    if (!htmlRes.ok) {
      return NextResponse.json({ success: false, reason: "creative_html_failed" }, { status: 200 });
    }

    let html = await htmlRes.text();

    // 4. Fetch and inline stylesheets for zero-network execution
    const cssMatches = [...html.matchAll(/<link[^>]+href=["']([^"']+\.css)["']/gi)];
    let inlinedCss = "";
    for (const match of cssMatches) {
      let rawHref = match[1].replace(/(\/\/|\/)src_domain/g, cuUrl.origin);
      if (rawHref.startsWith("//")) rawHref = "https:" + rawHref;
      else if (rawHref.startsWith("/")) rawHref = cuUrl.origin + rawHref;
      else if (!rawHref.startsWith("http")) rawHref = cuBase + rawHref;

      try {
        const cssRes = await fetch(rawHref, { signal: AbortSignal.timeout(3000) });
        if (cssRes.ok) {
          inlinedCss += "\n" + (await cssRes.text());
        }
      } catch {
        // Continue
      }
    }

    // Strip external stylesheet links
    html = html.replace(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi, "");

    // 5. Inlining images as Base64 data URIs so Brave cannot intercept them
    const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)];
    for (const imgMatch of imgMatches) {
      let imgSrc = imgMatch[1].replace(/(\/\/|\/)src_domain/g, cuUrl.origin);
      if (imgSrc.startsWith("//")) imgSrc = "https:" + imgSrc;
      else if (imgSrc.startsWith("/")) imgSrc = cuUrl.origin + imgSrc;

      try {
        const imgRes = await fetch(imgSrc, { signal: AbortSignal.timeout(3500) });
        if (imgRes.ok) {
          const contentType = imgRes.headers.get("content-type") || "image/jpeg";
          const buf = await imgRes.arrayBuffer();
          const b64 = Buffer.from(buf).toString("base64");
          html = html.replace(imgMatch[1], `data:${contentType};base64,${b64}`);
        }
      } catch {
        // Fallback: leave as is
      }
    }

    // 6. Rewrite destination click links through our first-party gateway
    const redirectUrl = "/api/partner/redirect";
    html = html.replace(
      /href=["']#["']/gi,
      `href="${redirectUrl}" target="_blank" rel="noopener noreferrer"`
    );

    // 7. Assemble sandboxed self-contained HTML document
    const srcdoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: transparent;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .pl__wrap {
      margin: 0 !important;
      position: relative !important;
    }
    ${inlinedCss}
  </style>
</head>
<body>
  ${html}
  <script>
    (function() {
      document.addEventListener('click', function(e) {
        var t = e.target;
        if (t && (t.classList.contains('pl__closelink') || (t.closest && t.closest('.pl__closelink')))) {
          e.preventDefault();
          e.stopPropagation();
          window.parent.postMessage({ type: 'dismiss_partner_unit' }, '*');
        }
      });
    })();
  </script>
</body>
</html>`;

    return NextResponse.json(
      {
        success: true,
        srcdoc,
        width: item.w ? parseInt(item.w, 10) : 380,
        height: item.h ? parseInt(item.h, 10) : 110,
        clk: item.clk || null,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[Partner Unit Pipeline Error]:", error);
    return NextResponse.json(
      { success: false, reason: "internal_error" },
      { status: 200 }
    );
  }
}
