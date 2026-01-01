import { Request, Response } from "express";
import { OpenRouter } from "@dukebot/open-router";
import dotenv from "dotenv";
dotenv.config();


const openRouter = new OpenRouter({ apiKey: process.env.OPENROUTER_API_KEY! });

export const postChat = async (req: Request, res: Response) => {
  try {
    const prompt = req.body?.prompt || req.params.prompt;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await openRouter.service.completeChat({
      prompt,
      system: "You are a helpful and creative assistant.",
      model: "tngtech/tng-r1t-chimera:free",
      max_tokens: 500 
    });

    res.json({ content: response.content });
  } catch (err: any) {
    console.error("AI error:", err);
    res.status(500).json({ error: err.message });
  }
};