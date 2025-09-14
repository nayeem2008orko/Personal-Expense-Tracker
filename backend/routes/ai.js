const express = require("express");
const router = express.Router();

router.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "No message provided" });

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3.1:free",
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("OpenRouter API error:", data.error);
      return res.status(500).json({ error: data.error.message || "API error" });
    }

    const reply = data.choices?.[0]?.message?.content || "No response";
    res.json({ reply });
  } catch (err) {
    console.error("AI service error:", err);
    res.status(500).json({ error: "AI service error" });
  }
});

module.exports = router;