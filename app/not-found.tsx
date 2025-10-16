import Link from "next/link";
import { FaWind, FaHome, FaMapMarkerAlt } from "react-icons/fa";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Volantín animado */}
        <div className="mb-8 relative">
          <div className="animate-bounce">
            <div className="inline-block text-9xl transform rotate-45">🪁</div>
          </div>
          {/* Hilo del volantín - corto para parecer que se soltó */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-0.5 h-16 bg-gradient-to-b from-neutral-400 to-transparent opacity-50"></div>
        </div>

        {/* Contenido */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-neutral-200 p-8 md:p-12">
          <div className="mb-6">
            <h1 className="text-7xl font-black text-neutral-900 mb-4">404</h1>
            <div className="flex items-center justify-center gap-2 mb-4">
              <FaWind className="w-6 h-6 text-blue-600 animate-pulse" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                ¡Se soltó el hilo!
              </h2>
              <FaWind className="w-6 h-6 text-cyan-600 animate-pulse" />
            </div>
            <p className="text-xl text-neutral-600 leading-relaxed">
              Esta página se fue volando con el viento...
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
            <p className="text-neutral-700 mb-4">
              Parece que el volantín se escapó y esta página ya no existe. Pero
              no te preocupes, podemos ayudarte a encontrar tu camino de
              regreso.
            </p>
            <div className="text-sm text-neutral-600 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span className="text-blue-600">💨</span>
                <span>Verifica que la URL esté correcta</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-cyan-600">🪁</span>
                <span>O vuelve al inicio para volar de nuevo</span>
              </div>
            </div>
          </div>

          {/* Botones de navegación */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold text-lg hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <FaHome className="w-5 h-5" />
              Volver al inicio
            </Link>

            <Link
              href="/#parques"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-blue-500 text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <FaMapMarkerAlt className="w-5 h-5" />
              Ver parques
            </Link>
          </div>

          {/* Mensaje adicional */}
          <div className="mt-8 pt-6 border-t border-neutral-200">
            <p className="text-sm text-neutral-500">
              ¿Crees que esto es un error?{" "}
              <a
                href="/"
                className="text-blue-600 hover:underline font-semibold"
              >
                Cuéntanos
              </a>
            </p>
          </div>
        </div>

        {/* Encumbra logo abajo */}
        <div className="mt-8 flex items-center justify-center gap-2 opacity-60">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
            <FaWind className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Encumbra
          </span>
        </div>
      </div>
    </div>
  );
}
