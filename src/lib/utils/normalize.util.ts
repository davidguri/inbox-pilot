export function normEmail(e?: string | null) {
  return e ? e.trim().toLowerCase() : null;
}