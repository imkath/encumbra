"use client";

import { useState, useEffect } from "react";
import {
  getActiveAlerts,
  deleteAlert,
  getTimeUntilAlert,
  formatAlertTime,
  type Alert,
} from "@/lib/notifications";
import {
  FaBell,
  FaTrash,
  FaClock,
  FaMapMarkerAlt,
  FaWind,
} from "react-icons/fa";

export function AlertsList() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const loadAlerts = () => {
    setAlerts(getActiveAlerts());
  };

  useEffect(() => {
    loadAlerts();

    // Actualizar cada minuto
    const interval = setInterval(loadAlerts, 60 * 1000);

    // Escuchar cambios en localStorage (para sincronizar entre pestañas)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "encumbra_alerts" || e.key === null) {
        loadAlerts();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // También escuchar un evento personalizado para cambios en la misma pestaña
    const handleCustomEvent = () => {
      loadAlerts();
    };

    window.addEventListener("alertsChanged", handleCustomEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("alertsChanged", handleCustomEvent);
    };
  }, []);

  const handleDelete = (alertId: string) => {
    deleteAlert(alertId);
    loadAlerts();
    // Disparar evento personalizado para sincronizar
    window.dispatchEvent(new Event("alertsChanged"));
  };

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-purple-950/30 dark:to-violet-950/30 rounded-2xl shadow-lg border-2 border-brand-200 dark:border-purple-700/50 p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-brand-500 dark:bg-purple-600 p-2 rounded-lg">
          <FaBell className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            Alertas Activas
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Te notificaremos cuando llegue el momento
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm border border-brand-100 dark:border-purple-700/50 hover:shadow-md dark:hover:shadow-black/40 transition-shadow"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                {/* Parque */}
                <div className="flex items-center gap-2">
                  <div className="bg-red-500 dark:bg-red-600 p-1.5 rounded">
                    <FaMapMarkerAlt className="w-3 h-3 text-white" />
                  </div>
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">
                    {alert.parkName}
                  </span>
                </div>

                {/* Horario de la ventana */}
                <div className="flex items-center gap-2 text-sm">
                  <div className="bg-amber-500 dark:bg-amber-600 p-1.5 rounded">
                    <FaClock className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {formatAlertTime(alert.windowStart)} -{" "}
                    {formatAlertTime(alert.windowEnd)}
                  </span>
                </div>

                {/* Viento */}
                <div className="flex items-center gap-2 text-sm">
                  <div className="bg-cyan-500 dark:bg-cyan-600 p-1.5 rounded">
                    <FaWind className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {Math.round(alert.meanSpeed)} km/h · Calidad:{" "}
                    {Math.round(alert.score)}/100
                  </span>
                </div>

                {/* Tiempo restante */}
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="bg-green-500 dark:bg-green-600 p-1.5 rounded">
                    <FaBell className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                    Alerta: {getTimeUntilAlert(alert.notifyAt)}
                  </span>
                </div>
              </div>

              {/* Botón eliminar */}
              <button
                onClick={() => handleDelete(alert.id)}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                aria-label="Eliminar alerta"
                title="Eliminar alerta"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-700/50">
        <p className="text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
          <FaBell className="w-3.5 h-3.5" />
          <span>
            Mantén la pestaña abierta o habilita notificaciones push para
            recibir las alertas
          </span>
        </p>
      </div>
    </div>
  );
}
