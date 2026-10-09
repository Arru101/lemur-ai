import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300; // 5-minute timeout for extensive long-answer generation
export const dynamic = "force-dynamic";

// In-memory rate limiting token bucket with per-client isolation
const rateLimitMap = new Map<string, { tokens: number; lastRefill: number }>();
const LIMIT_TOKENS = 60; // 60 requests per bucket burst
const REFILL_RATE = 2000; // Refill 1 token every 2 seconds (~30 requests per minute sustained per client)

function checkRateLimit(clientKey: string): boolean {
  const now = Date.now();

  // Periodically sweep stale entries (older than 10 minutes) to prevent memory leak
  if (rateLimitMap.size > 500) {
    const cutoff = now - 10 * 60 * 1000;
    for (const [key, val] of rateLimitMap.entries()) {
      if (val.lastRefill < cutoff) rateLimitMap.delete(key);
    }
  }

  if (!rateLimitMap.has(clientKey)) {
    rateLimitMap.set(clientKey, { tokens: LIMIT_TOKENS - 1, lastRefill: now });
    return true;
  }

  const record = rateLimitMap.get(clientKey)!;
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

export interface ModelInfo {
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
    name: "Gemini 2.5 Flash",
    provider: "google",
    id: "gemini-2.5-flash",
    description: "Google flagship, vision, multimodal & deep reasoning",
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
  "nemotron-super": {
    name: "Nemotron 3 Super 120B (Free)",
    provider: "openrouter",
    id: "nvidia/nemotron-3-super-120b-a12b:free",
    openrouterId: "nvidia/nemotron-3-super-120b-a12b:free",
    description: "120B high-precision code & logic synthesis engine",
  },
  "dots-note": {
    name: "Dots 3 Note 512K (Free)",
    provider: "openrouter",
    id: "dots-studio/dots-3-note-preview:free",
    openrouterId: "dots-studio/dots-3-note-preview:free",
    description: "512K massive context research & literature synthesis",
  },
  "openrouter-free": {
    name: "OpenRouter Dynamic (Free)",
    provider: "openrouter",
    id: "openrouter/free",
    openrouterId: "openrouter/free",
    description: "Auto-routes dynamically across live healthy free models",
  },
};

// Legacy model ID mapping for stored conversations
const MODEL_ALIASES: Record<string, keyof typeof MODELS> = {
  "cohere-code": "nemotron-super",
  "gemma-31b": "dots-note",
};

// Verified Google Gemini Pool with independent per-model quotas & active cooldowns
interface GeminiPoolEntry {
  id: string;
  name: string;
  isMultimodal: boolean;
  cooldownUntil: number;
}

const GEMINI_POOL: GeminiPoolEntry[] = [
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", isMultimodal: true, cooldownUntil: 0 },
  { id: "gemini-3.5-flash-lite", name: "Gemini 3.5 Flash Lite", isMultimodal: false, cooldownUntil: 0 },
  { id: "gemini-flash-lite-latest", name: "Gemini Flash-Lite Latest", isMultimodal: true, cooldownUntil: 0 },
  { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash", isMultimodal: true, cooldownUntil: 0 },
  { id: "gemini-3.7-flash", name: "Gemini 3.7 Flash", isMultimodal: true, cooldownUntil: 0 },
];

let geminiPoolCounter = 0;

function markGeminiCooldown(modelId: string) {
  const entry = GEMINI_POOL.find((m) => m.id === modelId);
  if (entry) {
    // 60-second cooldown on rate-limit/overload
    entry.cooldownUntil = Date.now() + 60000;
  }
}

function getGeminiCandidates(preferredId?: string, requiresMultimodal = false): GeminiPoolEntry[] {
  const now = Date.now();
  // Filter models that support multimodal if needed
  const eligible = GEMINI_POOL.filter((m) => {
    if (requiresMultimodal && !m.isMultimodal) return false;
    return true;
  });

  // Separate non-cooling from cooling
  const ready = eligible.filter((m) => m.cooldownUntil <= now);
  const cooling = eligible.filter((m) => m.cooldownUntil > now);

  const candidates: GeminiPoolEntry[] = [];

  // If preferred model is ready, put it first
  if (preferredId) {
    const pref = ready.find((m) => m.id === preferredId);
    if (pref) candidates.push(pref);
  }

  // Load balance across the remaining ready models using round-robin offset
  const remainingReady = ready.filter((m) => !candidates.some((c) => c.id === m.id));
  if (remainingReady.length > 0) {
    const offset = (geminiPoolCounter++) % remainingReady.length;
    const rotated = [
      ...remainingReady.slice(offset),
      ...remainingReady.slice(0, offset),
    ];
    candidates.push(...rotated);
  }

  // If all are cooling down, still include them in case cooldown passed
  for (const c of cooling) {
    if (!candidates.some((x) => x.id === c.id)) {
      candidates.push(c);
    }
  }

  return candidates;
}

// Verified OpenRouter Free Fallback Pool
const OPENROUTER_FALLBACK_POOL = [
  { id: "openrouter/free", name: "OpenRouter Free" },
  { id: "nvidia/nemotron-3.5-lightning:free", name: "Nemotron 3.5 Lightning" },
  { id: "nvidia/nemotron-3-super-120b-a12b:free", name: "Nemotron 3 Super 120B" },
  { id: "nvidia/nemotron-3-ultra-550b-a55b:free", name: "Nemotron 3 Ultra 550B" },
  { id: "dots-studio/dots-3-note-preview:free", name: "Dots 3 Note 512K" },
];

interface SmartRoutingProfile {
  modelKey: keyof typeof MODELS;
  intent: "spreadsheet" | "math_logic" | "code" | "deep_analysis" | "creative" | "quick_lookup" | "general";
  temperature: number;
  thinkingBudget: number;
  reason: string;
}

function classifyQuery(query: string, file?: AttachedFilePayload | null): SmartRoutingProfile {
  // 1. Multimodal Vision Routing
  // If an image or document is attached, Gemini 2.5 Flash provides native multimodal vision & document processing
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
      modelKey: "nemotron-super",
      intent: "code",
      temperature: 0.25,
      thinkingBudget: 2560,
      reason: "Nvidia 120B Specialized Code Engine",
    };
  }

  // 6. Long Creative Writing, Essays, Literary Synthesis & Multilingual Depth
  const creativeSynthesisRegex = /\b(essay|story|poem|poetry|novel|screenplay|script|narrative|creative writing|fiction|biography|memoir|speech|editorial|blog post|copywriting|paraphrase|metaphor|rhyme|dialogue|playwright|lyrics|chapter|prose|critique|literary analysis)\b/i;
  const hasNonLatinScript = /[\u0600-\u06FF\u0900-\u097F\u0980-\u09FF\u0B80-\u0BFF\u0C00-\u0C7F\u4E00-\u9FFF\u3040-\u30FF]/.test(clean);
  if (creativeSynthesisRegex.test(q) || (hasNonLatinScript && clean.length > 70)) {
    return {
      modelKey: "dots-note",
      intent: "creative",
      temperature: 0.65,
      thinkingBudget: 1536,
      reason: "Dots 3 Note 512K Literary & Research Synthesis",
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
    reason: "Google Gemini 2.5 Flash Frontier Multimodal",
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
  type: "meta" | "chunk" | "warning" | "error" | "done" | "ping" | "truncated";
  model?: string;
  routedModelKey?: string;
  isSmartRouted?: boolean;
  text?: string;
  warning?: string;
  error?: string;
  reason?: string;
}

export async function POST(req: NextRequest) {
  // 1. Client-Isolated Rate Limiting (Permits concurrent users behind shared IPs/NATs)
  const clientId = req.headers.get("x-client-id")?.trim() || "";
  const rawIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
  const ip = rawIp.split(",")[0].trim() || "127.0.0.1";
  const clientKey = clientId ? `${ip}:${clientId}` : ip;

  if (!checkRateLimit(clientKey)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a few moments before sending another message." },
      { status: 429, headers: { "Retry-After": "2" } }
    );
  }

  // 2. Parse Request
  let body: RequestPayload;
  try {
    body = (await req.json()) as RequestPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  const { messages, model: rawSelectedModelId, language, file } = body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Messages array is required." }, { status: 400 });
  }

  // Resolve legacy model aliases
  let selectedModelId = rawSelectedModelId;
  if (selectedModelId && selectedModelId in MODEL_ALIASES) {
    selectedModelId = MODEL_ALIASES[selectedModelId];
  }

  // Defensive Request Size & Payload Guardrails
  if (messages.length > 60) {
    return NextResponse.json({ error: "Conversation history exceeds the 60-message limit." }, { status: 400 });
  }
  const totalChars = messages.reduce((acc, m) => acc + (m.content?.length || 0), 0);
  if (totalChars > 120000) {
    return NextResponse.json({ error: "Total conversation text exceeds maximum allowed size (120KB)." }, { status: 413 });
  }
  if (file && file.data && file.data.length > 10000000) {
    return NextResponse.json({ error: "Uploaded file payload exceeds maximum allowed size (7.5MB)." }, { status: 413 });
  }

  const lastMessage = messages[messages.length - 1];
  const userPrompt = lastMessage?.content?.trim() || (file ? "Please examine and provide a thorough, accurate analysis of this attached file." : "");

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

  // Active 3-second heartbeat ping to prevent connection timeout across Netlify, proxies, and cellular data
  const heartbeatTimer = setInterval(async () => {
    try {
      await sendEvent({ type: "ping" });
    } catch {
      clearInterval(heartbeatTimer);
    }
  }, 3000);

  // Asynchronous streaming worker with High-Concurrency Pool & Instant Seamless Failover
  (async () => {
    const initialModelName = isSmartRouted ? `${activeModel.name} (Auto-Routed)` : activeModel.name;

    try {
      // Send initial metadata
      await sendEvent({
        type: "meta",
        model: initialModelName,
        routedModelKey: activeModelKey,
        isSmartRouted,
      });

      let streamed = false;

      // --- PRIMARY PROVIDER EXECUTION WITH CONCURRENT POOLING ---
      if (activeModel.provider === "google") {
        if (geminiKey) {
          const candidates = getGeminiCandidates(activeModel.id, !!file);

          for (const candidate of candidates) {
            try {
              console.log(`[Lemur AI] Streaming with Google Gemini candidate: ${candidate.id}...`);
              streamed = await streamDirectGemini(
                messages,
                systemPrompt,
                candidate.id,
                file,
                geminiKey,
                sendEvent,
                {
                  temperature: customTemperature,
                  thinkingBudget: customThinkingBudget,
                  onTokenStart: async () => {
                    const resolvedName = isSmartRouted ? `${candidate.name} (Auto-Routed)` : candidate.name;
                    await sendEvent({ type: "meta", model: resolvedName });
                  },
                }
              );

              if (streamed) break;
            } catch (gemErr: unknown) {
              const errMsg = gemErr instanceof Error ? gemErr.message : String(gemErr);
              console.warn(`[Lemur AI] Gemini [${candidate.id}] failed: ${errMsg}. Cooling down and failing over instantly.`);
              markGeminiCooldown(candidate.id);
            }
          }
        }

        // Fallback to OpenRouter free pool if Google Gemini endpoints are exhausted
        if (!streamed && openrouterKey) {
          console.warn("[Lemur AI] Google Gemini endpoints busy. Failing over to OpenRouter Free pool.");
          for (const orCandidate of OPENROUTER_FALLBACK_POOL) {
            try {
              console.log(`[Lemur AI] Streaming with OpenRouter fallback: ${orCandidate.id}...`);
              streamed = await streamOpenRouter(
                messages,
                systemPrompt,
                orCandidate.id,
                file,
                openrouterKey,
                sendEvent,
                {
                  temperature: customTemperature,
                  onTokenStart: async () => {
                    await sendEvent({ type: "meta", model: `${orCandidate.name} (Backup)` });
                  },
                }
              );
              if (streamed) break;
            } catch {
              console.warn(`[Lemur AI] OpenRouter candidate [${orCandidate.id}] failed. Trying next.`);
            }
          }
        }
      } else if (activeModel.provider === "openrouter") {
        // Target model is OpenRouter
        if (openrouterKey) {
          try {
            console.log(`[Lemur AI] Streaming with OpenRouter model: ${activeModel.id}...`);
            streamed = await streamOpenRouter(
              messages,
              systemPrompt,
              activeModel.id,
              file,
              openrouterKey,
              sendEvent,
              {
                temperature: customTemperature,
                onTokenStart: async () => {
                  await sendEvent({ type: "meta", model: activeModel.name });
                },
              }
            );
          } catch {
            console.warn(`[Lemur AI] Primary OpenRouter [${activeModel.id}] failed. Trying alternate free models.`);
          }
        }

        // Try other verified free models on OpenRouter
        if (!streamed && openrouterKey) {
          for (const orCandidate of OPENROUTER_FALLBACK_POOL) {
            if (orCandidate.id === activeModel.id) continue;
            try {
              console.log(`[Lemur AI] Streaming with OpenRouter fallback: ${orCandidate.id}...`);
              streamed = await streamOpenRouter(
                messages,
                systemPrompt,
                orCandidate.id,
                file,
                openrouterKey,
                sendEvent,
                {
                  temperature: customTemperature,
                  onTokenStart: async () => {
                    await sendEvent({ type: "meta", model: `${orCandidate.name} (Backup)` });
                  },
                }
              );
              if (streamed) break;
            } catch {}
          }
        }

        // Fallback to Google Gemini pool if OpenRouter is exhausted
        if (!streamed && geminiKey) {
          console.warn("[Lemur AI] OpenRouter exhausted. Failing over to Google Gemini pool.");
          const candidates = getGeminiCandidates("gemini-2.5-flash", !!file);
          for (const candidate of candidates) {
            try {
              console.log(`[Lemur AI] Streaming with Gemini fallback: ${candidate.id}...`);
              streamed = await streamDirectGemini(
                messages,
                systemPrompt,
                candidate.id,
                file,
                geminiKey,
                sendEvent,
                {
                  temperature: customTemperature,
                  thinkingBudget: customThinkingBudget,
                  onTokenStart: async () => {
                    await sendEvent({ type: "meta", model: `${candidate.name} (Backup)` });
                  },
                }
              );
              if (streamed) break;
            } catch {
              markGeminiCooldown(candidate.id);
            }
          }
        }
      }

      if (!streamed) {
        await sendEvent({
          type: "error",
          error: "All AI model providers are momentarily busy. Please retry your message.",
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
      clearInterval(heartbeatTimer);
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

// Direct Google Gemini SSE Streaming Handler with Fast Timeout & Smart Auto-Continuation
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
    onTokenStart?: () => Promise<void>;
  }
): Promise<boolean> {
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

  // Ensure conversation always starts with a user turn
  while (contents.length > 0 && contents[0].role !== "user") {
    contents.shift();
  }

  if (contents.length === 0) {
    contents.push({
      role: "user",
      parts: [{ text: file ? "Please examine and provide a thorough, accurate analysis of this attached file." : "Hello" }],
    });
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

  let totalTokensStreamed = 0;
  let tokenStartNotified = false;
  let inReasoning = false;
  let continuationPass = 0;
  const MAX_CONTINUATION_PASSES = 2; // Up to 3 total passes = ~24,576 output tokens!

  while (continuationPass <= MAX_CONTINUATION_PASSES) {
    const payload: {
      contents: GeminiContent[];
      systemInstruction: { parts: [{ text: string }] };
      generationConfig: {
        temperature: number;
        maxOutputTokens: number;
        thinkingConfig?: { thinkingBudget: number };
      };
      safetySettings: Array<{ category: string; threshold: string }>;
    } = {
      contents,
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      generationConfig: {
        temperature: options?.temperature ?? 0.45,
        maxOutputTokens: 8192,
        ...(continuationPass === 0 && thinkingBudget > 0 ? { thinkingConfig: { thinkingBudget } } : {}),
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
      ],
    };

    const abortCtrl = new AbortController();
    let connectTimer: NodeJS.Timeout | null = setTimeout(() => {
      abortCtrl.abort(new Error(`Timeout waiting for initial response from ${modelName}`));
    }, 10000);

    let res: Response;
    try {
      res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: abortCtrl.signal,
      });
    } catch (fetchErr) {
      if (connectTimer) clearTimeout(connectTimer);
      if (totalTokensStreamed === 0) throw fetchErr;
      console.warn(`[Lemur AI] Gemini stream cut off during pass ${continuationPass}:`, fetchErr);
      await sendEvent({ type: "truncated", reason: "stream_interrupted" });
      return true;
    }

    if (!res.ok) {
      if (connectTimer) clearTimeout(connectTimer);
      if (totalTokensStreamed === 0) {
        const errText = await res.text();
        throw new Error(`Direct Gemini API failed (${res.status}): ${errText}`);
      }
      await sendEvent({ type: "truncated", reason: "provider_error" });
      return true;
    }

    if (!res.body) {
      if (connectTimer) clearTimeout(connectTimer);
      return totalTokensStreamed > 0;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let passOutputText = "";
    let lastFinishReason: string | null = null;

    const processCandidates = async (
      candidates: Array<{
        content?: { parts?: Array<{ text?: string; thought?: boolean }> };
        finishReason?: string;
      }>
    ) => {
      for (const cand of candidates || []) {
        if (cand.finishReason) {
          lastFinishReason = cand.finishReason;
        }

        for (const part of cand.content?.parts || []) {
          if (!part.text) continue;

          if (connectTimer) {
            clearTimeout(connectTimer);
            connectTimer = null;
          }

          if (!tokenStartNotified && options?.onTokenStart) {
            tokenStartNotified = true;
            await options.onTokenStart();
          }

          if (part.thought) {
            if (!inReasoning) {
              inReasoning = true;
              await sendEvent({ type: "chunk", text: "<think>\n" });
            }
            await sendEvent({ type: "chunk", text: part.text });
            totalTokensStreamed++;
          } else {
            if (inReasoning) {
              inReasoning = false;
              await sendEvent({ type: "chunk", text: "\n</think>\n\n" });
            }
            await sendEvent({ type: "chunk", text: part.text });
            passOutputText += part.text;
            totalTokensStreamed++;
          }
        }
      }
    };

    try {
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
        inReasoning = false;
        await sendEvent({ type: "chunk", text: "\n</think>\n\n" });
      }
    } catch (readErr) {
      if (totalTokensStreamed === 0) throw readErr;
      console.warn(`[Lemur AI] Gemini stream read interrupted:`, readErr);
      await sendEvent({ type: "truncated", reason: "stream_interrupted" });
      return true;
    } finally {
      if (connectTimer) clearTimeout(connectTimer);
    }

    // Check if Gemini hit token ceiling and needs auto-continuation
    if (lastFinishReason === "MAX_TOKENS" && continuationPass < MAX_CONTINUATION_PASSES && passOutputText.length > 0) {
      console.log(`[Lemur AI] Gemini reached MAX_TOKENS on pass ${continuationPass + 1}. Auto-continuing response seamlessly...`);
      continuationPass++;
      contents.push({ role: "model", parts: [{ text: passOutputText }] });
      contents.push({
        role: "user",
        parts: [{ text: "Please continue writing seamlessly from exactly where you left off. Do not repeat any words, phrases, or code already written. Continue immediately with the next part of the answer." }],
      });
      continue;
    }

    if (lastFinishReason === "MAX_TOKENS" && continuationPass >= MAX_CONTINUATION_PASSES) {
      console.log(`[Lemur AI] Gemini reached max continuation passes. Marking truncated.`);
      await sendEvent({ type: "truncated", reason: "max_tokens" });
      break;
    }

    // Normal termination (e.g. STOP)
    break;
  }

  return totalTokensStreamed > 0;
}

// OpenRouter SSE Streaming Handler with Fast Timeout, Heartbeat Pings & Smart Auto-Continuation
async function streamOpenRouter(
  messages: ChatMessagePayload[],
  systemPrompt: string,
  modelId: string,
  file: AttachedFilePayload | null | undefined,
  apiKey: string,
  sendEvent: (payload: StreamEventPayload) => Promise<void>,
  options?: {
    temperature?: number;
    onTokenStart?: () => Promise<void>;
  }
): Promise<boolean> {
  const validMessages = messages
    .filter((m) => (m.content || "").trim().length > 0)
    .map((m) => ({ role: m.role, content: m.content.trim() }));

  if (validMessages.length === 0) {
    validMessages.push({
      role: "user",
      content: file ? "Please examine and provide a thorough, accurate analysis of this attached file." : "Hello",
    });
  }

  const openrouterMessages: Array<{
    role: string;
    content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  }> = [
    { role: "system", content: systemPrompt },
    ...validMessages,
  ];

  if (file && file.data && file.type) {
    let lastMsg = openrouterMessages[openrouterMessages.length - 1];
    if (lastMsg.role !== "user") {
      openrouterMessages.push({
        role: "user",
        content: "Please examine and provide a thorough, accurate analysis of this attached file.",
      });
      lastMsg = openrouterMessages[openrouterMessages.length - 1];
    }

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

  let totalTokensStreamed = 0;
  let tokenStartNotified = false;
  let inReasoning = false;
  let continuationPass = 0;
  const MAX_CONTINUATION_PASSES = 2;

  while (continuationPass <= MAX_CONTINUATION_PASSES) {
    const abortCtrl = new AbortController();
    let connectTimer: NodeJS.Timeout | null = setTimeout(() => {
      abortCtrl.abort(new Error(`Timeout waiting for initial response from OpenRouter ${modelId}`));
    }, 10000);

    let res: Response;
    try {
      res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://lemursai.netlify.app",
          "X-Title": "Lemur AI",
        },
        signal: abortCtrl.signal,
        body: JSON.stringify({
          model: modelId,
          messages: openrouterMessages,
          temperature: options?.temperature ?? 0.45,
          max_tokens: 8192,
          stream: true,
        }),
      });
    } catch (fetchErr) {
      if (connectTimer) clearTimeout(connectTimer);
      if (totalTokensStreamed === 0) throw fetchErr;
      console.warn(`[Lemur AI] OpenRouter stream cut off during pass ${continuationPass}:`, fetchErr);
      await sendEvent({ type: "truncated", reason: "stream_interrupted" });
      return true;
    }

    if (!res.ok) {
      if (connectTimer) clearTimeout(connectTimer);
      if (totalTokensStreamed === 0) {
        const errText = await res.text();
        throw new Error(`OpenRouter failed (${res.status}): ${errText}`);
      }
      await sendEvent({ type: "truncated", reason: "provider_error" });
      return true;
    }

    if (!res.body) {
      if (connectTimer) clearTimeout(connectTimer);
      return totalTokensStreamed > 0;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let passOutputText = "";
    let lastFinishReason: string | null = null;

    try {
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

            if (parsed.error) {
              throw new Error(parsed.error.message || "OpenRouter provider error");
            }

            const choice = parsed.choices?.[0];
            if (choice?.finish_reason) {
              lastFinishReason = choice.finish_reason;
            }

            const delta = choice?.delta;

            // 1. Capture Reasoning tokens
            const reasoningChunk = delta?.reasoning || delta?.thinking;
            if (reasoningChunk) {
              if (connectTimer) {
                clearTimeout(connectTimer);
                connectTimer = null;
              }
              if (!tokenStartNotified && options?.onTokenStart) {
                tokenStartNotified = true;
                await options.onTokenStart();
              }
              if (!inReasoning) {
                inReasoning = true;
                await sendEvent({ type: "chunk", text: "<think>\n" });
              }
              await sendEvent({ type: "chunk", text: reasoningChunk });
              totalTokensStreamed++;
            }

            // 2. Capture Content tokens
            const contentChunk = delta?.content;
            if (contentChunk) {
              if (connectTimer) {
                clearTimeout(connectTimer);
                connectTimer = null;
              }
              if (!tokenStartNotified && options?.onTokenStart) {
                tokenStartNotified = true;
                await options.onTokenStart();
              }
              if (inReasoning) {
                inReasoning = false;
                await sendEvent({ type: "chunk", text: "\n</think>\n\n" });
              }
              await sendEvent({ type: "chunk", text: contentChunk });
              passOutputText += contentChunk;
              totalTokensStreamed++;
            }
          } catch (e: unknown) {
            if (totalTokensStreamed === 0) {
              throw e;
            }
          }
        }
      }

      if (inReasoning) {
        inReasoning = false;
        await sendEvent({ type: "chunk", text: "\n</think>\n\n" });
      }
    } catch (readErr) {
      if (totalTokensStreamed === 0) throw readErr;
      console.warn(`[Lemur AI] OpenRouter read interrupted:`, readErr);
      await sendEvent({ type: "truncated", reason: "stream_interrupted" });
      return true;
    } finally {
      if (connectTimer) clearTimeout(connectTimer);
    }

    // Check if OpenRouter hit length limit and needs auto-continuation
    if (lastFinishReason === "length" && continuationPass < MAX_CONTINUATION_PASSES && passOutputText.length > 0) {
      console.log(`[Lemur AI] OpenRouter reached length limit on pass ${continuationPass + 1}. Auto-continuing response seamlessly...`);
      continuationPass++;
      openrouterMessages.push({ role: "assistant", content: passOutputText });
      openrouterMessages.push({
        role: "user",
        content: "Please continue writing seamlessly from exactly where you left off. Do not repeat any words, phrases, or code already written. Continue immediately with the next part of the answer.",
      });
      continue;
    }

    if (lastFinishReason === "length" && continuationPass >= MAX_CONTINUATION_PASSES) {
      console.log(`[Lemur AI] OpenRouter reached max continuation passes. Marking truncated.`);
      await sendEvent({ type: "truncated", reason: "max_tokens" });
      break;
    }

    break;
  }

  return totalTokensStreamed > 0;
}
