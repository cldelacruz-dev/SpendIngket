import OpenAI from "openai";
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

export async function buildDrYoshiAIMessage(
  ctx: DrYoshiContext
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return buildDrYoshiMessage(
      ctx.displayName,
      ctx.totalIncome,
      ctx.totalExpense
    );
  }

  try {
    const client = new OpenAI({ apiKey });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserMessage(ctx) },
      ],
      max_tokens: 120,
      temperature: 0.75,
    });

    const message = response.choices[0]?.message?.content?.trim();
    if (!message) {
      return buildDrYoshiMessage(
        ctx.displayName,
        ctx.totalIncome,
        ctx.totalExpense
      );
    }

    return message;
  } catch {
    return buildDrYoshiMessage(
      ctx.displayName,
      ctx.totalIncome,
      ctx.totalExpense
    );
  }
}
