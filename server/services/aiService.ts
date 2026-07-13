import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const parseJSON = <T>(text: string): T => {
  const cleaned = text.replace(/```json\s*/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned) as T;
};

const generateText = async (prompt: string): Promise<string> => {
  const response = await genAI.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
  });
  return response.text ?? '';
};

// ─── Complaint Classifier ─────────────────────────────────────────────────────

export interface ComplaintClassification {
  category: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  department: string;
  summary: string;
  estimatedResolutionDays: number;
}

export async function classifyComplaint(complaintText: string): Promise<ComplaintClassification> {
  const prompt = `You are a government complaint classification system for India. Analyze this citizen complaint and respond ONLY with a valid JSON object (no markdown, no backticks):

Complaint: "${complaintText}"

Respond with this exact JSON structure:
{
  "category": "one of: Roads, Water Supply, Electricity, Healthcare, Education, Sanitation, Transportation, Municipal Services, Land Records, Other",
  "priority": "one of: Critical, High, Medium, Low",
  "department": "relevant government department name",
  "summary": "one sentence summary of the issue",
  "estimatedResolutionDays": number between 1 and 30
}`;

  const text = await generateText(prompt);
  return parseJSON<ComplaintClassification>(text);
}

// ─── Anomaly / Fraud Detection ────────────────────────────────────────────────

export interface AnomalyDetectionResult {
  riskScore: number;
  flags: string[];
  recommendation: string;
  isSuspicious: boolean;
}

export async function detectFundAnomaly(transactionData: object): Promise<AnomalyDetectionResult> {
  const prompt = `You are a government financial fraud detection AI for India. Analyze this transaction and respond ONLY with valid JSON (no markdown):

Transaction: ${JSON.stringify(transactionData)}

Respond with:
{
  "riskScore": number 0-100,
  "flags": ["list of suspicious patterns found"],
  "recommendation": "action to take",
  "isSuspicious": boolean
}`;

  const text = await generateText(prompt);
  return parseJSON<AnomalyDetectionResult>(text);
}

// ─── Sentiment Analysis ───────────────────────────────────────────────────────

export interface SentimentResult {
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  score: number;
  insight: string;
}

export async function analyzeSentiment(feedbackText: string): Promise<SentimentResult> {
  const prompt = `Analyze the sentiment of this citizen feedback about a government service. Respond ONLY with valid JSON (no markdown):

Feedback: "${feedbackText}"

Respond with:
{
  "sentiment": "Positive or Neutral or Negative",
  "score": number -1 to 1,
  "insight": "one sentence insight about what the citizen feels"
}`;

  const text = await generateText(prompt);
  return parseJSON<SentimentResult>(text);
}

// ─── Government Chatbot ───────────────────────────────────────────────────────

export interface ChatbotResponse {
  answer: string;
  suggestedActions: string[];
}

export async function governmentChatbot(question: string, context?: string): Promise<ChatbotResponse> {
  const prompt = `You are TrustGov AI Assistant — a helpful chatbot for Indian citizens using the TrustGov e-governance portal. Answer questions about government services, complaint tracking, and public welfare schemes. Be concise, helpful, and factual.

${context ? `Context: ${context}` : ''}

Citizen question: "${question}"

Respond ONLY with valid JSON (no markdown):
{
  "answer": "your helpful answer in 2-3 sentences",
  "suggestedActions": ["up to 3 short action suggestions for the citizen"]
}`;

  const text = await generateText(prompt);
  return parseJSON<ChatbotResponse>(text);
}
