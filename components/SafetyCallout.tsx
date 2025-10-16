"use client";

import { useState } from "react";
import { FaExclamationTriangle, FaBolt, FaBook } from "react-icons/fa";
import { SafetyModal } from "./SafetyModal";

export function SafetyCallout() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="w-full py-10 relative">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-2xl shadow-lg border border-amber-200 p-8 relative overflow-hidden">
            {/* Decoración de fondo sutil */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-yellow-300/20 to-amber-300/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-amber-300/20 to-yellow-300/20 rounded-full blur-3xl"></div>

            <div className="relative flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="bg-gradient-to-br from-amber-400 to-yellow-500 p-4 rounded-2xl shadow-md">
                  <FaExclamationTriangle className="text-white text-3xl" />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-amber-900 mb-2 flex items-center justify-center md:justify-start gap-2">
                  <FaBolt className="text-amber-600" /> Vuela seguro, siempre{" "}
                  <FaBolt className="text-amber-600" />
                </h3>
                <p className="text-neutral-700 leading-relaxed">
                  <strong className="text-amber-600">¡Importante!</strong> Evita
                  zonas con tendido eléctrico. Si un volantín se enreda,{" "}
                  <strong>aléjate inmediatamente</strong> y busca ayuda. Nunca
                  intentes rescatarlo cerca de cables.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(true)}
                className="flex-shrink-0 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-amber-400 flex items-center gap-2 cursor-pointer"
              >
                <FaBook className="w-4 h-4" />
                Guía completa
              </button>
            </div>
          </div>
        </div>
      </div>

      <SafetyModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        section="todos"
      />
    </>
  );
}
