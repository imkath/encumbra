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

    return () => clearInterval(interval);
  }, []);

  const handleDelete = (alertId: string) => {
    deleteAlert(alertId);
    loadAlerts();
  };

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg border-2 border-brand-200 p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-brand-500 p-2 rounded-lg">
          <FaBell className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-900">
            Alertas Activas
          </h3>
          <p className="text-xs text-neutral-600">
            Te notificaremos cuando llegue el momento
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-white rounded-xl p-4 shadow-sm border border-brand-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                {/* Parque */}
                <div className="flex items-center gap-2">
                  <div className="bg-red-500 p-1.5 rounded">
                    <FaMapMarkerAlt className="w-3 h-3 text-white" />
                  </div>
                  <span className="font-bold text-neutral-900">
                    {alert.parkName}
                  </span>
                </div>

                {/* Horario de la ventana */}
                <div className="flex items-center gap-2 text-sm">
                  <div className="bg-amber-500 p-1.5 rounded">
                    <FaClock className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-neutral-700">
                    {formatAlertTime(alert.windowStart)} -{" "}
                    {formatAlertTime(alert.windowEnd)}
                  </span>
                </div>

                {/* Viento */}
                <div className="flex items-center gap-2 text-sm">
                  <div className="bg-cyan-500 p-1.5 rounded">
                    <FaWind className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-neutral-700">
                    {Math.round(alert.meanSpeed)} km/h · Calidad:{" "}
                    {Math.round(alert.score)}/100
                  </span>
                </div>

                {/* Tiempo restante */}
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-neutral-200">
                  <div className="bg-green-500 p-1.5 rounded">
                    <FaBell className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-green-700">
                    Alerta: {getTimeUntilAlert(alert.notifyAt)}
                  </span>
                </div>
              </div>

              {/* Botón eliminar */}
              <button
                onClick={() => handleDelete(alert.id)}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600 hover:text-red-700"
                aria-label="Eliminar alerta"
                title="Eliminar alerta"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-800 flex items-center gap-2">
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
