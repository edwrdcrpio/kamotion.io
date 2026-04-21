import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

export type AiProvider = "openrouter" | "openai" | "anthropic" | "google";

export function getModel(
  provider: AiProvider,
  modelId: string,
  apiKey: string,
): LanguageModel {
  switch (provider) {
    case "openrouter": {
      // OpenRouter is OpenAI-compatible; point the OpenAI client at its base URL.
      const client = createOpenAI({
        apiKey,
        baseURL: "https://openrouter.ai/api/v1",
        headers: {
          "HTTP-Referer": "https://kamotion.io",
          "X-Title": "Kamotion",
        },
      });
      return client(modelId);
    }
    case "openai": {
      const client = createOpenAI({ apiKey });
      return client(modelId);
    }
    case "anthropic": {
      const client = createAnthropic({ apiKey });
      return client(modelId);
    }
    case "google": {
      const client = createGoogleGenerativeAI({ apiKey });
      return client(modelId);
    }
    default: {
      const _exhaustive: never = provider;
      throw new Error(`Unknown AI provider: ${String(_exhaustive)}`);
    }
  }
}
