import DashboardGreeting from "./DashboardGreeting";
import {
  buildDrYoshiAIMessage,
  type DrYoshiContext,
} from "@/features/dashboard/services/aiDashboardService";

export default async function DrYoshiGreeting(ctx: DrYoshiContext) {
  const message = await buildDrYoshiAIMessage(ctx);

  return <DashboardGreeting displayName={ctx.displayName} message={message} />;
}
