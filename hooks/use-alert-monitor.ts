"use client";

import { useEffect, useCallback } from "react";
import {
  checkPendingAlerts,
  markAlertAsNotified,
  showBrowserNotification,
  cleanupOldAlerts,
  formatAlertTime,
  type Alert,
} from "@/lib/notifications";

export function useAlertMonitor() {
  const checkAndNotify = useCallback(() => {
    const pendingAlerts = checkPendingAlerts();

    pendingAlerts.forEach((alert) => {
      // Mostrar notificación del navegador
      showBrowserNotification(`🪁 ¡Es hora de volar en ${alert.parkName}!`, {
        body: `La ventana ideal comienza en 30 minutos (${formatAlertTime(
          alert.windowStart
        )}). Viento: ${Math.round(alert.meanSpeed)} km/h`,
        tag: alert.id,
        requireInteraction: true,
      });

      // Vibrar en mobile si está disponible
      if ("vibrate" in navigator) {
        navigator.vibrate([200, 100, 200]);
      }

      // Reproducir sonido si está disponible
      try {
        const audio = new Audio("/notification-sound.mp3");
        audio.volume = 0.5;
        audio.play().catch(() => {
          // Silencioso - no hay permisos de audio
        });
      } catch (error) {
        // Audio no disponible
      }

      // Marcar como notificada
      markAlertAsNotified(alert.id);
    });

    // Limpiar alertas antiguas cada verificación
    cleanupOldAlerts();
  }, []);

  useEffect(() => {
    // Verificar inmediatamente al montar
    checkAndNotify();

    // Verificar cada 1 minuto
    const interval = setInterval(() => {
      checkAndNotify();
    }, 60 * 1000); // 1 minuto

    return () => clearInterval(interval);
  }, [checkAndNotify]);

  // Verificar cuando la pestaña vuelve a estar visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAndNotify();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkAndNotify]);
}
