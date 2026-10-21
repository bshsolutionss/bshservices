/** "3 days overdue", "Due today", "Due in 2 days" - words, not just colour. daysLate > 0 means overdue. */
export function dueText(daysLate: number): string {
  if (daysLate > 1) return `${daysLate} days overdue`;
  if (daysLate === 1) return "1 day overdue";
  if (daysLate === 0) return "Due today";
  if (daysLate === -1) return "Due tomorrow";
  return `Due in ${-daysLate} days`;
}

/** Whole days between an ISO due date and an ISO "today" (positive = overdue). */
export function daysLateOf(dueIso: string, todayIso: string): number {
  return Math.round((Date.parse(`${todayIso}T00:00:00Z`) - Date.parse(`${dueIso}T00:00:00Z`)) / 86_400_000);
}
