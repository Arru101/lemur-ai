const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "../.env.local");
let openrouterKey = "";

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match) {
      const key = match[1];
      let val = match[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.substring(1, val.length - 1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.substring(1, val.length - 1);
      if (key === "OPENROUTER_API_KEY") openrouterKey = val;
    }
  });
}

if (!openrouterKey) {
  console.error("No OPENROUTER_API_KEY found in .env.local");
  process.exit(1);
}

const modelsToTest = [
  "deepseek/deepseek-r1:free",
  "qwen/qwen-2.5-coder-32b-instruct:free",
  "meta-llama/llama-3-8b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
  "google/gemini-2.5-flash:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "qwen/qwen3-coder:free",
  "openrouter/free"
];

async function testModel(model) {
  console.log(`\nTesting model: ${model}...`);
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openrouterKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: "Hi" }],
        max_tokens: 10
      })
    });

    console.log(`[${model}] Status:`, res.status, res.statusText);
    const data = await res.json();
    if (res.ok) {
      console.log(`[${model}] Success:`, data.choices?.[0]?.message?.content || JSON.stringify(data));
    } else {
      console.log(`[${model}] Error:`, data.error?.message || JSON.stringify(data));
    }
  } catch (err) {
    console.error(`[${model}] Fetch failed:`, err.message);
  }
}

async function run() {
  for (const model of modelsToTest) {
    await testModel(model);
  }
}

run();
