"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaInfoCircle, FaTimes, FaChartLine } from "react-icons/fa";

export function ScoreInfoTooltip() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const modalContent =
    isOpen && mounted ? (
      <>
        {/* Overlay con blur */}
        <div
          className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-[9999]"
          onClick={() => setIsOpen(false)}
        />

        {/* Modal centrado y fijo */}
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
          <div className="pointer-events-auto bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header fijo */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-purple-600 dark:to-violet-600 p-6 rounded-t-2xl flex items-start justify-between flex-shrink-0">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Q-Score: Índice Volantín
                </h3>
                <p className="text-blue-50 dark:text-purple-100 text-sm">
                  Tu guía para saber cuándo volar
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                aria-label="Cerrar"
              >
                <FaTimes className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Contenido con scroll */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Explicación principal */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-purple-950/30 dark:to-violet-950/30 border border-blue-200 dark:border-purple-700/50 rounded-xl p-5">
                <p className="text-neutral-700 dark:text-neutral-200 leading-relaxed">
                  El{" "}
                  <strong className="text-blue-700 dark:text-purple-400">
                    Q-Score
                  </strong>{" "}
                  es un puntaje de <strong>0 a 100</strong> que indica qué tan
                  buenas son las condiciones de viento para volar volantín.
                  Combina velocidad, ráfagas y estabilidad.
                </p>
              </div>

              {/* Rangos de puntaje - Grid de 2 columnas en desktop */}
              <div>
                <h4 className="font-bold text-neutral-900 dark:text-neutral-100 mb-4 text-lg">
                  Rangos de Calificación
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Excelente */}
                  <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border-2 border-green-200 dark:border-green-700/50">
                    <div className="flex-shrink-0 w-16 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600 text-white font-bold flex items-center justify-center shadow-lg text-sm">
                      80+
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-green-700 dark:text-green-400 mb-1">
                        Excelente
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-300">
                        Condiciones ideales. ¡Vuela con confianza!
                      </div>
                    </div>
                  </div>

                  {/* Bueno */}
                  <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl border-2 border-blue-200 dark:border-blue-700/50">
                    <div className="flex-shrink-0 w-16 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-sky-500 dark:from-blue-600 dark:to-cyan-600 text-white font-bold flex items-center justify-center shadow-lg text-sm">
                      60-79
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-blue-700 dark:text-blue-400 mb-1">
                        Bueno
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-300">
                        Muy buenas condiciones para volar
                      </div>
                    </div>
                  </div>

                  {/* Marginal */}
                  <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 rounded-xl border-2 border-yellow-200 dark:border-yellow-700/50">
                    <div className="flex-shrink-0 w-16 h-12 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 dark:from-yellow-600 dark:to-amber-600 text-white font-bold flex items-center justify-center shadow-lg text-sm">
                      40-59
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-yellow-700 dark:text-yellow-400 mb-1">
                        Marginal
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-300">
                        Posible con ajustes. Usa cola más larga
                      </div>
                    </div>
                  </div>

                  {/* No recomendado */}
                  <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 rounded-xl border-2 border-red-200 dark:border-red-700/50">
                    <div className="flex-shrink-0 w-16 h-12 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 dark:from-red-600 dark:to-orange-600 text-white font-bold flex items-center justify-center shadow-lg text-sm">
                      0-39
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-red-700 dark:text-red-400 mb-1">
                        No recomendado
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-300">
                        Condiciones muy débiles o muy fuertes
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Qué considera el score */}
              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
                <h4 className="font-bold text-neutral-900 dark:text-neutral-100 mb-4 text-lg">
                  ¿Qué factores considera?
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-purple-400 mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-neutral-900 dark:text-neutral-100">
                        Velocidad ideal:
                      </strong>
                      <span className="text-neutral-600 dark:text-neutral-300 ml-1">
                        Entre 16-22 km/h es el rango perfecto
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-purple-400 mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-neutral-900 dark:text-neutral-100">
                        Ráfagas:
                      </strong>
                      <span className="text-neutral-600 dark:text-neutral-300 ml-1">
                        Penaliza viento muy gustoso (inestable)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-purple-400 mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-neutral-900 dark:text-neutral-100">
                        Extremos:
                      </strong>
                      <span className="text-neutral-600 dark:text-neutral-300 ml-1">
                        Muy bajo (&lt;8 km/h) o muy alto (&gt;35 km/h) no son
                        recomendados
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer info */}
              <div className="bg-blue-50 dark:bg-purple-950/30 border border-blue-200 dark:border-purple-700/50 rounded-xl p-4 text-sm text-neutral-600 dark:text-neutral-300">
                <div className="flex items-center gap-2 mb-2">
                  <FaInfoCircle className="w-4 h-4 text-blue-600 dark:text-purple-400" />
                  <strong className="text-neutral-900 dark:text-neutral-100">
                    Actualización de datos
                  </strong>
                </div>
                <p className="text-sm">
                  Los pronósticos se actualizan cada 30 minutos desde
                  Open-Meteo, uno de los servicios meteorológicos más precisos
                  del mundo.
                </p>
              </div>
            </div>

            {/* Footer fijo con botón - fuera del scroll */}
            <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-b-2xl flex-shrink-0">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-purple-600 dark:to-violet-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-cyan-600 dark:hover:from-purple-700 dark:hover:to-violet-700 shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      </>
    ) : null;

  return (
    <>
      {/* Botón mejorado - más visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-purple-950/30 dark:to-violet-950/30 border border-blue-200 dark:border-purple-700/50 hover:from-blue-100 hover:to-cyan-100 dark:hover:from-purple-950/50 dark:hover:to-violet-950/50 transition-all duration-200 hover:shadow-md cursor-pointer"
        aria-label="Información sobre puntajes"
      >
        <FaChartLine className="w-4 h-4 text-blue-600 dark:text-purple-400" />
        <span className="text-sm font-semibold text-blue-700 dark:text-purple-300 hidden sm:inline">
          ¿Qué es Q-Score?
        </span>
        <FaInfoCircle className="w-4 h-4 text-blue-600 dark:text-purple-400 sm:hidden" />
      </button>

      {/* Portal para renderizar el modal en el body */}
      {mounted && typeof window !== "undefined"
        ? createPortal(modalContent, document.body)
        : null}
    </>
  );
}
