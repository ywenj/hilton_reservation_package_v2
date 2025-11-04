import dayjs, { Dayjs } from "dayjs";

/**
 * Safely format a date/time value into a consistent string.
 * Accepts ISO string, Date, dayjs instance, or null/undefined.
 */
export function formatDateTime(
  value: string | Date | Dayjs | null | undefined,
  format: string = "YYYY-MM-DD HH:mm"
): string {
  if (value == null) return "-";
  const d = dayjs(value);
  if (!d.isValid()) return String(value);
  return d.format(format);
}
