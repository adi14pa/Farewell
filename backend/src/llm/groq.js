import "dotenv/config";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Calls Groq's OpenAI-compatible chat completions endpoint and forces JSON output.
 * Used by the planner and itinerary agent nodes for structured reasoning steps.
 */
export async function askJSON({ system, user, temperature = 0.4 }) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      temperature,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  try {
    return JSON.parse(content);
  } catch {
    throw new Error(`Groq did not return valid JSON: ${content}`);
  }
}
