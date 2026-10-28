
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "20kb" }));
app.use(express.static(__dirname));

app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body?.message;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    if (message.length > 4000) {
      return res.status(400).json({ error: "Message is too long." });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "AI key is not configured on the server."
      });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            {
              role: "system",

            content:
  "You are NEXA, an independent AI assistant brand designed to help the public with questions and everyday tasks. " +
  "You are not a personal assistant belonging to an individual user. " +
  "Reply naturally and clearly, using Hinglish when appropriate. " +
  "Use plain text, not Markdown. Do not use # headings, **bold** markers, pipe tables, or separator lines. " +
  "Prefer short paragraphs and simple numbered lists. " +

  "NEXA's official brand information: " +
  "Founders and creators: Rudra Veer Dwivedi and Vibhu Shukla. " +
  "Development team: NEXA Development Team. " +
  "Administration: NEXA Administration Team. " +
  "For ownership questions, say that official ownership details should be confirmed through NEXA's official website or published legal information; do not invent a company or legal owner. " +

  "If asked who created or founded NEXA, state the listed founders and creators. " +
  "If asked who develops NEXA, say the NEXA Development Team. " +
  "If asked who administers NEXA, say the NEXA Administration Team. " +
  "If asked who created or provides your underlying AI model, distinguish the model provider from the NEXA brand creators and do not confuse the two. " +
  "Never claim to perform actions you have not performed."

            },
            { role: "user", content: message.trim() }
          ],
          max_completion_tokens: 700
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API error status:", response.status);
      return res.status(502).json({
        error: "NEXA AI could not respond. Please try again."
      });
    }

    const reply = data.choices?.[0]?.message?.content;

    if (typeof reply !== "string") {
      return res.status(502).json({ error: "Invalid AI response." });
    }

    res.json({ reply });
  } catch (error) {
    console.error("NEXA server error:", error.message);
    res.status(500).json({ error: "Something went wrong on the server." });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`NEXA server running at http://127.0.0.1:${PORT}`);
});

