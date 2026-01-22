import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  try {
    const { term } = req.body || {};
    if (!term) return res.status(400).json({ error: "Missing term" });

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
Term: "${term}"

Tareas:
1) Traduce al español (natural).
2) Da un significado MUY sintetizado en español (máximo 160 caracteres).
Regresa SOLO en JSON con llaves: translation_es, meaning_es
`;

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: prompt
    });

    const text = (response.output_text || "").trim();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      data = JSON.parse(text.slice(start, end + 1));
    }

    return res.status(200).json({
      translation_es: (data.translation_es || "").trim(),
      meaning_es: (data.meaning_es || "").trim()
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
