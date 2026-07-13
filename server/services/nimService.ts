/**
 * NVIDIA NIM Service — DiffusionGemma 26B (google/diffusiongemma-26b-a4b-it)
 * ─────────────────────────────────────────────────────────────────────────────
 * Calls the NVIDIA NIM hosted API at integrate.api.nvidia.com
 * Supports text-only and text+image_url messages.
 *
 * ENV required:
 *   NVIDIA_NIM_API_KEY  — your NGC API key (nvapi-…)
 *
 * ENV optional:
 *   NVIDIA_NIM_MODEL    — override model ID (default: google/diffusiongemma-26b-a4b-it)
 *   NVIDIA_NIM_MAX_TOKENS — default 512 (keep low to conserve quota)
 */

const NIM_BASE_URL  = 'https://integrate.api.nvidia.com/v1';
const DEFAULT_MODEL = 'google/diffusiongemma-26b-a4b-it';

// ─── Types ────────────────────────────────────────────────────────────────────

type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

interface NimMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | ContentPart[];
}

export interface NimChatOptions {
  /** User message text */
  prompt: string;
  /** Optional public image URL to send alongside the text */
  imageUrl?: string;
  /** Max tokens to generate — kept at 512 by default to conserve quota */
  maxTokens?: number;
  /** Temperature 0–2 */
  temperature?: number;
  /** Enable chain-of-thought thinking (DiffusionGemma feature) */
  enableThinking?: boolean;
}

export interface NimChatResult {
  text: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

interface NimApiResponse {
  choices: Array<{
    message: { content: string };
    finish_reason: string;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ─── Core function ────────────────────────────────────────────────────────────

export async function nimChat(opts: NimChatOptions): Promise<NimChatResult> {
  const apiKey = process.env.NVIDIA_NIM_API_KEY;
  if (!apiKey) {
    throw new Error('NVIDIA_NIM_API_KEY is not configured. Add it to your .env file.');
  }

  const model       = process.env.NVIDIA_NIM_MODEL ?? DEFAULT_MODEL;
  const maxTokens   = opts.maxTokens ?? Number(process.env.NVIDIA_NIM_MAX_TOKENS ?? 512);
  const temperature = opts.temperature ?? 0.7;

  // Build message content — text only OR multimodal (text + image)
  let content: string | ContentPart[];
  if (opts.imageUrl) {
    content = [
      { type: 'text', text: opts.prompt },
      { type: 'image_url', image_url: { url: opts.imageUrl } },
    ];
  } else {
    content = opts.prompt;
  }

  const messages: NimMessage[] = [{ role: 'user', content }];

  const body = {
    model,
    messages,
    max_tokens: maxTokens,
    temperature,
    top_p: 0.95,
    stream: false,
    chat_template_kwargs: { enable_thinking: opts.enableThinking ?? false },
  };

  console.log(`[NIM] Calling ${model} | maxTokens=${maxTokens} | thinking=${opts.enableThinking ?? false}`);

  const response = await fetch(`${NIM_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`NIM API error ${response.status}: ${errText}`);
  }

  const data = (await response.json()) as NimApiResponse;

  const choice = data.choices?.[0];
  if (!choice) {
    throw new Error('NIM API returned no choices in response.');
  }

  return {
    text: choice.message.content,
    model: data.model,
    usage: {
      promptTokens:     data.usage?.prompt_tokens     ?? 0,
      completionTokens: data.usage?.completion_tokens ?? 0,
      totalTokens:      data.usage?.total_tokens      ?? 0,
    },
  };
}
