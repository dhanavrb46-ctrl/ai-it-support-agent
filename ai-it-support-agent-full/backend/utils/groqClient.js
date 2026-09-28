// Thin wrapper around the Groq Chat Completions API (OpenAI-compatible).
// Docs: https://console.groq.com/docs/quickstart
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

async function groqChat(messages, { temperature = 0.3, jsonMode = false } = {}) {
  const body = {
    model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
    messages,
    temperature,
  };
  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

// Generates a step-by-step troubleshooting reply grounded in retrieved KB docs.
async function generateRagAnswer(userMessage, retrievedDocs) {
  const context = retrievedDocs
    .map((d, i) => `Doc ${i + 1} - ${d.title}:\n${d.content}`)
    .join("\n\n");

  const messages = [
    {
      role: "system",
      content:
        "You are an internal IT Help Desk assistant. Answer ONLY using the knowledge base " +
        "context provided below. Give clear, numbered step-by-step instructions. " +
        "If the context does not actually address the employee's issue, reply with exactly: " +
        "NOT_FOUND (nothing else).\n\nKNOWLEDGE BASE CONTEXT:\n" + context,
    },
    { role: "user", content: userMessage },
  ];

  return await groqChat(messages, { temperature: 0.2 });
}

// Classifies urgency for an unresolved issue before ticket creation.
async function classifyUrgency(title, description) {
  const messages = [
    {
      role: "system",
      content:
        "You are an IT ticket triage assistant. Classify the urgency of the issue as exactly " +
        'one of "High", "Medium", or "Low". Respond ONLY with valid JSON like ' +
        '{"priority": "High", "category": "VPN"}. Category must be one of: ' +
        "Password Reset, Wi-Fi/Network, VPN, Printer, Hardware, Software, Email, Other.",
    },
    { role: "user", content: `Title: ${title}\nDescription: ${description}` },
  ];

  const raw = await groqChat(messages, { temperature: 0, jsonMode: true });
  try {
    const parsed = JSON.parse(raw);
    return {
      priority: ["High", "Medium", "Low"].includes(parsed.priority) ? parsed.priority : "Medium",
      category: parsed.category || "Other",
    };
  } catch {
    return { priority: "Medium", category: "Other" };
  }
}

module.exports = { groqChat, generateRagAnswer, classifyUrgency };
