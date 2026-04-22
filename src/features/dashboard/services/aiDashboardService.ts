import { GoogleGenAI } from "@google/genai";
import { unstable_cache } from "next/cache";
import { buildDrYoshiMessage } from "./dashboardService";

export interface DrYoshiContext {
  displayName: string;
  totalIncome: number;
  totalExpense: number;
  savingRate: number;
  topCategory: string | null;
  activeLoansCount: number;
  activeGoalsCount: number;
  month: string;
}

const SYSTEM_PROMPT = `You are Dr. Yoshi, a friendly and encouraging personal finance advisor inside a budgeting app called SpendIngket. 
Your role is to give the user a short, personalized, and motivating financial insight based on their monthly snapshot.
Guidelines:
- Write exactly 2-3 sentences. Be concise.
- Use the user's first name naturally (once).
- Be warm, positive, and actionable — not preachy or alarming.
- If they are overspending, be empathetic and suggest awareness, not guilt.
- If they have active loans, briefly acknowledge the importance of staying on track.
- If they have savings goals, give a brief encouraging nod.
- Do NOT use markdown formatting, bullet points, or emojis.
- Respond with plain text only.`;

function buildUserMessage(ctx: DrYoshiContext): string {
  const lines: string[] = [
    `User: ${ctx.displayName}`,
    `Month: ${ctx.month}`,
    `Total Income: ₱${ctx.totalIncome.toFixed(2)}`,
    `Total Expenses: ₱${ctx.totalExpense.toFixed(2)}`,
    `Saving Rate: ${ctx.savingRate.toFixed(1)}%`,
  ];

  if (ctx.topCategory) {
    lines.push(`Top Spending Category: ${ctx.topCategory}`);
  }
  if (ctx.activeLoansCount > 0) {
    lines.push(`Active Loans: ${ctx.activeLoansCount}`);
  }
  if (ctx.activeGoalsCount > 0) {
    lines.push(`Active Savings Goals: ${ctx.activeGoalsCount}`);
  }

  return lines.join("\n");
}

async function callGemini(ctx: DrYoshiContext): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return buildDrYoshiMessage(
      ctx.displayName,
      ctx.totalIncome,
      ctx.totalExpense
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: buildUserMessage(ctx),
      config: {
        systemInstruction: SYSTEM_PROMPT,
        maxOutputTokens: 120,
        temperature: 0.75,
      },
    });

    const message = response.text?.trim();
    if (!message) {
      return buildDrYoshiMessage(
        ctx.displayName,
        ctx.totalIncome,
        ctx.totalExpense
      );
    }
    return message;
  } catch (err) {
    console.error("Error calling Gemini API:", err);
    return buildDrYoshiMessage(
      ctx.displayName,
      ctx.totalIncome,
      ctx.totalExpense
    );
  }
}

// Module-level cache — survives hot reloads in dev, cleared only on full server restart.
// Acts as a first guard before unstable_cache (filesystem) to avoid burning API quota.
const _memCache = new Map<string, { value: string; expiresAt: number }>();

export async function buildDrYoshiAIMessage(
  ctx: DrYoshiContext
): Promise<string> {
  const cacheKey = `dr-yoshi-${ctx.displayName}-${ctx.month}-${Math.round(ctx.totalIncome)}-${Math.round(ctx.totalExpense)}`;

  // 1. Check in-memory cache (1 hour TTL)
  const hit = _memCache.get(cacheKey);
  if (hit && hit.expiresAt > Date.now()) {
    return hit.value;
  }

  // 2. Next.js filesystem cache (24 hour TTL — persists across restarts in prod)
  const cached = unstable_cache(
    () => callGemini(ctx),
    [cacheKey],
    { revalidate: 86400 }
  );
  const value = await cached();

  // 3. Store in memory cache
  _memCache.set(cacheKey, { value, expiresAt: Date.now() + 3_600_000 });
  return value;
}
