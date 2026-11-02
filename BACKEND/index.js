import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import rateLimit from "express-rate-limit";

const app = express();
const port = Number(process.env.PORT || 3000);
const model = process.env.OPENAI_MODEL || "gpt-5.5";
app.use(cors());
app.use(express.json({ limit: "32kb" }));
app.use("/chat", rateLimit({ windowMs: 60000, limit: 20, standardHeaders: "draft-7", legacyHeaders: false }));

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const instructions = `You are Tuesday, a personal AI assistant. Be thoughtful, practical, calm, conversational and occasionally witty. Respectfully disagree when the user is mistaken. Be transparent that you are an AI and do not claim human feelings. Do not claim to have completed external actions unless a connected tool did so. Use web search when current information needs verification and the tool is available. State uncertainty honestly. Ask before consequential external actions. This is an early prototype; its full safety and moral code is not finalised.`;

app.get("/health", (_req, res) => res.json({ ok: true, service: "project-tuesday-backend" }));

app.post("/chat", async (req, res) => {
  try {
    if (!openai) return res.status(503).json({ error: "Backend is not configured. Add OPENAI_API_KEY to host secrets." });
    const { messages, webSearch = true } = req.body ?? {};
    if (!Array.isArray(messages) || messages.length < 1 || messages.length > 20) return res.status(400).json({ error: "Send between 1 and 20 messages." });
    const valid = messages.every(m => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string" && m.content.trim().length > 0 && m.content.length <= 8000);
    if (!valid) return res.status(400).json({ error: "Invalid message format." });
    const request = { model, instructions, input: messages.map(({ role, content }) => ({ role, content })) };
    if (webSearch === true) request.tools = [{ type: "web_search" }];
    const result = await openai.responses.create(request);
    const reply = result.output_text?.trim();
    if (!reply) return res.status(502).json({ error: "The AI returned an empty response. Try again." });
    return res.json({ reply });
  } catch (error) {
    console.error("Chat request failed:", error?.message || error);
    return res.status(500).json({ error: "Tuesday could not complete that request. Check backend configuration and try again." });
  }
});

app.listen(port, "0.0.0.0", () => console.log(`Project Tuesday backend listening on ${port}`));
