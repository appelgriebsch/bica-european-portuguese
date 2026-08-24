import { todayKey } from "@/lib/utils";

const PREFS_KEY = "bica.reminder.v1";

export type ReminderPrefs = {
  enabled: boolean;
  /** Local wall-clock time, HH:MM */
  time: string;
  lastNotifiedDate: string | null;
};

const DEFAULTS: ReminderPrefs = {
  enabled: false,
  time: "08:00",
  lastNotifiedDate: null,
};

export function loadReminderPrefs(): ReminderPrefs {
  if (typeof window === "undefined") return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<ReminderPrefs>;
    return {
      enabled: Boolean(parsed.enabled),
      time: typeof parsed.time === "string" && /^\d{2}:\d{2}$/.test(parsed.time)
        ? parsed.time
        : DEFAULTS.time,
      lastNotifiedDate:
        typeof parsed.lastNotifiedDate === "string" ? parsed.lastNotifiedDate : null,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveReminderPrefs(prefs: ReminderPrefs) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* private mode */
  }
}

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!notificationsSupported()) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

/** True when preferred time has passed today and the user has not studied. */
export function shouldNudge(
  lastStudyDate: string | null,
  prefs: ReminderPrefs,
  now = new Date(),
): boolean {
  if (!prefs.enabled) return false;
  const today = todayKey(now);
  if (lastStudyDate === today) return false;
  if (prefs.lastNotifiedDate === today) return false;
  const [h, m] = prefs.time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return false;
  const target = new Date(now);
  target.setHours(h!, m!, 0, 0);
  return now.getTime() >= target.getTime();
}

/** ms until next preferred time (today if still ahead, else tomorrow). */
export function msUntilReminder(time: string, now = new Date()): number {
  const [h, m] = time.split(":").map(Number);
  const target = new Date(now);
  target.setHours(h ?? 8, m ?? 0, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return Math.max(0, target.getTime() - now.getTime());
}

const NOTIFICATION = {
  title: "Bica",
  body: "A bica is waiting. Five minutes is enough.",
  tag: "bica-daily",
  icon: "/icon-192.png",
  badge: "/icon-192.png",
};

export async function showDailyNudge(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  if (Notification.permission !== "granted") return false;
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg?.showNotification) {
      await reg.showNotification(NOTIFICATION.title, {
        body: NOTIFICATION.body,
        tag: NOTIFICATION.tag,
        icon: NOTIFICATION.icon,
        badge: NOTIFICATION.badge,
        // @ts-expect-error — not in all TS libs
        renotify: true,
      });
    } else {
      new Notification(NOTIFICATION.title, {
        body: NOTIFICATION.body,
        tag: NOTIFICATION.tag,
        icon: NOTIFICATION.icon,
      });
    }
    return true;
  } catch {
    return false;
  }
}

/** Mark today as notified so we do not spam. */
export function markNotifiedToday(prefs: ReminderPrefs): ReminderPrefs {
  const next = { ...prefs, lastNotifiedDate: todayKey() };
  saveReminderPrefs(next);
  return next;
}
