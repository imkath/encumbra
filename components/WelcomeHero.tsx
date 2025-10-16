"use client";

import { FaWind, FaMapMarkerAlt, FaMap, FaCheckCircle } from "react-icons/fa";
import { FlyingKites } from "./FlyingKites";

interface WelcomeHeroProps {
  hasLocation: boolean;
  onUseLocation: () => void;
  onChoosePark: () => void;
}

export function WelcomeHero({
  hasLocation,
  onUseLocation,
  onChoosePark,
}: WelcomeHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50">
      {/* Decoración de fondo sutil */}
      <div className="absolute inset-0 overflow-hidden opacity-40">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-sky-200 to-blue-200 rounded-full blur-3xl"></div>
      </div>

      {/* Volantines volando */}
      <FlyingKites />

      <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-28">
        <div className="text-center space-y-8">
          {/* Icono principal */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-xl opacity-30"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-cyan-500 p-5 rounded-2xl shadow-lg">
                <FaWind className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          {/* Título principal con gradiente */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 bg-clip-text text-transparent">
              Encuentra el momento perfecto
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="text-xl md:text-2xl text-neutral-600 font-medium max-w-2xl mx-auto">
            Lee el viento, vuela con confianza
          </p>

          {/* Ubicación */}
          <div className="flex items-center justify-center gap-2 text-base md:text-lg text-neutral-500 font-medium">
            <FaMapMarkerAlt className="w-4 h-4 text-red-500" />
            <span>Santiago - Región Metropolitana</span>
          </div>

          {/* Mensaje de éxito si tiene ubicación */}
          {hasLocation && (
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-md border border-green-200 rounded-xl px-6 py-3 shadow-lg shadow-green-500/10">
              <FaCheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-neutral-700 font-medium">
                Te mostramos los mejores parques cerca de ti
              </span>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            {/* Botón primario con gradiente */}
            <button
              onClick={onUseLocation}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold text-lg shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-3 min-w-[240px] justify-center cursor-pointer"
            >
              <FaMapMarkerAlt className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Usar ubicación</span>
            </button>

            {/* Botón secundario glassmorphism */}
            <button
              onClick={onChoosePark}
              className="group px-8 py-4 bg-white/60 backdrop-blur-md border border-neutral-200/50 text-neutral-700 rounded-xl font-semibold text-lg hover:bg-white/80 shadow-md shadow-black/5 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-3 min-w-[240px] justify-center cursor-pointer"
            >
              <FaMap className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Elegir parque</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
