"use client";

export interface Alert {
  id: string;
  parkName: string;
  parkId: string;
  windowStart: string; // ISO timestamp
  windowEnd: string;
  meanSpeed: number;
  score: number;
  notifyAt: string; // ISO timestamp (30 min antes)
  createdAt: string;
  notified: boolean;
}

const STORAGE_KEY = "encumbra_alerts";

/**
 * Solicita permiso para notificaciones del navegador
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.warn("Este navegador no soporta notificaciones");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

/**
 * Muestra una notificación del navegador
 */
export function showBrowserNotification(
  title: string,
  options: NotificationOptions
) {
  if (Notification.permission === "granted") {
    new Notification(title, {
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      ...options,
    });
  }
}

/**
 * Guarda una alerta en localStorage
 */
export function saveAlert(
  alert: Omit<Alert, "id" | "createdAt" | "notified">
): Alert {
  const alerts = getAlerts();

  const newAlert: Alert = {
    ...alert,
    id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    notified: false,
  };

  alerts.push(newAlert);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));

  return newAlert;
}

/**
 * Obtiene todas las alertas guardadas
 */
export function getAlerts(): Alert[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error al cargar alertas:", error);
    return [];
  }
}

/**
 * Obtiene alertas activas (no notificadas y futuras)
 */
export function getActiveAlerts(): Alert[] {
  const alerts = getAlerts();
  const now = new Date();

  return alerts.filter((alert) => {
    const windowStart = new Date(alert.windowStart);
    return !alert.notified && windowStart > now;
  });
}

/**
 * Marca una alerta como notificada
 */
export function markAlertAsNotified(alertId: string) {
  const alerts = getAlerts();
  const updated = alerts.map((alert) =>
    alert.id === alertId ? { ...alert, notified: true } : alert
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

/**
 * Elimina una alerta
 */
export function deleteAlert(alertId: string) {
  const alerts = getAlerts();
  const filtered = alerts.filter((alert) => alert.id !== alertId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Elimina alertas antiguas (más de 24 horas pasadas)
 */
export function cleanupOldAlerts() {
  const alerts = getAlerts();
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const active = alerts.filter((alert) => {
    const windowStart = new Date(alert.windowStart);
    return windowStart > oneDayAgo;
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(active));
}

/**
 * Verifica si hay alertas que deben notificarse
 */
export function checkPendingAlerts(): Alert[] {
  const alerts = getActiveAlerts();
  const now = new Date();

  return alerts.filter((alert) => {
    const notifyAt = new Date(alert.notifyAt);
    // Notificar si ya pasó la hora de notificación pero no se ha notificado
    return notifyAt <= now && !alert.notified;
  });
}

/**
 * Formatea la hora de una ventana
 */
export function formatAlertTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Calcula el tiempo restante hasta una alerta
 */
export function getTimeUntilAlert(isoString: string): string {
  const target = new Date(isoString);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();

  if (diffMs < 0) return "Ya pasó";

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `En ${diffDays} día${diffDays > 1 ? "s" : ""}`;
  } else if (diffHours > 0) {
    return `En ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
  } else if (diffMinutes > 0) {
    return `En ${diffMinutes} minuto${diffMinutes > 1 ? "s" : ""}`;
  } else {
    return "En menos de 1 minuto";
  }
}
