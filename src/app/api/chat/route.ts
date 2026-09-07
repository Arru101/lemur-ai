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
    name: "Gemini 2.5 Flash",
    provider: "google",
    id: "gemini-2.5-flash",
    description: "Ultra-fast Google SOTA, vision, multimodal & high accuracy",
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
  "minimax-m3": {
    name: "MiniMax M3 (Free)",
    provider: "openrouter",
    id: "minimax/minimax-m3:free",
    openrouterId: "minimax/minimax-m3:free",
    description: "1M tokens context, exceptional multilingual & long essays",
  },
  "gemma-26b": {
    name: "Gemma 4 26B (Free)",
    provider: "openrouter",
    id: "google/gemma-4-26b-a4b-it:free",
    openrouterId: "google/gemma-4-26b-a4b-it:free",
    description: "Google's latest open instruction-following model",
  },
  "nemotron-ultra": {
    name: "Nemotron 3 Ultra 550B (Free)",
    provider: "openrouter",
    id: "nvidia/nemotron-3-ultra-550b-a55b:free",
    openrouterId: "nvidia/nemotron-3-ultra-550b-a55b:free",
    description: "Massive 550B parameters for deep synthesis & analysis",
  },
};

function classifyQuery(query: string): keyof typeof MODELS {
  const q = query.toLowerCase();

  const reasoningKeywords = [
    "solve", "calculate", "prove", "math", "equation", "theorem", "physics",
    "algorithm", "complexity", "r1", "reasoning", "step-by-step", "logic puzzle",
    "philosophical", "architectural choice", "performance bottleneck", "derivation",
    "big o", "dynamic programming", "graph theory"
  ];

  const synthesisKeywords = [
    "essay", "write a story", "article", "report", "summary", "translate",
    "comprehensive guide", "exhaustive", "book", "chapters", "narrative",
    "in-depth analysis", "long guide"
  ];

  const reasoningMatches = reasoningKeywords.filter((k) => q.includes(k)).length;
  const synthesisMatches = synthesisKeywords.filter((k) => q.includes(k)).length;

  if (reasoningMatches > 0 && reasoningMatches >= synthesisMatches) {
    return "nemotron-lightning";
  }
  if (synthesisMatches > 0 && synthesisMatches > reasoningMatches) {
    return "minimax-m3";
  }

  return "gemini-flash";
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

  if (selectedModelId === "smart-router") {
    activeModelKey = classifyQuery(userPrompt);
    isSmartRouted = true;
  } else if (selectedModelId && selectedModelId in MODELS) {
    activeModelKey = selectedModelId as keyof typeof MODELS;
  }

  const activeModel = MODELS[activeModelKey];
  const targetLanguage = LANGUAGE_MAP[language || "en"] || "English";

  const systemPrompt = `You are Lemur AI, an advanced, highly intelligent AI chat assistant.
Provide clear, authoritative, highly accurate, and comprehensively structured answers.
Format your responses using clean GitHub-flavored markdown:
- Use bolding, bullet points, numbered steps, and tables where helpful.
- For code snippets, always specify the correct language identifier in code blocks (e.g. \`\`\`typescript, \`\`\`python, \`\`\`rust).
- Always respond in ${targetLanguage}. Maintain all conversation in ${targetLanguage} unless specifically requested otherwise.
- Never truncate your thoughts or code prematurely. Provide complete, working, production-grade solutions.

At the very end of your response, you MUST append exactly 3 relevant follow-up questions for the user inside a <related_questions> block, one per line starting with a dash, like this:
<related_questions>
- Question 1?
- Question 2?
- Question 3?
</related_questions>`;

  const geminiKey = process.env.GEMINI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;

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

  // Asynchronous streaming worker with 4-Tier Resilience
  (async () => {
    let resolvedModelName = activeModel.name;
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
            sendEvent
          );
        } catch (orErr: unknown) {
          const errMsg = orErr instanceof Error ? orErr.message : String(orErr);
          console.warn(`[Lemur AI] OpenRouter model ${activeModel.id} failed: ${errMsg}. Failing over.`);
          fallbackWarning = `Model ${activeModel.name} was busy or rate-limited. Switched to Gemini 2.5 Flash backup.`;
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
            sendEvent
          );
        } catch (gemErr: unknown) {
          const errMsg = gemErr instanceof Error ? gemErr.message : String(gemErr);
          console.warn(`[Lemur AI] Primary Gemini ${activeModel.id} failed: ${errMsg}. Triggering fallback.`);
          fallbackWarning = `Primary Google Gemini was busy. Switched to high-capacity backup.`;
        }
      }

      // --- TIER 2: Gemini 2.5 Flash Fallback ---
      if (!streamed && geminiKey) {
        if (fallbackWarning) {
          resolvedModelName = "Gemini 2.5 Flash (Backup)";
          await sendEvent({
            type: "warning",
            warning: fallbackWarning,
            model: resolvedModelName,
          });
        }

        try {
          console.log("[Lemur AI] Streaming with Direct Google Gemini 2.5 Flash fallback...");
          streamed = await streamDirectGemini(
            messages,
            systemPrompt,
            "gemini-2.5-flash",
            file,
            geminiKey,
            sendEvent
          );
        } catch (gemErr: unknown) {
          const errMsg = gemErr instanceof Error ? gemErr.message : String(gemErr);
          console.warn(`[Lemur AI] Gemini 2.5 Flash fallback failed: ${errMsg}. Trying Gemini 3.5 Flash Lite.`);
        }
      }

      // --- TIER 3: Gemini 3.5 Flash Lite (Ultra-speed secondary) ---
      if (!streamed && geminiKey) {
        try {
          console.log("[Lemur AI] Streaming with Gemini 3.5 Flash Lite fallback...");
          streamed = await streamDirectGemini(
            messages,
            systemPrompt,
            "gemini-3.5-flash-lite",
            file,
            geminiKey,
            sendEvent
          );
        } catch (liteErr: unknown) {
          console.warn("[Lemur AI] Gemini 3.5 Flash Lite fallback failed:", liteErr);
        }
      }

      // --- TIER 4: OpenRouter High-Capacity 1M-Context Free Fallback (MiniMax M3) ---
      if (!streamed && openrouterKey) {
        const fallbackId = "minimax/minimax-m3:free";
        console.log(`[Lemur AI] Attempting ultimate fallback to OpenRouter: ${fallbackId}`);
        try {
          streamed = await streamOpenRouter(
            messages,
            systemPrompt,
            fallbackId,
            file,
            openrouterKey,
            sendEvent
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
  sendEvent: (payload: StreamEventPayload) => Promise<void>
): Promise<boolean> {
  const contents: GeminiContent[] = [];

  for (const msg of messages) {
    const role = msg.role === "assistant" ? "model" : "user";
    contents.push({
      role,
      parts: [{ text: msg.content }],
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

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${apiKey}`;
  const payload = {
    contents,
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192, // Generous 8k tokens for long, comprehensive answers
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
        const textPart = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textPart) {
          await sendEvent({ type: "chunk", text: textPart });
          tokensStreamed++;
        }
      } catch {
        // Skip unparseable lines
      }
    }
  }

  if (buffer.startsWith("data: ")) {
    try {
      const parsed = JSON.parse(buffer.slice(6).trim());
      const textPart = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textPart) {
        await sendEvent({ type: "chunk", text: textPart });
        tokensStreamed++;
      }
    } catch {}
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
  sendEvent: (payload: StreamEventPayload) => Promise<void>
): Promise<boolean> {
  const openrouterMessages: Array<{
    role: string;
    content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  }> = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
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
      "HTTP-Referer": "https://lemur-ai.vercel.app",
      "X-Title": "Lemur AI",
    },
    body: JSON.stringify({
      model: modelId,
      messages: openrouterMessages,
      temperature: 0.7,
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
