import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function greetingForHour(hour: number): { pt: string; en: string } {
  if (hour < 12) return { pt: "Bom dia", en: "Good morning" };
  if (hour < 20) return { pt: "Boa tarde", en: "Good afternoon" };
  return { pt: "Boa noite", en: "Good evening" };
}

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function yesterdayKey(d = new Date()): string {
  const y = new Date(d);
  y.setDate(y.getDate() - 1);
  return todayKey(y);
}

/** YYYY-MM-DD from a date column, ISO string, or Date. */
export function asDayKey(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return todayKey(value);
  const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] ?? null;
}

/** Lowercase, collapse space, strip combining marks — kind to typed answers. */
export function normalizePt(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[“”"'`]/g, "")
    .replace(/[.,!?…:;]/g, "");
}

export function answersMatch(input: string, accepted: string[]): boolean {
  const got = normalizePt(input);
  if (!got) return false;
  return accepted.some((a) => normalizePt(a) === got);
}
