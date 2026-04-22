export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
}

export function getTodayLabel(): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
    .format(new Date())
    .toUpperCase();
}

export function buildDrYoshiMessage(
  displayName: string,
  totalIncome: number,
  totalExpense: number
): string {
  if (totalIncome === 0 && totalExpense === 0) {
    return `No transactions recorded yet this month, ${displayName}. Start tracking to unlock your spending insights!`;
  }
  if (totalExpense > totalIncome) {
    return `Heads up, ${displayName}! Your expenses are exceeding your income this month. Let's review your budget together.`;
  }
  const savingRate =
    totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
  if (savingRate >= 20) {
    return `Amazing, ${displayName}! You're saving ${Math.round(savingRate)}% of your income this month. You're crushing it!`;
  }
  return `You've used ${Math.round((totalExpense / totalIncome) * 100)}% of your income so far this month, ${displayName}. Keep an eye on those expenses!`;
}
