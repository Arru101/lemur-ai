import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiting map
// Key: IP address, Value: { tokens: number, lastRefill: number }
const rateLimitMap = new Map<string, { tokens: number; lastRefill: number }>();
const LIMIT_TOKENS = 15; // Max tokens (requests) in bucket
const REFILL_RATE = 1000 * 30; // Refill 1 token every 30 seconds

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

// Map languages to full names for prompting
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
  provider: string;
  id: string;
  openrouterId?: string;
}

// Available AI Models configuration
const MODELS: Record<string, ModelInfo> = {
  "smart-router": {
    name: "Smart Router (Auto)",
    provider: "routing",
    id: "smart-router",
  },
  "gemini-flash": {
    name: "Gemini 2.5 Flash",
    provider: "google",
    id: "gemini-2.5-flash",
    openrouterId: "openrouter/free",
  },
  "deepseek-r1": {
    name: "DeepSeek R1",
    provider: "openrouter",
    id: "deepseek/deepseek-r1:free",
    openrouterId: "deepseek/deepseek-r1:free",
  },
  "qwen-coder": {
    name: "Qwen 3 Coder",
    provider: "openrouter",
    id: "qwen/qwen3-coder:free",
    openrouterId: "qwen/qwen3-coder:free",
  },
  "llama-3": {
    name: "Llama 3.3 70B",
    provider: "openrouter",
    id: "meta-llama/llama-3.3-70b-instruct:free",
    openrouterId: "meta-llama/llama-3.3-70b-instruct:free",
  },
  "mistral-7b": {
    name: "Gemma 4 31B",
    provider: "openrouter",
    id: "google/gemma-4-31b-it:free",
    openrouterId: "google/gemma-4-31b-it:free",
  },
};

// Smart Router classifier
function classifyQuery(query: string): keyof typeof MODELS {
  const q = query.toLowerCase();
  
  // Coding signals
  const codingKeywords = [
    "code", "function", "class", "const", "let", "var", "npm", "pip", "github", 
    "bug", "error", "compile", "javascript", "typescript", "python", "rust", 
    "c++", "java", "html", "css", "sql", "api", "json", "regex", "import", "export", 
    "react", "nextjs", "vue", "angular", "node", "docker", "kubernetes"
  ];
  
  // Analytical / Reasoning signals
  const reasoningKeywords = [
    "solve", "calculate", "prove", "math", "equation", "theorem", "physics", 
    "algorithm", "complexity", "r1", "reasoning", "explain step-by-step", "logic puzzle",
    "philosophical", "architectural choice", "performance bottleneck"
  ];

  // Count matches
  const codingMatches = codingKeywords.filter(keyword => q.includes(keyword)).length;
  const reasoningMatches = reasoningKeywords.filter(keyword => q.includes(keyword)).length;

  if (codingMatches > 0 && codingMatches >= reasoningMatches) {
    return "qwen-coder";
  }
  if (reasoningMatches > 0 && reasoningMatches > codingMatches) {
    return "deepseek-r1";
  }
  
  // Default to Gemini Flash for fast response
  return "gemini-flash";
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting check
    const ip = req.headers.get("x-forwarded-for") || "anonymous_ip";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment before sending another message." },
        { status: 429 }
      );
    }

    // 2. Parse request body
    const body = await req.json();
    const { messages, model: selectedModelId, language, file } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: messages array is required." },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];
    const userPrompt = lastMessage.content || "";

    // 3. Smart Routing Resolution
    let activeModelKey: keyof typeof MODELS = "gemini-flash";
    let isSmartRouted = false;

    if (selectedModelId === "smart-router") {
      activeModelKey = classifyQuery(userPrompt);
      isSmartRouted = true;
    } else if (selectedModelId in MODELS) {
      activeModelKey = selectedModelId as keyof typeof MODELS;
    }

    const activeModel = MODELS[activeModelKey];
    const targetLanguage = LANGUAGE_MAP[language || "en"] || "English";

    // Inject system instructions for multilingual response and premium personality
    const systemPrompt = `You are Lemur AI, a helpful, premium, intelligent chat assistant.
Provide highly accurate, beautiful, and complete answers.
Use professional formatting with clear markdown headings, lists, and tables where appropriate.
If code is requested, write complete, production-ready code with concise inline explanations.
IMPORTANT: You MUST respond and converse in ${targetLanguage}. Keep all your answers in ${targetLanguage} unless the user explicitly requests otherwise.`;

    // 4. Handle Providers and Fallbacks based on configured keys
    const geminiKey = process.env.GEMINI_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;

    // If only GEMINI_API_KEY is available, force routing to Direct Gemini.
    // If only OPENROUTER_API_KEY is available, force routing to OpenRouter.
    let provider = activeModel.provider;
    if (geminiKey && !openrouterKey) {
      provider = "google";
    } else if (!geminiKey && openrouterKey) {
      provider = "openrouter";
    }

    let lastError: any = null;

    // Attempt direct Google Gemini call if applicable
    if (provider === "google" && geminiKey) {
      try {
        const directGeminiResponse = await callDirectGemini(messages, systemPrompt, file, geminiKey);
        return NextResponse.json({
          text: directGeminiResponse,
          model: activeModel.name.includes("Gemini") ? activeModel.name : `Gemini 2.5 Flash (via ${activeModel.name})`,
          routedModelKey: activeModelKey,
          isSmartRouted
        });
      } catch (err: any) {
        console.error("Direct Gemini API error:", err);
        lastError = err;
        // Fall through to OpenRouter if openrouterKey is also configured
      }
    }

    // Attempt OpenRouter call if applicable
    if (openrouterKey) {
      // Determine target model and fallback sequence
      const primaryModelId = activeModel.openrouterId || "openrouter/free";
      
      const fallbackModels = [
        primaryModelId,
        "openrouter/free",
        "meta-llama/llama-3.3-70b-instruct:free",
        "meta-llama/llama-3.2-3b-instruct:free"
      ];
      
      const uniqueModels = Array.from(new Set(fallbackModels));
      
      for (let i = 0; i < uniqueModels.length; i++) {
        const currentModelId = uniqueModels[i];
        try {
          console.log(`Attempting OpenRouter call with model: ${currentModelId}`);
          const openrouterResponse = await callOpenRouter(
            messages,
            systemPrompt,
            currentModelId,
            file,
            openrouterKey
          );
          
          let responseModelName = activeModel.name;
          if (i > 0) {
            responseModelName = `${activeModel.name} (Fallback: ${currentModelId.split('/').pop()?.replace(':free', '')})`;
          }
          
          return NextResponse.json({
            text: openrouterResponse,
            model: responseModelName,
            routedModelKey: activeModelKey,
            isSmartRouted,
            warning: i > 0 ? "Selected model was unavailable. Switched to fallback." : undefined
          });
        } catch (err: any) {
          console.warn(`OpenRouter call failed for model ${currentModelId}:`, err.message || err);
          lastError = err;
        }
      }
    }

    // Ultimate Direct Gemini Fallback (if OpenRouter fails but Gemini key is available)
    if (geminiKey && openrouterKey) {
      try {
        console.log("All OpenRouter models failed. Attempting ultimate fallback to Direct Gemini...");
        const directGeminiResponse = await callDirectGemini(messages, systemPrompt, file, geminiKey);
        return NextResponse.json({
          text: directGeminiResponse,
          model: "Gemini 2.5 Flash (Ultimate Fallback)",
          routedModelKey: "gemini-flash",
          isSmartRouted: false,
          warning: "OpenRouter services were unavailable. Switched to direct Gemini backup."
        });
      } catch (geminiErr: any) {
        console.error("Ultimate Direct Gemini fallback also failed:", geminiErr);
        lastError = geminiErr;
      }
    }

    // 6. If no keys are configured
    if (!geminiKey && !openrouterKey) {
      return NextResponse.json(
        {
          error: "API Keys are not configured on the server. Please add GEMINI_API_KEY or OPENROUTER_API_KEY to your env variables."
        },
        { status: 501 }
      );
    }

    return NextResponse.json(
      { error: `Failed to generate a response from the AI models. Details: ${lastError?.message || lastError}` },
      { status: 502 }
    );
  } catch (error: any) {
    console.error("API Error: ", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// Call Google Gemini API directly
async function callDirectGemini(
  messages: any[],
  systemPrompt: string,
  file: any,
  apiKey: string
): Promise<string> {
  const contents = [];

  // Map messages to Gemini structure
  for (const msg of messages) {
    const role = msg.role === "assistant" ? "model" : "user";
    contents.push({
      role,
      parts: [{ text: msg.content }]
    });
  }

  // Handle file attachment if present
  if (file && file.data && file.type) {
    // Inject the base64 media part into the very last user request
    const lastContent = contents[contents.length - 1];
    if (lastContent && lastContent.role === "user") {
      const base64Data = file.data.split(",")[1] || file.data;
      lastContent.parts.unshift({
        inlineData: {
          mimeType: file.type,
          data: base64Data
        }
      } as any);
    }
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const payload = {
    contents,
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    }
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Direct Gemini API failed with status ${res.status}: ${errText}`);
  }

  const json = await res.json();
  const textResponse = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResponse) {
    throw new Error("Invalid response format from Direct Gemini API.");
  }

  return textResponse;
}

// Call OpenRouter API
async function callOpenRouter(
  messages: any[],
  systemPrompt: string,
  modelId: string,
  file: any,
  apiKey: string
): Promise<string> {
  const openrouterMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => {
      // Clean messages if they have extra tags
      return { role: m.role, content: m.content };
    })
  ];

  // If a file is uploaded (OpenRouter usually takes images via Markdown url or multi-part contents)
  // For free OpenRouter models, we can format the last message content as multi-part or append a base64 string
  if (file && file.data && file.type) {
    const lastMsg = openrouterMessages[openrouterMessages.length - 1];
    if (file.type.startsWith("image/")) {
      // Multi-part content formatting for multimodal support on OpenRouter
      lastMsg.content = [
        { type: "text", text: lastMsg.content },
        {
          type: "image_url",
          image_url: {
            url: file.data // Base64 data URL
          }
        }
      ] as any;
    } else {
      // Text file
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
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter failed with status ${res.status}: ${errText}`);
  }

  const json = await res.json();
  const textResponse = json.choices?.[0]?.message?.content;
  if (!textResponse) {
    throw new Error("Invalid response format from OpenRouter API.");
  }

  return textResponse;
}
