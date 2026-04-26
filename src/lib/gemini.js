const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(url, options);

    if (response.status === 429) {
      const waitTime = (i + 1) * 10000;
      console.log(`Rate limited. Waiting ${waitTime / 1000}s before retry ${i + 1}...`);
      await sleep(waitTime);
      continue;
    }

    return response;
  }
  throw new Error("Too many requests. Please wait a minute and try again.");
}

export async function analyseReceipt(base64Image, mimeType, budgetCategories) {
  const prompt = `
    You are a smart expense analyser. Analyse this receipt image and return a JSON object with this exact structure:
    {
      "store": "store name",
      "date": "date on receipt or null",
      "total": total amount as a number,
      "items": [
        {
          "name": "item name",
          "price": price as a number,
          "quantity": quantity as a number,
          "category": "one of: Groceries, Food & Dining, Healthcare, Entertainment, Transport, Shopping, Other",
          "necessary": true or false (is this a necessary purchase?),
          "cheaper_alternative": "suggestion for where to get it cheaper, or null if price is fair"
        }
      ],
      "insights": [
        "one sentence insight or tip about this receipt"
      ]
    }

    The user's monthly budget categories are: ${JSON.stringify(budgetCategories)}

    Rules:
    - Return ONLY the JSON, no extra text, no markdown, no backticks
    - cheaper_alternative should mention a specific store or brand when possible
    - necessary means essential for daily life (food, medicine, transport) vs optional (snacks, entertainment)
    - insights should be actionable and specific to what you see on this receipt
  `;

  const body = JSON.stringify({
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Image,
            },
          },
          { text: prompt },
        ],
      },
    ],
  });

  const response = await fetchWithRetry(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Could not parse Gemini response as JSON");
  }
}

export function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}