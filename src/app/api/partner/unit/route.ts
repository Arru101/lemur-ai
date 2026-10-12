import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CPM_SBAR_URL =
  "https://pl31713601.profitableratecpmnetwork.com/sbar.json?key=99dc7f93effa31288ad7ab054a4ee276";
const PARTNER_DOMAIN = "https://pl31713601.profitableratecpmnetwork.com";
const REDIRECT_TARGET = "/api/partner/redirect";

interface SbarCreativeItem {
  cu?: string;
  impr?: string;
  clk?: string;
  w?: string;
  h?: string;
  url?: string;
}

function buildNativeSocialBarDoc(redirectUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: transparent;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow: hidden;
      user-select: none;
      -webkit-user-select: none;
    }
    .sb-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(13, 17, 28, 0.96);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 14px;
      padding: 10px 14px;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.65), 0 0 16px rgba(99, 102, 241, 0.2);
      color: #fff;
      cursor: pointer;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    }
    .sb-bar:hover {
      transform: translateY(-1px);
      border-color: rgba(99, 102, 241, 0.4);
      box-shadow: 0 16px 42px rgba(0, 0, 0, 0.75), 0 0 24px rgba(99, 102, 241, 0.35);
    }
    .sb-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    }
    .sb-icon svg {
      width: 20px;
      height: 20px;
      fill: #fff;
    }
    .sb-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .sb-badge-line {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .sb-badge {
      font-size: 9.5px;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #a5b4fc;
      background: rgba(99, 102, 241, 0.2);
      padding: 1.5px 6px;
      border-radius: 4px;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }
    .sb-desc {
      font-size: 12px;
      font-weight: 500;
      color: #cbd5e1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.3;
    }
    .sb-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
    .sb-cta {
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: #fff;
      font-size: 11px;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 7px;
      text-decoration: none;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.4);
      transition: opacity 0.15s ease;
    }
    .sb-cta:hover {
      opacity: 0.92;
    }
    .sb-close {
      width: 20px;
      height: 20px;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      font-size: 15px;
      line-height: 1;
      cursor: pointer;
      background: rgba(255, 255, 255, 0.06);
      border: none;
      transition: color 0.15s ease, background 0.15s ease;
    }
    .sb-close:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.18);
    }
  </style>
</head>
<body>
  <div class="sb-bar" id="adBar">
    <div class="sb-icon">
      <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
    </div>
    <div class="sb-content">
      <div class="sb-badge-line">
        <span class="sb-badge">Sponsor</span>
        <span class="sb-desc">Special Recommendation</span>
      </div>
    </div>
    <div class="sb-actions">
      <a href="${redirectUrl}" target="_blank" rel="noopener noreferrer" class="sb-cta">Visit &rarr;</a>
      <button class="sb-close" type="button" aria-label="Dismiss">&times;</button>
    </div>
  </div>
  <script>
    document.getElementById('adBar').addEventListener('click', function(e) {
      if (e.target.closest('.sb-close')) {
        e.preventDefault();
        e.stopPropagation();
        window.parent.postMessage({ type: 'dismiss_partner_unit' }, '*');
        return;
      }
      window.open('${redirectUrl}', '_blank', 'noopener,noreferrer');
    });
  </script>
</body>
</html>`;
}

/**
 * Autonomous First-Party Ad Stream Gateway (Brave Shields & Anti-Block Resilient)
 * Fetches real CPM creative server-side when upstream is available.
 * If upstream blocks or datacenter throttling occurs, smoothly serves a native
 * self-contained Social Bar unit that connects directly to the monetization smartlink.
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

    // Attempt upstream creative resolution
    let upstreamDoc: string | null = null;
    let width = 380;
    let height = 64;

    try {
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
        signal: AbortSignal.timeout(3000),
      });

      if (sbarRes.ok) {
        const sbarText = await sbarRes.text();
        const sbarData = JSON.parse(sbarText) as SbarCreativeItem[];
        if (Array.isArray(sbarData) && sbarData.length > 0 && sbarData[0]?.cu) {
          const item = sbarData[0];
          const cuUrlStr = item.cu;
          if (!cuUrlStr) {
            throw new Error("missing_cu_url");
          }
          const cuUrl = new URL(cuUrlStr);
          const cuBase =
            cuUrl.origin + cuUrl.pathname.substring(0, cuUrl.pathname.lastIndexOf("/") + 1);

          // Ping impression pixel server-side
          if (item.impr) {
            const imprStr: string = item.impr;
            const fullImprUrl = imprStr.startsWith("http")
              ? imprStr
              : PARTNER_DOMAIN + imprStr;
            fetch(fullImprUrl, {
              headers: { "User-Agent": clientUserAgent, "Referer": "https://lemursai.netlify.app/" },
              signal: AbortSignal.timeout(2000),
            }).catch(() => {});
          }

          const htmlRes = await fetch(cuUrlStr, {
            headers: { "User-Agent": clientUserAgent, "Referer": "https://lemursai.netlify.app/" },
            signal: AbortSignal.timeout(2500),
          });

          if (htmlRes.ok) {
            let html = await htmlRes.text();

            // Inline styles
            const cssMatches = [...html.matchAll(/<link[^>]+href=["']([^"']+\.css)["']/gi)];
            let inlinedCss = "";
            for (const match of cssMatches) {
              let rawHref = match[1].replace(/(\/\/|\/)src_domain/g, cuUrl.origin);
              if (rawHref.startsWith("//")) rawHref = "https:" + rawHref;
              else if (rawHref.startsWith("/")) rawHref = cuUrl.origin + rawHref;
              else if (!rawHref.startsWith("http")) rawHref = cuBase + rawHref;

              try {
                const cssRes = await fetch(rawHref, { signal: AbortSignal.timeout(2000) });
                if (cssRes.ok) inlinedCss += "\n" + (await cssRes.text());
              } catch {}
            }

            html = html.replace(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi, "");

            // Inline images
            const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)];
            for (const imgMatch of imgMatches) {
              let imgSrc = imgMatch[1].replace(/(\/\/|\/)src_domain/g, cuUrl.origin);
              if (imgSrc.startsWith("//")) imgSrc = "https:" + imgSrc;
              else if (imgSrc.startsWith("/")) imgSrc = cuUrl.origin + imgSrc;

              try {
                const imgRes = await fetch(imgSrc, { signal: AbortSignal.timeout(2000) });
                if (imgRes.ok) {
                  const contentType = imgRes.headers.get("content-type") || "image/jpeg";
                  const buf = await imgRes.arrayBuffer();
                  const b64 = Buffer.from(buf).toString("base64");
                  html = html.replace(imgMatch[1], `data:${contentType};base64,${b64}`);
                }
              } catch {}
            }

            html = html.replace(
              /href=["']#["']/gi,
              `href="${REDIRECT_TARGET}" target="_blank" rel="noopener noreferrer"`
            );

            upstreamDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; overflow: hidden; background: transparent; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    ${inlinedCss}
  </style>
</head>
<body>
  ${html}
  <script>
    document.addEventListener('click', function(e) {
      var t = e.target;
      if (t && (t.classList.contains('pl__closelink') || (t.closest && t.closest('.pl__closelink')))) {
        e.preventDefault();
        e.stopPropagation();
        window.parent.postMessage({ type: 'dismiss_partner_unit' }, '*');
      }
    });
  </script>
</body>
</html>`;
            if (item.w) width = parseInt(item.w, 10);
            if (item.h) height = parseInt(item.h, 10);
          }
        }
      }
    } catch {
      // Graceful fallback to native document
    }

    const srcdoc = upstreamDoc || buildNativeSocialBarDoc(REDIRECT_TARGET);

    return NextResponse.json(
      {
        success: true,
        srcdoc,
        width,
        height,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[Partner Unit Route Error]:", error);
    // Absolute fallback guarantee
    return NextResponse.json(
      {
        success: true,
        srcdoc: buildNativeSocialBarDoc(REDIRECT_TARGET),
        width: 380,
        height: 64,
      },
      {
        status: 200,
      }
    );
  }
}
