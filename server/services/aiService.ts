const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || '';
const NVIDIA_BASE_URL = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
const MODEL = 'meta/llama-3.1-8b-instruct';

// All 22 scheduled Indian languages + English
export const INDIA_LANGUAGES: Record<string, string> = {
  english:    'English',
  hindi:      'Hindi (हिंदी)',
  tamil:      'Tamil (தமிழ்)',
  telugu:     'Telugu (తెలుగు)',
  kannada:    'Kannada (ಕನ್ನಡ)',
  malayalam:  'Malayalam (മലയാളം)',
  bengali:    'Bengali (বাংলা)',
  marathi:    'Marathi (मराठी)',
  gujarati:   'Gujarati (ગુજરાતી)',
  punjabi:    'Punjabi (ਪੰਜਾਬੀ)',
  odia:       'Odia (ଓଡ଼ିଆ)',
  assamese:   'Assamese (অসমীয়া)',
  urdu:       'Urdu (اردو)',
  sanskrit:   'Sanskrit (संस्कृत)',
  konkani:    'Konkani (कोंकणी)',
  manipuri:   'Manipuri (মৈতৈলোন্)',
  nepali:     'Nepali (नेपाली)',
  sindhi:     'Sindhi (سنڌي)',
  bodo:       'Bodo (बड़ो)',
  dogri:      'Dogri (डोगरी)',
  kashmiri:   'Kashmiri (كٲشُر)',
  maithili:   'Maithili (मैथिली)',
  santali:    'Santali (ᱥᱟᱱᱛᱟᱲᱤ)',
};

async function callNvidia(system: string, user: string, maxTokens = 700): Promise<string> {
  if (!NVIDIA_API_KEY) throw new Error('NVIDIA_API_KEY not configured');
  const res = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NVIDIA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: maxTokens,
      temperature: 0.2,
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`NVIDIA API ${res.status}: ${errText}`);
  }
  const data = await res.json() as { choices: { message: { content: string } }[] };
  return data.choices[0].message.content.trim();
}

function extractJson<T>(text: string): T {
  const cleaned = text.replace(/```json|```/g, '').trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`No JSON in AI response: ${text.substring(0, 200)}`);
  return JSON.parse(match[0]) as T;
}

// ── 1. ISSUE CLASSIFIER ──────────────────────────────────────────

export async function classifyIssue(
  title: string,
  description: string,
  workspaceType: string
): Promise<{
  category: string;
  priority: string;
  department: string;
  summary: string;
  estimatedResolutionDays: number;
  confidenceScore: number;
}> {
  const categories: Record<string, string> = {
    government: 'Roads, Water Supply, Electricity, Healthcare, Education, Sanitation, Transportation, Municipal Services, Land Records, Other',
    corporate: 'HR Policy, IT Support, Workplace Safety, Payroll, Performance, Harassment, Infrastructure, Compliance, Customer Issue, Other',
    industry: 'Product Quality, Equipment Failure, Safety Violation, Supply Chain, Environmental, Process Deviation, Vendor Issue, Other',
  };

  const sys = `You are an AI issue classification system for a ${workspaceType} organization. Always respond ONLY with valid JSON.`;
  const usr = `Classify this issue:
Title: "${title}"
Description: "${description}"
Available categories: ${categories[workspaceType] || categories.government}

JSON format:
{"category":"...","priority":"Critical or High or Medium or Low","department":"...","summary":"one sentence","estimatedResolutionDays":7,"confidenceScore":0.85}`;

  const raw = await callNvidia(sys, usr);
  return extractJson(raw);
}

// ── 2. FRAUD / ANOMALY DETECTION ─────────────────────────────────

export async function detectAnomaly(
  transaction: object,
  workspaceType: string
): Promise<{
  riskScore: number;
  flags: string[];
  recommendation: string;
  isSuspicious: boolean;
}> {
  const ctx: Record<string, string> = {
    government: 'government procurement and public fund allocation',
    corporate: 'corporate expense and vendor payment',
    industry: 'industrial supply chain and production payment',
  };
  const sys = `You are a financial fraud detection AI for ${ctx[workspaceType] || ctx.government}. Always respond ONLY with valid JSON.`;
  const usr = `Analyze for fraud:
${JSON.stringify(transaction, null, 2)}
JSON: {"riskScore":65,"flags":["flag1","flag2"],"recommendation":"action","isSuspicious":true}`;

  const raw = await callNvidia(sys, usr);
  return extractJson(raw);
}

// ── 3. SENTIMENT ANALYSIS ────────────────────────────────────────

export async function analyzeSentiment(
  text: string
): Promise<{ sentiment: string; score: number; insight: string; themes: string[] }> {
  const sys = `You are a sentiment analysis AI. Always respond ONLY with valid JSON.`;
  const usr = `Analyze: "${text}"
JSON: {"sentiment":"Positive or Neutral or Negative","score":0.75,"insight":"one sentence","themes":["theme1","theme2"]}`;
  const raw = await callNvidia(sys, usr);
  return extractJson(raw);
}

// ── 4. CHATBOT — 22 Indian languages ────────────────────────────

export async function chatbot(
  question: string,
  language: string,
  workspaceType: string,
  workspaceName: string
): Promise<{ answer: string; suggestedActions: string[] }> {
  const langName = INDIA_LANGUAGES[language.toLowerCase()] || 'English';
  const ctx: Record<string, string> = {
    government: `a government e-governance portal called ${workspaceName}. Help citizens with complaints, government schemes, public services, and civic issues.`,
    corporate: `a corporate transparency platform for ${workspaceName}. Help employees with HR issues, company policies, and workplace concerns.`,
    industry: `an industrial management platform for ${workspaceName}. Help workers and vendors with quality, safety, and supply chain issues.`,
  };

  const sys = `You are AI TrustOS Assistant for ${ctx[workspaceType] || ctx.government}.
IMPORTANT: You MUST respond entirely in ${langName}.
If the language uses a non-Latin script, use that script.
Be helpful, clear, and professional.
Always respond ONLY with valid JSON.`;

  const usr = `User question: "${question}"
Respond in ${langName}.
JSON: {"answer":"2-3 sentence answer in ${langName}","suggestedActions":["action1 in ${langName}","action2 in ${langName}","action3 in ${langName}"]}`;

  const raw = await callNvidia(sys, usr, 800);
  return extractJson(raw);
}

// ── 5. TRUST SCORE CALCULATION ───────────────────────────────────

export async function calculateTrustScore(metrics: {
  totalIssues: number;
  resolvedIssues: number;
  avgResolutionDays: number;
  overdueIssues: number;
  citizenRating: number;
  flaggedTransactions: number;
}): Promise<{ score: number; reasoning: string; improvements: string[] }> {
  const sys = `You are an organizational trust scoring AI. Always respond ONLY with valid JSON.`;
  const usr = `Calculate a trust score (0-100) for an organization with these metrics:
${JSON.stringify(metrics, null, 2)}

Higher score = more trustworthy. Consider:
- Resolution rate (resolved/total)
- Speed (lower avgResolutionDays = better)
- No overdue issues
- High citizen/employee rating
- No flagged transactions

JSON: {"score":72,"reasoning":"2 sentence explanation","improvements":["improvement1","improvement2","improvement3"]}`;

  const raw = await callNvidia(sys, usr);
  return extractJson(raw);
}

// ── 6. PREDICTIVE ANALYTICS ──────────────────────────────────────

export async function generatePredictions(historicalData: {
  issueCountsByMonth: number[];
  categoryTrends: Record<string, number>;
  resolutionRates: number[];
}): Promise<{
  nextMonthIssueCount: number;
  riskAreas: string[];
  recommendations: string[];
  confidence: number;
}> {
  const sys = `You are a predictive analytics AI for organizational management. Always respond ONLY with valid JSON.`;
  const usr = `Based on this historical data, predict next month's trends:
${JSON.stringify(historicalData, null, 2)}

JSON: {"nextMonthIssueCount":45,"riskAreas":["area1","area2"],"recommendations":["action1","action2"],"confidence":0.78}`;

  const raw = await callNvidia(sys, usr);
  return extractJson(raw);
}

// ── Legacy aliases for backward compatibility ─────────────────────
export const classifyComplaint = (text: string) => classifyIssue(text, '', 'government');
export const detectFundAnomaly = (tx: object) => detectAnomaly(tx, 'government');
export const governmentChatbot = (q: string) => chatbot(q, 'english', 'government', 'AI TrustOS');
// Old single-language alias
export const chatbotResponse = (
  question: string,
  workspaceType: string,
  workspaceName: string
) => chatbot(question, 'english', workspaceType, workspaceName);

// ── 7. PREDICTIVE MACHINE HEALTH (IndustrialAI) ──────────────────

export async function predictMachineHealth(params: {
  machineName: string;
  recentSymptoms: string[];
  daysSinceLastMaintenance: number;
  currentHealthScore: number;
}): Promise<{
  failureProbability: number;
  predictedFailureDays: number | null;
  recommendedAction: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}> {
  const sys = `You are a predictive maintenance AI for industrial machinery. Always respond ONLY with valid JSON.`;
  const usr = `Analyze this machine for failure risk:
Machine: ${params.machineName}
Health Score: ${params.currentHealthScore}/100
Days since last maintenance: ${params.daysSinceLastMaintenance}
Recent symptoms:
${params.recentSymptoms.map((s, i) => `${i + 1}. ${s}`).join('\n')}

JSON: {"failureProbability":0.65,"predictedFailureDays":14,"recommendedAction":"Schedule preventive maintenance within 7 days","urgency":"high"}`;
  const raw = await callNvidia(sys, usr);
  return extractJson(raw);
}

// ── 8. QUALITY GATE ANALYSIS (IndustrialAI) ──────────────────────

export async function analyzeQualityReading(params: {
  productName: string;
  stageName: string;
  parameter: string;
  actualValue: string;
  acceptableRange: string;
  previousReadings: string[];
}): Promise<{
  result: 'Pass' | 'Fail' | 'Hold';
  defectProbability: number;
  rootCause: string;
  correctionAdvice: string;
}> {
  const sys = `You are a quality control AI for manufacturing. Always respond ONLY with valid JSON.`;
  const usr = `Analyze quality reading:
Product: ${params.productName}
Stage: ${params.stageName}
Parameter: ${params.parameter}
Actual Value: ${params.actualValue}
Acceptable Range: ${params.acceptableRange}
Previous readings: ${params.previousReadings.join(', ') || 'none'}

JSON: {"result":"Pass","defectProbability":0.12,"rootCause":"None detected","correctionAdvice":"Continue monitoring"}`;
  const raw = await callNvidia(sys, usr);
  return extractJson(raw);
}

// ── 9. SUPPLIER RISK SCORING (IndustrialAI) ──────────────────────

export async function scoreSupplierRisk(params: {
  supplierName: string;
  onTimeRate: number;
  qualityPassRate: number;
  totalOrders: number;
  recentIssues: string[];
}): Promise<{
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  riskScore: number;
  recommendation: string;
  issuesIdentified: string[];
}> {
  const sys = `You are a supply chain risk analyst AI. Always respond ONLY with valid JSON.`;
  const usr = `Score this supplier's risk:
Supplier: ${params.supplierName}
On-time delivery rate: ${params.onTimeRate}%
Quality pass rate: ${params.qualityPassRate}%
Total orders: ${params.totalOrders}
Recent issues: ${params.recentIssues.join('; ') || 'None'}

JSON: {"riskLevel":"Medium","riskScore":45,"recommendation":"Monitor closely, request corrective action plan","issuesIdentified":["issue1","issue2"]}`;
  const raw = await callNvidia(sys, usr);
  return extractJson(raw);
}

// ── 10. MEETING INTELLIGENCE (EnterpriseAI) ──────────────────────

export async function analyzeMeeting(transcript: string): Promise<{
  summary: string;
  actionItems: Array<{ task: string; assignee: string; deadline: string }>;
  effectivenessScore: number;
  keyDecisions: string[];
}> {
  const sys = `You are a meeting intelligence AI. Always respond ONLY with valid JSON.`;
  const truncated = transcript.substring(0, 3000);
  const usr = `Analyze this meeting transcript:
---
${truncated}
---

JSON: {"summary":"2-3 sentence summary","actionItems":[{"task":"task description","assignee":"person name or role","deadline":"date or timeframe"}],"effectivenessScore":72,"keyDecisions":["decision1","decision2"]}`;
  const raw = await callNvidia(sys, usr, 1000);
  return extractJson(raw);
}

// ── 11. PULSE ANALYSIS (EnterpriseAI) ────────────────────────────

export async function analyzePulseData(params: {
  avgWorkload: number;
  avgSatisfaction: number;
  avgManagement: number;
  comments: string[];
  departmentName: string;
}): Promise<{
  overallHealth: 'Healthy' | 'At Risk' | 'Critical';
  themes: string[];
  insights: string;
  recommendations: string[];
}> {
  const sys = `You are an organizational health analyst AI. Always respond ONLY with valid JSON.`;
  const usr = `Analyze employee pulse check data for ${params.departmentName}:
Avg Workload Score: ${params.avgWorkload.toFixed(1)}/5
Avg Satisfaction Score: ${params.avgSatisfaction.toFixed(1)}/5
Avg Management Score: ${params.avgManagement.toFixed(1)}/5
Sample comments: ${params.comments.slice(0, 5).join(' | ') || 'None provided'}

JSON: {"overallHealth":"At Risk","themes":["workload stress","communication gaps"],"insights":"2 sentence analysis","recommendations":["action1","action2","action3"]}`;
  const raw = await callNvidia(sys, usr);
  return extractJson(raw);
}

// ── 12. SAFETY INCIDENT ANALYSIS (IndustrialAI) ──────────────────

export async function analyzeSafetyIncident(params: {
  type: string;
  description: string;
  location?: string;
  severity?: string;
}): Promise<{
  rootCauses: string[];
  correctiveActions: string[];
  preventiveMeasures: string[];
  regulatoryReference: string;
}> {
  const sys = `You are an industrial safety and HSE (Health, Safety, Environment) expert AI. Always respond ONLY with valid JSON.`;
  const usr = `Analyze this safety incident:
Type: ${params.type}
Severity: ${params.severity || 'Unknown'}
Location: ${params.location || 'Unspecified'}
Description: ${params.description}

JSON: {"rootCauses":["cause1","cause2"],"correctiveActions":["action1","action2","action3"],"preventiveMeasures":["measure1","measure2"],"regulatoryReference":"Relevant standard or regulation"}`;
  const raw = await callNvidia(sys, usr);
  return extractJson(raw);
}

