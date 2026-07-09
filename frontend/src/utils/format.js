import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

/** Formats a number as Indian Rupees: 48250 -> "₹48,250" */
export function formatCurrency(amount) {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Formats a number with Indian digit grouping: 12500 -> "12,500" */
export function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(Number(value) || 0);
}

/** "2026-07-06T10:00:00Z" -> "6 Jul 2026, 3:30 PM" */
export function formatDateTime(value) {
  if (!value) return "—";
  return dayjs(value).format("D MMM YYYY, h:mm A");
}

/** "2026-07-06" -> "6 Jul 2026" */
export function formatDate(value) {
  if (!value) return "—";
  return dayjs(value).format("D MMM YYYY");
}

/** "2026-07-06T10:00:00Z" -> "5 minutes ago" */
export function formatRelativeTime(value) {
  if (!value) return "—";
  return dayjs(value).fromNow();
}

/** "Priya Sharma" -> "PS" — used for avatar fallbacks */
export function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
