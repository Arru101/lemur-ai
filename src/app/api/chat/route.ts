import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300; // 5-minute timeout for extensive long-answer generation
export const dynamic = "force-dynamic";

// In-memory rate limiting token bucket
const rateLimitMap = new Map<string, { tokens: number; lastRefill: number }>();
const LIMIT_TOKENS = 30; // 30 requests per bucket
const REFILL_RATE = 1000 * 15; // Refill 1 token every 15 seconds

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { tokens: LIMIT_TOKENS - 1, lastRefill: now });
    // Periodically sweep stale entries (older than 10 minutes) to prevent memory leak
    if (rateLimitMap.size > 500) {
      const cutoff = now - 10 * 60 * 1000;
      for (const [key, val] of rateLimitMap.entries()) {
        if (val.lastRefill < cutoff) rateLimitMap.delete(key);
      }
    }
    return true;
  }

  const record = rateLimitMap.get(ip)!;
  const elapsed = now - record.lastRefill;
  const newTokens = Math.floor(elapsed / REFILL_RATE);

  if (newTokens > 0) {
    record.tokens = Math.min(LIMIT_TOKENS, record.tokens + newTokens);
    record.lastRefill = now;
  }

  if (record.tokens > 0) {
    record.tokens--;
    return true;
  }

  return false;
}

const LANGUAGE_MAP: Record<string, string> = {
  en: "English",
  bho: "Bhojpuri",
  bhojpuri: "Bhojpuri",
  sa: "Sanskrit",
  sanskrit: "Sanskrit",
  sankrit: "Sanskrit",
  hi: "Hindi",
  bn: "Bengali",
  ur: "Urdu",
  ar: "Arabic",
  ta: "Tamil",
  te: "Telugu",
  mr: "Marathi",
  gu: "Gujarati",
  kn: "Kannada",
  ml: "Malayalam",
  pa: "Punjabi",
  or: "Odia",
  as: "Assamese",
  es: "Spanish",
  fr: "French",
  de: "German",
  zh: "Chinese (Simplified)",
  ja: "Japanese",
  pt: "Portuguese",
  it: "Italian",
};

interface ModelInfo {
  name: string;
  provider: "google" | "openrouter" | "routing";
  id: string;
  openrouterId?: string;
  description: string;
}

export const MODELS: Record<string, ModelInfo> = {
  "smart-router": {
    name: "Smart Router (Auto)",
    provider: "routing",
    id: "smart-router",
    description: "Auto-routes to the best model for your specific prompt",
  },
  "gemini-flash": {
    name: "Gemini 3.8 Flash",
    provider: "google",
    id: "gemini-3.8-flash",
    description: "Google flagship SOTA, vision, multimodal & deep reasoning",
  },
  "gemini-lite": {
    name: "Gemini 3.5 Flash Lite",
    provider: "google",
    id: "gemini-3.5-flash-lite",
    description: "Instant sub-second latency for quick questions & summaries",
  },
  "nemotron-lightning": {
    name: "Nemotron 3.5 Lightning (Free)",
    provider: "openrouter",
    id: "nvidia/nemotron-3.5-lightning:free",
    openrouterId: "nvidia/nemotron-3.5-lightning:free",
    description: "1M tokens context, fast reasoning & algorithmic logic",
  },
  "nemotron-ultra": {
    name: "Nemotron 3 Ultra 550B (Free)",
    provider: "openrouter",
    id: "nvidia/nemotron-3-ultra-550b-a55b:free",
    openrouterId: "nvidia/nemotron-3-ultra-550b-a55b:free",
    description: "Massive 550B parameters for deep synthesis & analysis",
  },
  "cohere-code": {
    name: "Cohere North Mini Code (Free)",
    provider: "openrouter",
    id: "cohere/north-mini-code:free",
    openrouterId: "cohere/north-mini-code:free",
    description: "256K context specialized high-accuracy code model",
  },
  "gemma-31b": {
    name: "Gemma 4 31B (Free)",
    provider: "openrouter",
    id: "google/gemma-4-31b-it:free",
    openrouterId: "google/gemma-4-31b-it:free",
    description: "Google's upgraded 31B open instruction-following model",
  },
  "openrouter-free": {
    name: "OpenRouter Dynamic (Free)",
    provider: "openrouter",
    id: "openrouter/free",
    openrouterId: "openrouter/free",
    description: "Auto-routes dynamically across live healthy free models",
  },
};

interface SmartRoutingProfile {
  modelKey: keyof typeof MODELS;
  intent: "spreadsheet" | "math_logic" | "code" | "deep_analysis" | "creative" | "quick_lookup" | "general";
  temperature: number;
  thinkingBudget: number;
  reason: string;
}

function classifyQuery(query: string, file?: AttachedFilePayload | null): SmartRoutingProfile {
  // 1. Multimodal Vision Routing
  // If an image or document is attached, Gemini 3.8 Flash provides native multimodal vision & document processing
  if (file && (file.type?.startsWith("image/") || file.data)) {
    return {
      modelKey: "gemini-flash",
      intent: "general",
      temperature: 0.35,
      thinkingBudget: 2048,
      reason: "Multimodal Vision & Document Intelligence",
    };
  }

  const clean = query.trim();
  const q = clean.toLowerCase();

  // 2. Excel, Google Sheets, Financial & Data Modeling
  const spreadsheetRegex = /\b(excel|spreadsheet|vlookup|xlookup|index match|sumifs|countifs|averageifs|pivot table|pivottable|power query|powerpivot|vba|macro|google sheets|worksheet|cell formula|conditional formatting|textsplit|lambda|let\(|sumproduct|nested if|data validation)\b/i;
  const spreadsheetFormulaPattern = /=(sum|if|xlookup|vlookup|index|match|count|average|filter|sort|unique|let|lambda)\s*\(/i;
  if (spreadsheetRegex.test(q) || spreadsheetFormulaPattern.test(clean)) {
    return {
      modelKey: "gemini-flash",
      intent: "spreadsheet",
      temperature: 0.2, // Deterministic precision for formula correctness
      thinkingBudget: 3072, // Thinking budget for formula and reference verification
      reason: "Excel & Spreadsheet Modeling (Verified Syntax Engine)",
    };
  }

  // 3. Mathematical Reasoning, Algorithmic Logic & Formal Proofs
  // Nvidia Nemotron 3.5 Lightning is specialized for deep chain-of-thought mathematical reasoning with 1M context
  const mathReasoningRegex = /\b(solve|calculate|differential equation|integral|derivative|calculus|linear algebra|eigenvalue|eigenvector|matrix multiplication|fourier transform|laplace|probability distribution|bayes theorem|hypothesis test|p-value|combinatorics|permutation|discrete math|formal proof|prove that|theorem|lemma|corollary|qed|physics|quantum|thermodynamics|relativity|newtonian|boolean algebra|logic gate|turing machine|np-complete|dynamic programming|dijkstra|bellman-ford|a\* algorithm|simplex method)\b/i;
  const hasMathSymbols = /(\b(d\/dx|\\[a-zA-Z]+|\b\d+\s*[\^*/+-]\s*\d+\b|\b\d+!\b)|\b(x\^2|y\^2)\b)/.test(clean);
  if (mathReasoningRegex.test(q) || hasMathSymbols) {
    return {
      modelKey: "nemotron-lightning",
      intent: "math_logic",
      temperature: 0.2,
      thinkingBudget: 4096,
      reason: "Nvidia 1M Context Mathematical Logic & Proofs",
    };
  }

  // 4. Ultra-Deep 550B Architectural & Complex Research Analysis
  const ultraDeepRegex = /\b(550b|ultra deep|deep analysis|exhaustive analysis|comprehensive breakdown|systematic review|deep literature review|multi-system benchmark|doctoral level|architectural trade-offs|distributed systems consensus)\b/i;
  if (ultraDeepRegex.test(q)) {
    return {
      modelKey: "nemotron-ultra",
      intent: "deep_analysis",
      temperature: 0.35,
      thinkingBudget: 4096,
      reason: "Nvidia 550B Architectural Depth & Systems Analysis",
    };
  }

  // 5. Coding, Debugging & Software Engineering
  const codeRegex = /\b(javascript|typescript|python|rust|golang|c\+\+|java|c#|swift|kotlin|php|ruby|sql|nosql|mongodb|postgres|mysql|html|css|tailwind|react|nextjs|vue|angular|svelte|nodejs|express|fastapi|django|flask|spring boot|docker|kubernetes|aws|git|github|ci\/cd|regex|api|graphql|rest api|json|yaml|xml|sdk|npm|pip|cargo|webpack|vite|algorithm|data structure|refactor|debug|compiler|syntax error|stack trace|runtime error|nullpointer|async|await|promise|middleware|orm|prisma|mongoose)\b/i;
  const hasCodeFences = /```|\b(def|class|const|let|var|function|import|export|interface|enum|public|private)\s+[a-zA-Z_$]/.test(clean);
  if (codeRegex.test(q) || hasCodeFences) {
    return {
      modelKey: "cohere-code",
      intent: "code",
      temperature: 0.25,
      thinkingBudget: 2560,
      reason: "Cohere 256K Specialized Code Engine",
    };
  }

  // 6. Long Creative Writing, Essays, Literary Synthesis & Multilingual Depth
  const creativeSynthesisRegex = /\b(essay|story|poem|poetry|novel|screenplay|script|narrative|creative writing|fiction|biography|memoir|speech|editorial|blog post|copywriting|paraphrase|metaphor|rhyme|dialogue|playwright|lyrics|chapter|prose|critique|literary analysis)\b/i;
  const hasNonLatinScript = /[\u0600-\u06FF\u0900-\u097F\u0980-\u09FF\u0B80-\u0BFF\u0C00-\u0C7F\u4E00-\u9FFF\u3040-\u30FF]/.test(clean);
  if (creativeSynthesisRegex.test(q) || (hasNonLatinScript && clean.length > 70)) {
    return {
      modelKey: "gemma-31b",
      intent: "creative",
      temperature: 0.65,
      thinkingBudget: 1536,
      reason: "Google Gemma 31B Open Literary Synthesis",
    };
  }

  // 7. Rapid Factoid Lookups & Short Inquiries (< 40 characters)
  const isGreetingOrSimple = /^(hi|hello|hey|yo|greetings|thanks|thank you|good (morning|afternoon|evening)|who is [a-z0-9 ]{2,30}\??|what is (the )?[a-z0-9 ]{2,30}\??|define [a-z0-9 ]{2,30}\??)\.?$/i.test(clean);
  if (isGreetingOrSimple || (clean.length < 40 && !/[{}<>=/*+\\[\\]_]/.test(clean))) {
    return {
      modelKey: "gemini-lite",
      intent: "quick_lookup",
      temperature: 0.3,
      thinkingBudget: 0,
      reason: "Sub-second Instant Response",
    };
  }

  // 8. General High-Capacity Intelligence (Default)
  return {
    modelKey: "gemini-flash",
    intent: "general",
    temperature: 0.35,
    thinkingBudget: 2048,
    reason: "Google Gemini 3.8 Flash Frontier Multimodal",
  };
}

interface ChatMessagePayload {
  role: "user" | "assistant" | "system";
  content: string;
}

interface AttachedFilePayload {
  name: string;
  type: string;
  data: string;
  content?: string;
}

interface RequestPayload {
  messages?: ChatMessagePayload[];
  model?: string;
  language?: string;
  file?: AttachedFilePayload | null;
}

interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

interface GeminiContent {
  role: string;
  parts: GeminiPart[];
}

interface StreamEventPayload {
  type: "meta" | "chunk" | "warning" | "error" | "done" | "ping";
  model?: string;
  routedModelKey?: string;
  isSmartRouted?: boolean;
  text?: string;
  warning?: string;
  error?: string;
}

export async function POST(req: NextRequest) {
  // 1. Rate Limiting Check
  const ip = req.headers.get("x-forwarded-for") || "anonymous_ip";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment before sending another message." },
      { status: 429 }
    );
  }

  // 2. Parse Request
  let body: RequestPayload;
  try {
    body = (await req.json()) as RequestPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  const { messages, model: selectedModelId, language, file } = body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Messages array is required." }, { status: 400 });
  }

  const lastMessage = messages[messages.length - 1];
  const userPrompt = lastMessage?.content || "";

  // 3. Routing
  let activeModelKey: keyof typeof MODELS = "gemini-flash";
  let isSmartRouted = false;
  let customTemperature: number | undefined;
  let customThinkingBudget: number | undefined;
  let routingIntent: string | undefined;

  if (selectedModelId === "smart-router") {
    const profile = classifyQuery(userPrompt, file);
    activeModelKey = profile.modelKey;
    customTemperature = profile.temperature;
    customThinkingBudget = profile.thinkingBudget;
    routingIntent = profile.intent;
    isSmartRouted = true;
  } else if (selectedModelId && selectedModelId in MODELS) {
    activeModelKey = selectedModelId as keyof typeof MODELS;
  }

  const activeModel = MODELS[activeModelKey];
  const targetLanguage = LANGUAGE_MAP[language || "en"] || "English";

  let intentDirective = "";
  if (routingIntent === "spreadsheet") {
    intentDirective = `\n\n# Specialized Excel & Spreadsheet Engineering Directive:
- Provide exact, tested formulas (e.g. XLOOKUP, INDEX/MATCH, SUMIFS with sum_range first, FILTER, UNIQUE, LET, LAMBDA).
- Detail explicit row/column coordinates (e.g., $A$2:$D$100).
- Explain edge case handling (#N/A via XLOOKUP's [if_not_found] argument or IFERROR).
- Include helpful Excel keyboard shortcuts and testing verification steps.`;
  } else if (routingIntent === "math_logic") {
    intentDirective = `\n\n# Specialized Mathematical & Algorithmic Rigor Directive:
- Lay out formal step-by-step mathematical derivations or proofs with clean LaTeX notation ($...$ and $$...$$).
- Clearly state hypotheses, boundary conditions, and intermediate steps.
- For algorithmic complexity, explicitly state Big-O time and space complexity with trade-offs.`;
  } else if (routingIntent === "code") {
    intentDirective = `\n\n# Specialized Software Engineering Directive:
- Deliver production-ready, fully functional code blocks with zero pseudo-code or missing implementations.
- Include clean error handling, type safety, and edge-case handling.
- Specify language identifiers on all code fences.`;
  } else if (routingIntent === "deep_analysis") {
    intentDirective = `\n\n# Specialized Architectural & Systems Analysis Directive:
- Provide exhaustive, doctoral-level architectural depth and trade-off evaluations.
- Methodically explore scalability bottlenecks, consensus protocols, failure modes, and security vectors.`;
  } else if (routingIntent === "quick_lookup") {
    intentDirective = `\n\n# Specialized Rapid High-Signal Directive:
- Deliver an immediate, crisp, high-accuracy factual answer without unnecessary verbosity or filler phrases.`;
  }

  const systemPrompt = `You are Lemur AI, an advanced, deeply knowledgeable, and authentic AI assistant.

# Core Directives for Comprehensive, Accurate & Genuine Answers:
1. **Exhaustive & In-Depth Coverage ("Cover Each and Everything")**:
   - Thoroughly address every dimension, requirement, and implicit nuance of the user's question.
   - Do not settle for brief or superficial responses. Fully unpack key concepts, underlying principles, mechanisms, practical considerations, edge cases, and best practices so the user gains complete mastery without needing to ask basic follow-ups.
   - For multi-part or exploratory questions, methodically cover every aspect in dedicated, well-developed sections.

2. **Genuine, Factually Grounded & Truthful**:
   - Every statement must be authentic, verified, and technically accurate. Avoid generic corporate buzzwords, artificial hype, or vague hand-waving.
   - When discussing trade-offs, technologies, or real-world choices, provide honest, balanced, and candid analysis.
   - Never invent facts, APIs, or unverified claims.

3. **High-Signal Structure & Scannable Elegance (Zero Wall-of-Text Fatigue)**:
   - Begin with a crisp, high-impact Executive Summary / Core Takeaway in the first 1–2 sentences so the main answer is instantly evident.
   - Structure the comprehensive explanation using clear Markdown headings (##, ###).
   - Use structured bullet points (- **Key Aspect**: In-depth explanation), numbered workflows, and comparison tables so even a detailed, multi-page answer remains visually comfortable and effortless to read on both mobile and desktop.
   - Keep individual paragraphs readable (typically 2 to 4 sentences) to maintain visual breathing room.

4. **Production-Ready, Complete Solutions**:
   - For code, formulas, configurations, or step-by-step procedures: Provide complete, working, production-grade solutions. Never leave critical logic out with placeholders like "// todo".
   - Include inline comments explaining subtle decisions, and follow up with concise bullet points detailing why the implementation works.
   - Always specify the correct language identifier on code blocks (e.g. \`\`\`typescript, \`\`\`python, \`\`\`bash, \`\`\`sql).

5. **Language**:
   - Always respond naturally in ${targetLanguage}. Maintain all conversation in ${targetLanguage} unless explicitly requested otherwise.

6. **Excel & Workplace Spreadsheet Mastery**:
   - When asked about Microsoft Excel, formulas, data cleaning, lookups, PivotTables, Power Query, or the Job-Ready Excel Handbook, provide exact, verified formulas (e.g., modern XLOOKUP, dynamic arrays =FILTER/=UNIQUE, =SUMIFS with sum_range first, and whole-row conditional formatting rules with locked columns like =$D2="Complete").
   - Always explain how formulas work, detail step-by-step build orders, and provide testing/validation steps.${intentDirective}

At the very end of your response, you MUST append exactly 3 short, insightful follow-up questions for the user inside a <related_questions> block, one per line starting with a dash, like this:
<related_questions>
- Question 1?
- Question 2?
- Question 3?
</related_questions>`;

  const clientGeminiKey = req.headers.get("x-gemini-key")?.trim() || undefined;
  const clientOpenRouterKey = req.headers.get("x-openrouter-key")?.trim() || undefined;
  const geminiKey = clientGeminiKey || process.env.GEMINI_API_KEY;
  const openrouterKey = clientOpenRouterKey || process.env.OPENROUTER_API_KEY;

  if (!geminiKey && !openrouterKey) {
    return NextResponse.json(
      { error: "API Keys are not configured on the server. Please add GEMINI_API_KEY or OPENROUTER_API_KEY." },
      { status: 501 }
    );
  }

  // Set up SSE streaming response
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const sendEvent = async (payload: StreamEventPayload) => {
    try {
      await writer.write(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
    } catch {
      // Client disconnected
    }
  };

  // Asynchronous streaming worker with 6-Tier Bulletproof Resilience
  (async () => {
    let resolvedModelName = isSmartRouted ? `${activeModel.name} (Auto-Routed)` : activeModel.name;
    let fallbackWarning: string | undefined;

    try {
      // Send initial metadata
      await sendEvent({
        type: "meta",
        model: resolvedModelName,
        routedModelKey: activeModelKey,
        isSmartRouted,
      });

      let streamed = false;

      // --- TIER 1: Primary Target Provider ---
      if (activeModel.provider === "openrouter" && openrouterKey) {
        try {
          console.log(`[Lemur AI] Streaming with OpenRouter model: ${activeModel.id}`);
          streamed = await streamOpenRouter(
            messages,
            systemPrompt,
            activeModel.id,
            file,
            openrouterKey,
            sendEvent,
            { temperature: customTemperature }
          );
        } catch (orErr: unknown) {
          const errMsg = orErr instanceof Error ? orErr.message : String(orErr);
          console.warn(`[Lemur AI] OpenRouter model ${activeModel.id} failed: ${errMsg}. Failing over.`);
          fallbackWarning = `Model ${activeModel.name} was busy or rate-limited. Switched to Gemini 3.8 Flash backup.`;
        }
      } else if (activeModel.provider === "google" && geminiKey) {
        try {
          console.log(`[Lemur AI] Streaming with Google Gemini: ${activeModel.id}...`);
          streamed = await streamDirectGemini(
            messages,
            systemPrompt,
            activeModel.id,
            file,
            geminiKey,
            sendEvent,
            {
              temperature: customTemperature,
              thinkingBudget: customThinkingBudget,
            }
          );
        } catch (gemErr: unknown) {
          const errMsg = gemErr instanceof Error ? gemErr.message : String(gemErr);
          console.warn(`[Lemur AI] Primary Gemini ${activeModel.id} failed: ${errMsg}. Triggering fallback.`);
          fallbackWarning = `Primary Google Gemini was busy. Switched to high-capacity backup.`;
        }
      }

      // --- TIER 2: Gemini 3.8 Flash Fallback ---
      if (!streamed && geminiKey) {
        if (fallbackWarning) {
          resolvedModelName = "Gemini 3.8 Flash (Backup)";
          await sendEvent({
            type: "warning",
            warning: fallbackWarning,
            model: resolvedModelName,
          });
        }

        try {
          console.log("[Lemur AI] Streaming with Direct Google Gemini 3.8 Flash fallback...");
          streamed = await streamDirectGemini(
            messages,
            systemPrompt,
            "gemini-3.8-flash",
            file,
            geminiKey,
            sendEvent,
            {
              temperature: customTemperature,
              thinkingBudget: customThinkingBudget,
            }
          );
        } catch (gemErr: unknown) {
          const errMsg = gemErr instanceof Error ? gemErr.message : String(gemErr);
          console.warn(`[Lemur AI] Gemini 3.8 Flash fallback failed: ${errMsg}. Trying Gemini 2.5 Flash.`);
        }
      }

      // --- TIER 3: Gemini 2.5 Flash Fallback ---
      if (!streamed && geminiKey) {
        try {
          console.log("[Lemur AI] Streaming with Gemini 2.5 Flash fallback...");
          streamed = await streamDirectGemini(
            messages,
            systemPrompt,
            "gemini-2.5-flash",
            file,
            geminiKey,
            sendEvent,
            {
              temperature: customTemperature,
              thinkingBudget: customThinkingBudget,
            }
          );
        } catch (g2Err: unknown) {
          console.warn("[Lemur AI] Gemini 2.5 Flash fallback failed:", g2Err);
        }
      }

      // --- TIER 4: Gemini 3.5 Flash Lite (Ultra-speed tertiary) ---
      if (!streamed && geminiKey) {
        try {
          console.log("[Lemur AI] Streaming with Gemini 3.5 Flash Lite fallback...");
          streamed = await streamDirectGemini(
            messages,
            systemPrompt,
            "gemini-3.5-flash-lite",
            file,
            geminiKey,
            sendEvent,
            {
              temperature: customTemperature,
              thinkingBudget: customThinkingBudget,
            }
          );
        } catch (liteErr: unknown) {
          console.warn("[Lemur AI] Gemini 3.5 Flash Lite fallback failed:", liteErr);
        }
      }

      // --- TIER 5: OpenRouter Dynamic Free Auto-Router (openrouter/free) ---
      if (!streamed && openrouterKey) {
        const fallbackId = "openrouter/free";
        console.log(`[Lemur AI] Attempting fallback to OpenRouter Dynamic Free: ${fallbackId}`);
        try {
          streamed = await streamOpenRouter(
            messages,
            systemPrompt,
            fallbackId,
            file,
            openrouterKey,
            sendEvent,
            { temperature: customTemperature }
          );
        } catch (orFreeErr: unknown) {
          console.warn("[Lemur AI] OpenRouter dynamic free fallback failed:", orFreeErr);
        }
      }

      // --- TIER 6: OpenRouter 1M Context Free Model (Nemotron 3.5 Lightning) ---
      if (!streamed && openrouterKey) {
        const fallbackId = "nvidia/nemotron-3.5-lightning:free";
        console.log(`[Lemur AI] Attempting ultimate fallback to OpenRouter Nemotron: ${fallbackId}`);
        try {
          streamed = await streamOpenRouter(
            messages,
            systemPrompt,
            fallbackId,
            file,
            openrouterKey,
            sendEvent,
            { temperature: customTemperature }
          );
        } catch (ultimateErr: unknown) {
          console.error("[Lemur AI] Ultimate fallback failed:", ultimateErr);
        }
      }

      if (!streamed) {
        await sendEvent({
          type: "error",
          error: "All AI model providers are temporarily busy or rate-limited. Please retry in a few moments.",
        });
      } else {
        await sendEvent({ type: "done" });
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      console.error("[Lemur AI] Streaming error:", errMsg);
      await sendEvent({
        type: "error",
        error: errMsg,
      });
    } finally {
      try {
        await writer.close();
      } catch {}
    }
  })();

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

// Direct Google Gemini SSE Streaming Handler
async function streamDirectGemini(
  messages: ChatMessagePayload[],
  systemPrompt: string,
  modelName: string,
  file: AttachedFilePayload | null | undefined,
  apiKey: string,
  sendEvent: (payload: StreamEventPayload) => Promise<void>,
  options?: {
    temperature?: number;
    thinkingBudget?: number;
  }
): Promise<boolean> {
  // Format contents for Gemini:
  // 1. Only 'user' and 'model' roles allowed
  // 2. Ensure non-empty text parts
  // 3. Alternate turns between 'user' and 'model' (merge adjacent same-role messages)
  const rawContents: GeminiContent[] = [];
  for (const msg of messages) {
    if (msg.role === "system") continue;
    const role: "user" | "model" = msg.role === "assistant" ? "model" : "user";
    const text = (msg.content || "").trim();
    if (!text) continue;
    rawContents.push({
      role,
      parts: [{ text }],
    });
  }

  // Merge consecutive same-role turns into a single turn to satisfy Gemini alternation rule
  const contents: GeminiContent[] = [];
  for (const c of rawContents) {
    if (contents.length > 0 && contents[contents.length - 1].role === c.role) {
      const prevParts = contents[contents.length - 1].parts;
      prevParts[0].text = `${prevParts[0].text}\n\n${c.parts[0].text}`;
    } else {
      contents.push({ role: c.role, parts: [{ text: c.parts[0].text }] });
    }
  }

  // Ensure conversation always starts with a user turn (Gemini requirement)
  while (contents.length > 0 && contents[0].role !== "user") {
    contents.shift();
  }

  if (contents.length === 0) {
    contents.push({ role: "user", parts: [{ text: "Hello" }] });
  }

  // Multimodal file support (vision + documents)
  if (file && file.data && file.type) {
    const lastContent = contents[contents.length - 1];
    if (lastContent && lastContent.role === "user") {
      const base64Data = file.data.split(",")[1] || file.data;
      lastContent.parts.unshift({
        inlineData: {
          mimeType: file.type,
          data: base64Data,
        },
      });
    }
  }

  const isFlashModel = modelName.includes("flash") || modelName.includes("2.5");
  const defaultBudget = isFlashModel ? 2048 : 0;
  const thinkingBudget = options?.thinkingBudget !== undefined ? options.thinkingBudget : defaultBudget;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${apiKey}`;
  const payload = {
    contents,
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    generationConfig: {
      temperature: options?.temperature ?? 0.45,
      maxOutputTokens: 8192,
      ...(thinkingBudget > 0 ? { thinkingConfig: { thinkingBudget } } : {}),
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
    ],
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Direct Gemini API failed (${res.status}): ${errText}`);
  }

  if (!res.body) return false;

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let tokensStreamed = 0;
  let inReasoning = false;

  const processCandidates = async (candidates: Array<{ content?: { parts?: Array<{ text?: string; thought?: boolean }> } }>) => {
    for (const cand of candidates || []) {
      for (const part of cand.content?.parts || []) {
        if (!part.text) continue;
        if (part.thought) {
          if (!inReasoning) {
            inReasoning = true;
            await sendEvent({ type: "chunk", text: "<think>\n" });
          }
          await sendEvent({ type: "chunk", text: part.text });
          tokensStreamed++;
        } else {
          if (inReasoning) {
            inReasoning = false;
            await sendEvent({ type: "chunk", text: "\n</think>\n\n" });
          }
          await sendEvent({ type: "chunk", text: part.text });
          tokensStreamed++;
        }
      }
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;

      const dataStr = trimmed.slice(6).trim();
      if (!dataStr || dataStr === "[DONE]") continue;

      try {
        const parsed = JSON.parse(dataStr);
        if (parsed.candidates) {
          await processCandidates(parsed.candidates);
        }
      } catch {
        // Skip unparseable lines
      }
    }
  }

  if (buffer.startsWith("data: ")) {
    try {
      const parsed = JSON.parse(buffer.slice(6).trim());
      if (parsed.candidates) {
        await processCandidates(parsed.candidates);
      }
    } catch {}
  }

  if (inReasoning) {
    await sendEvent({ type: "chunk", text: "\n</think>\n\n" });
  }

  return tokensStreamed > 0;
}

// OpenRouter SSE Streaming Handler with delta.reasoning support & Heartbeat Pings
async function streamOpenRouter(
  messages: ChatMessagePayload[],
  systemPrompt: string,
  modelId: string,
  file: AttachedFilePayload | null | undefined,
  apiKey: string,
  sendEvent: (payload: StreamEventPayload) => Promise<void>,
  options?: {
    temperature?: number;
  }
): Promise<boolean> {
  const validMessages = messages
    .filter((m) => (m.content || "").trim().length > 0)
    .map((m) => ({ role: m.role, content: m.content.trim() }));

  const openrouterMessages: Array<{
    role: string;
    content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  }> = [
    { role: "system", content: systemPrompt },
    ...validMessages,
  ];

  if (file && file.data && file.type) {
    const lastMsg = openrouterMessages[openrouterMessages.length - 1];
    if (file.type.startsWith("image/")) {
      lastMsg.content = [
        { type: "text", text: typeof lastMsg.content === "string" ? lastMsg.content : "" },
        {
          type: "image_url",
          image_url: { url: file.data },
        },
      ];
    } else {
      const rawText = file.content || "";
      lastMsg.content = `[File attached: ${file.name}]\n\`\`\`\n${rawText}\n\`\`\`\n\n${lastMsg.content}`;
    }
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://lemursai.netlify.app",
      "X-Title": "Lemur AI",
    },
    body: JSON.stringify({
      model: modelId,
      messages: openrouterMessages,
      temperature: options?.temperature ?? 0.45,
      stream: true,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter failed (${res.status}): ${errText}`);
  }

  if (!res.body) return false;

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let tokensStreamed = 0;
  let inReasoning = false;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // OpenRouter keeps sending ": OPENROUTER PROCESSING" comments while in queue
      if (trimmed.startsWith(":")) {
        await sendEvent({ type: "ping" });
        continue;
      }

      if (!trimmed.startsWith("data: ")) continue;

      const dataStr = trimmed.slice(6).trim();
      if (dataStr === "[DONE]") continue;

      try {
        const parsed = JSON.parse(dataStr);

        // Detect upstream error payload
        if (parsed.error) {
          throw new Error(parsed.error.message || "OpenRouter provider error");
        }

        const choice = parsed.choices?.[0];
        const delta = choice?.delta;

        // 1. Capture Reasoning tokens (Nemotron reasoning, DeepSeek, etc.)
        const reasoningChunk = delta?.reasoning || delta?.thinking;
        if (reasoningChunk) {
          if (!inReasoning) {
            inReasoning = true;
            await sendEvent({ type: "chunk", text: "<think>\n" });
          }
          await sendEvent({ type: "chunk", text: reasoningChunk });
          tokensStreamed++;
        }

        // 2. Capture Content tokens
        const contentChunk = delta?.content;
        if (contentChunk) {
          if (inReasoning) {
            inReasoning = false;
            await sendEvent({ type: "chunk", text: "\n</think>\n\n" });
          }
          await sendEvent({ type: "chunk", text: contentChunk });
          tokensStreamed++;
        }
      } catch (e: unknown) {
        // If error occurred before any tokens were streamed, rethrow to trigger failover
        if (tokensStreamed === 0) {
          throw e;
        }
      }
    }
  }

  // Ensure unclosed reasoning tag is gracefully closed
  if (inReasoning) {
    await sendEvent({ type: "chunk", text: "\n</think>\n\n" });
  }

  return tokensStreamed > 0;
}
