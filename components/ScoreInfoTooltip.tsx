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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
          onClick={() => setIsOpen(false)}
        />

        {/* Modal centrado y fijo */}
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
          <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header fijo */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 rounded-t-2xl flex items-start justify-between flex-shrink-0">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Q-Score: Índice Volantín
                </h3>
                <p className="text-blue-50 text-sm">
                  Tu guía para saber cuándo volar
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                aria-label="Cerrar"
              >
                <FaTimes className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Contenido con scroll */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Explicación principal */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-5">
                <p className="text-neutral-700 leading-relaxed">
                  El <strong className="text-blue-700">Q-Score</strong> es un
                  puntaje de <strong>0 a 100</strong> que indica qué tan buenas
                  son las condiciones de viento para volar volantín. Combina
                  velocidad, ráfagas y estabilidad.
                </p>
              </div>

              {/* Rangos de puntaje - Grid de 2 columnas en desktop */}
              <div>
                <h4 className="font-bold text-neutral-900 mb-4 text-lg">
                  Rangos de Calificación
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Excelente */}
                  <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                    <div className="flex-shrink-0 w-16 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold flex items-center justify-center shadow-lg text-sm">
                      80+
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-green-700 mb-1">
                        Excelente
                      </div>
                      <div className="text-sm text-neutral-600">
                        Condiciones ideales. ¡Vuela con confianza!
                      </div>
                    </div>
                  </div>

                  {/* Bueno */}
                  <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl border-2 border-blue-200">
                    <div className="flex-shrink-0 w-16 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-sky-500 text-white font-bold flex items-center justify-center shadow-lg text-sm">
                      60-79
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-blue-700 mb-1">Bueno</div>
                      <div className="text-sm text-neutral-600">
                        Muy buenas condiciones para volar
                      </div>
                    </div>
                  </div>

                  {/* Marginal */}
                  <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border-2 border-yellow-200">
                    <div className="flex-shrink-0 w-16 h-12 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold flex items-center justify-center shadow-lg text-sm">
                      40-59
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-yellow-700 mb-1">
                        Marginal
                      </div>
                      <div className="text-sm text-neutral-600">
                        Posible con ajustes. Usa cola más larga
                      </div>
                    </div>
                  </div>

                  {/* No recomendado */}
                  <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-red-200">
                    <div className="flex-shrink-0 w-16 h-12 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold flex items-center justify-center shadow-lg text-sm">
                      0-39
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-red-700 mb-1">
                        No recomendado
                      </div>
                      <div className="text-sm text-neutral-600">
                        Condiciones muy débiles o muy fuertes
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Qué considera el score */}
              <div className="border-t border-neutral-200 pt-6">
                <h4 className="font-bold text-neutral-900 mb-4 text-lg">
                  ¿Qué factores considera?
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-neutral-900">
                        Velocidad ideal:
                      </strong>
                      <span className="text-neutral-600 ml-1">
                        Entre 16-22 km/h es el rango perfecto
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-neutral-900">Ráfagas:</strong>
                      <span className="text-neutral-600 ml-1">
                        Penaliza viento muy gustoso (inestable)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-neutral-900">Extremos:</strong>
                      <span className="text-neutral-600 ml-1">
                        Muy bajo (&lt;8 km/h) o muy alto (&gt;35 km/h) no son
                        recomendados
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-neutral-600">
                <div className="flex items-center gap-2 mb-2">
                  <FaInfoCircle className="w-4 h-4 text-blue-600" />
                  <strong className="text-neutral-900">
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
            <div className="p-6 border-t border-neutral-200 bg-white rounded-b-2xl flex-shrink-0">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 hover:from-blue-100 hover:to-cyan-100 transition-all duration-200 hover:shadow-md cursor-pointer"
        aria-label="Información sobre puntajes"
      >
        <FaChartLine className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-semibold text-blue-700 hidden sm:inline">
          ¿Qué es Q-Score?
        </span>
        <FaInfoCircle className="w-4 h-4 text-blue-600 sm:hidden" />
      </button>

      {/* Portal para renderizar el modal en el body */}
      {mounted && typeof window !== "undefined"
        ? createPortal(modalContent, document.body)
        : null}
    </>
  );
}
