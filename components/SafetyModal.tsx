"use client";

import React from "react";
import {
  FaMapMarkerAlt,
  FaYarn,
  FaExclamationTriangle,
  FaFirstAid,
  FaTimes,
  FaCheck,
  FaTimes as FaX,
  FaExclamationCircle,
  FaPhoneAlt,
} from "react-icons/fa";

interface SafetyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: "donde" | "material" | "enredado" | "todos";
}

export function SafetyModal({
  open,
  onOpenChange,
  section = "todos",
}: SafetyModalProps) {
  const showAll = section === "todos";

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
      onOpenChange(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full md:max-w-2xl rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl border border-neutral-200 dark:border-neutral-700 max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header fijo con gradiente */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 dark:from-amber-600 dark:to-orange-600 p-6 rounded-t-2xl flex items-start justify-between flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {section === "donde" && "¿Dónde elevar tu volantín?"}
              {section === "material" && "Material correcto y seguro"}
              {section === "enredado" && "Si tu volantín se enreda"}
              {showAll && "Guía completa de seguridad"}
            </h2>
            <p className="text-orange-50 dark:text-amber-100 text-sm">
              {section === "donde" &&
                "Encuentra los mejores lugares para disfrutar tu volantín de forma segura."}
              {section === "material" &&
                "Usa siempre materiales seguros para protegerte a ti y a otros."}
              {section === "enredado" &&
                "Qué hacer y qué NO hacer si tu volantín queda atrapado."}
              {showAll &&
                "Vuela seguro y responsablemente. Lee estas recomendaciones importantes."}
            </p>
          </div>
          <button
            className="p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
            onClick={() => onOpenChange(false)}
            aria-label="Cerrar"
          >
            <FaTimes className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="space-y-4 p-6 overflow-y-auto flex-1">
          {/* Dónde elevar */}
          {(showAll || section === "donde") && (
            <div className="space-y-3 p-5 bg-gradient-to-br from-sky-50 to-sky-100 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl border-2 border-sky-300 dark:border-blue-700/50 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-sky-500 dark:bg-blue-600 p-2.5 rounded-lg">
                  <FaMapMarkerAlt className="text-white text-xl" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  Dónde elevar
                </h3>
              </div>
              <ul className="space-y-2.5 text-neutral-800 dark:text-neutral-200 text-sm">
                <li className="flex items-start gap-3">
                  <FaCheck className="text-sky-600 dark:text-blue-400 w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Parques abiertos con amplio espacio</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheck className="text-sky-600 dark:text-blue-400 w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Lejos de tendido eléctrico y cables</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheck className="text-sky-600 dark:text-blue-400 w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Nunca en techos, calles o cerca de carreteras</span>
                </li>
              </ul>
            </div>
          )}

          {/* Material correcto */}
          {(showAll || section === "material") && (
            <div className="space-y-3 p-5 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border-2 border-green-300 dark:border-green-700/50 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 dark:bg-green-600 p-2.5 rounded-lg">
                  <FaYarn className="text-white text-xl" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  Material correcto
                </h3>
              </div>
              <ul className="space-y-2.5 text-neutral-800 dark:text-neutral-200 text-sm">
                <li className="flex items-start gap-3">
                  <FaCheck className="text-green-600 dark:text-green-400 w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Usa hilo de algodón exclusivamente</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaX className="text-red-600 dark:text-red-400 w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Prohibido hilo curado, nylon o materiales metálicos
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <FaX className="text-red-600 dark:text-red-400 w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Evita hilos con elementos conductores de electricidad
                  </span>
                </li>
              </ul>
            </div>
          )}

          {/* Si se enreda */}
          {(showAll || section === "enredado") && (
            <div className="space-y-3 p-5 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-yellow-950/30 rounded-xl border-2 border-amber-300 dark:border-amber-700/50 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500 dark:bg-amber-600 p-2.5 rounded-lg">
                  <FaExclamationTriangle className="text-white text-xl" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  Si se enreda
                </h3>
              </div>
              <ul className="space-y-2.5 text-neutral-800 dark:text-neutral-200 text-sm">
                <li className="flex items-start gap-3">
                  <FaExclamationCircle className="text-amber-600 dark:text-amber-400 w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Aléjate del volantín y del hilo inmediatamente</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaExclamationCircle className="text-amber-600 dark:text-amber-400 w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>No subas a techos ni árboles para recuperarlo</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaExclamationCircle className="text-amber-600 dark:text-amber-400 w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Nunca intentes rescatar un volantín enredado en cables
                  </span>
                </li>
              </ul>
            </div>
          )}

          {/* Primeros auxilios */}
          {showAll && (
            <div className="space-y-3 p-5 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-rose-950/30 rounded-xl border-2 border-red-300 dark:border-red-700/50 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-red-500 dark:bg-red-600 p-2.5 rounded-lg">
                  <FaFirstAid className="text-white text-xl" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  Primeros auxilios básicos
                </h3>
              </div>
              <ul className="space-y-2.5 text-neutral-800 dark:text-neutral-200 text-sm">
                <li className="flex items-start gap-3">
                  <FaExclamationTriangle className="text-red-600 dark:text-red-400 w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>No toques a quien recibe una descarga eléctrica</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaExclamationTriangle className="text-red-600 dark:text-red-400 w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>
                    Corta la energía o separa con un objeto seco no conductor
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <FaPhoneAlt className="text-red-600 dark:text-red-400 w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Busca asistencia médica inmediata llamando al{" "}
                    <strong>131</strong>
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer fijo con botón - fuera del scroll */}
        <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-b-2xl flex-shrink-0">
          <button
            onClick={() => onOpenChange(false)}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-purple-600 dark:to-violet-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-cyan-600 dark:hover:from-purple-700 dark:hover:to-violet-700 shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 cursor-pointer"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}
