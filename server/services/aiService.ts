const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || '';
const NVIDIA_BASE_URL = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
// meta/llama-3.1-8b-instruct is free on NVIDIA build platform
const NVIDIA_MODEL = 'meta/llama-3.1-8b-instruct';

async function callNvidia(systemPrompt: string, userMessage: string): Promise<string> {
  if (!NVIDIA_API_KEY) throw new Error('NVIDIA_API_KEY is not configured');

  const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NVIDIA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: NVIDIA_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 512,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`NVIDIA API error ${response.status}: ${err}`);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };
  return data.choices[0].message.content.trim();
}

function parseJsonSafe<T>(text: string): T {
  const cleaned = text.replace(/```json|```/g, '').trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON found in AI response');
  return JSON.parse(match[0]) as T;
}

// ── Types ──────────────────────────────────────────────────────

export interface ComplaintClassification {
  category: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  department: string;
  summary: string;
  estimatedResolutionDays: number;
}

export interface AnomalyResult {
  riskScore: number;
  flags: string[];
  recommendation: string;
  isSuspicious: boolean;
}

export interface SentimentResult {
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  score: number;
  insight: string;
}

export interface ChatbotResponse {
  answer: string;
  suggestedActions: string[];
}

// ── Implementations ────────────────────────────────────────────

export async function classifyComplaint(text: string): Promise<ComplaintClassification> {
  const system = `You are a government complaint classification AI. Always respond with ONLY a JSON object, no explanation.`;
  const user = `Classify this citizen complaint: "${text}"

Respond with exactly this JSON:
{"category":"one of: Roads, Water Supply, Electricity, Healthcare, Education, Sanitation, Transportation, Municipal Services, Land Records, Other","priority":"Critical or High or Medium or Low","department":"relevant department name","summary":"one sentence summary","estimatedResolutionDays":7}`;

  const raw = await callNvidia(system, user);
  return parseJsonSafe<ComplaintClassification>(raw);
}

export async function detectFundAnomaly(transaction: object): Promise<AnomalyResult> {
  const system = `You are a government financial fraud detection AI. Always respond with ONLY a JSON object.`;
  const user = `Analyze this government fund transaction for fraud or anomalies: ${JSON.stringify(transaction)}

Respond with exactly this JSON:
{"riskScore":50,"flags":["list of red flags"],"recommendation":"what to do","isSuspicious":true}`;

  const raw = await callNvidia(system, user);
  return parseJsonSafe<AnomalyResult>(raw);
}

export async function analyzeSentiment(feedbackText: string): Promise<SentimentResult> {
  const system = `You are a sentiment analysis AI. Always respond with ONLY a JSON object.`;
  const user = `Analyze the sentiment of this citizen feedback about a government service: "${feedbackText}"

Respond with exactly this JSON:
{"sentiment":"Positive or Neutral or Negative","score":0.5,"insight":"one sentence insight"}`;

  const raw = await callNvidia(system, user);
  return parseJsonSafe<SentimentResult>(raw);
}

export async function governmentChatbot(question: string): Promise<ChatbotResponse> {
  const system = `You are TrustGov AI Assistant — a helpful chatbot for Indian citizens using TrustGov, a blockchain-powered e-governance portal. Be concise and helpful. Always respond with ONLY a JSON object.`;
  const user = `Citizen question: "${question}"

Respond with exactly this JSON:
{"answer":"your helpful 2-3 sentence answer","suggestedActions":["action 1","action 2","action 3"]}`;

  const raw = await callNvidia(system, user);
  return parseJsonSafe<ChatbotResponse>(raw);
}
