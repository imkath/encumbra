"use client";

import React from "react";
import { FaTimes, FaCog, FaWind, FaRuler, FaCheckCircle } from "react-icons/fa";

type KiteProfile = "liviano" | "estandar" | "acrobatico";
type WindUnits = "kmh" | "ms" | "kn";

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
  profile: KiteProfile;
  setProfile: (p: KiteProfile) => void;
  units: WindUnits;
  setUnits: (u: WindUnits) => void;
}

export function SettingsSheet({
  open,
  onClose,
  profile,
  setProfile,
  units,
  setUnits,
}: SettingsSheetProps) {
  // Prevenir scroll del body cuando el modal está abierto
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full md:max-w-2xl rounded-2xl bg-white shadow-2xl border border-neutral-200 max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header con gradiente - FIJO */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 rounded-t-2xl flex items-start justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 p-2 rounded-lg">
                <FaCog className="h-6 w-6 text-white" />
              </div>
              <h2 id="settings-title" className="text-2xl font-bold text-white">
                Personaliza tu experiencia
              </h2>
            </div>
            <p className="text-blue-50 text-sm">
              Ajusta los pronósticos según tu tipo de volantín
            </p>
          </div>
          <button
            className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
            onClick={onClose}
            aria-label="Cerrar ajustes"
          >
            <FaTimes className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Tipo de volantín */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FaWind className="w-5 h-5 text-blue-600" />
              <label className="text-lg font-bold text-neutral-900">
                Tipo de volantín
              </label>
            </div>
            <p className="text-sm text-neutral-600 mb-4">
              Esto ajusta los umbrales de viento y las recomendaciones
            </p>
            <div className="grid grid-cols-1 gap-3">
              {(
                [
                  {
                    key: "liviano",
                    label: "Liviano infantil",
                    desc: "Menor resistencia al viento",
                    emoji: "🪁",
                    color: "blue",
                  },
                  {
                    key: "estandar",
                    label: "Estándar",
                    desc: "Papel tradicional con cola",
                    emoji: "🎯",
                    color: "green",
                  },
                  {
                    key: "acrobatico",
                    label: "Acrobático",
                    desc: "Mayor tolerancia a ráfagas",
                    emoji: "⚡",
                    color: "purple",
                  },
                ] as const
              ).map((option) => {
                const isSelected = profile === option.key;
                return (
                  <button
                    key={option.key}
                    onClick={() => setProfile(option.key)}
                    className={`relative text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 group cursor-pointer ${
                      isSelected
                        ? "border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg"
                        : "border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 hover:shadow-md"
                    }`}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl flex-shrink-0">
                        {option.emoji}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-neutral-900">
                            {option.label}
                          </div>
                          {isSelected && (
                            <FaCheckCircle className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div className="text-sm text-neutral-600 mt-1">
                          {option.desc}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Unidades de viento */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FaRuler className="w-5 h-5 text-blue-600" />
              <label className="text-lg font-bold text-neutral-900">
                Unidades de viento
              </label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  { key: "kmh", label: "km/h", desc: "Kilómetros por hora" },
                  { key: "ms", label: "m/s", desc: "Metros por segundo" },
                  { key: "kn", label: "kt", desc: "Nudos" },
                ] as const
              ).map((option) => {
                const isSelected = units === option.key;
                return (
                  <button
                    key={option.key}
                    onClick={() => setUnits(option.key)}
                    className={`px-4 py-3 rounded-xl border-2 text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer ${
                      isSelected
                        ? "border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-md"
                        : "border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300"
                    }`}
                    aria-pressed={isSelected}
                    title={option.desc}
                  >
                    <div
                      className={`font-bold text-lg ${
                        isSelected ? "text-blue-600" : "text-neutral-700"
                      }`}
                    >
                      {option.label}
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                      {option.desc}
                    </div>
                    {isSelected && (
                      <FaCheckCircle className="w-4 h-4 text-blue-600 mx-auto mt-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Información sobre parámetros */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-5">
            <h3 className="font-bold text-neutral-900 mb-3 flex items-center gap-2">
              <FaCheckCircle className="w-5 h-5 text-blue-600" />
              Configuración actual
            </h3>
            <div className="space-y-2.5 text-sm text-neutral-700">
              {profile === "liviano" && (
                <>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <span>
                      <strong>Score mínimo:</strong> 60 (condiciones más suaves)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <span>
                      <strong>Factor de ráfagas máx:</strong> 1.3 (viento más
                      estable)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <span>
                      <strong>Ideal para:</strong> Niños y principiantes
                    </span>
                  </div>
                </>
              )}
              {profile === "estandar" && (
                <>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                    <span>
                      <strong>Score mínimo:</strong> 70 (condiciones óptimas)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                    <span>
                      <strong>Factor de ráfagas máx:</strong> 1.35 (equilibrado)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                    <span>
                      <strong>Ideal para:</strong> Uso general y recreativo
                    </span>
                  </div>
                </>
              )}
              {profile === "acrobatico" && (
                <>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                    <span>
                      <strong>Score mínimo:</strong> 65 (rango amplio)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                    <span>
                      <strong>Factor de ráfagas máx:</strong> 1.45 (tolera
                      ráfagas)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                    <span>
                      <strong>Ideal para:</strong> Maniobras y acrobacias
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer fijo con botón - fuera del scroll */}
        <div className="p-6 border-t border-neutral-200 bg-white rounded-b-2xl flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold text-lg hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <FaCheckCircle className="w-5 h-5" />
            Aplicar y continuar
          </button>
        </div>
      </div>
    </div>
  );
}
