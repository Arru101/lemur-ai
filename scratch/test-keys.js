const fs = require("fs");
const path = require("path");

// Load .env.local manually
const envPath = path.join(__dirname, "../.env.local");
let geminiKey = "";
let openrouterKey = "";

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match) {
      const key = match[1];
      let val = match[2].trim();
      // Remove optional quotes
      if (val.startsWith('"') && val.endsWith('"')) val = val.substring(1, val.length - 1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.substring(1, val.length - 1);
      
      if (key === "GEMINI_API_KEY") geminiKey = val;
      if (key === "OPENROUTER_API_KEY") openrouterKey = val;
    }
  });
}

console.log("Diagnostic Script Started...");
console.log("GEMINI_API_KEY status:", geminiKey ? "Found (length: " + geminiKey.length + ")" : "Not found");
console.log("OPENROUTER_API_KEY status:", openrouterKey ? "Found (length: " + openrouterKey.length + ")" : "Not found");

async function testGemini() {
  if (!geminiKey) {
    console.log("\n[Gemini] Skipped: No key configured.");
    return;
  }
  
  console.log("\n[Gemini] Testing direct connection to Google Gemini API...");
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
  const payload = {
    contents: [{ role: "user", parts: [{ text: "Hello! Reply with one word." }] }]
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    console.log("[Gemini] Status:", res.status, res.statusText);
    const body = await res.text();
    console.log("[Gemini] Response Body:\n", body);
  } catch (err) {
    console.error("[Gemini] Network Error:", err.message);
  }
}

async function testOpenRouter() {
  if (!openrouterKey) {
    console.log("\n[OpenRouter] Skipped: No key configured.");
    return;
  }
  
  console.log("\n[OpenRouter] Testing connection to OpenRouter API...");
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openrouterKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash:free",
        messages: [{ role: "user", content: "Hello! Reply with one word." }]
      })
    });

    console.log("[OpenRouter] Status:", res.status, res.statusText);
    const body = await res.text();
    console.log("[OpenRouter] Response Body:\n", body);
  } catch (err) {
    console.error("[OpenRouter] Network Error:", err.message);
  }
}

async function run() {
  await testGemini();
  await testOpenRouter();
}

run();
