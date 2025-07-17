export function dateToInputValue(date: Date | string | null | undefined): string {
  if (!date) return "";
  try {
    return new Date(date).toISOString().split("T")[0];
  } catch {
    return "";
  }
}