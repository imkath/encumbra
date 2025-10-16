import Link from "next/link";
import {
  FaArrowLeft,
  FaWind,
  FaChartLine,
  FaMapMarkerAlt,
  FaCog,
  FaBell,
  FaCloudSun,
} from "react-icons/fa";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cómo Funciona Encumbra",
  description:
    "Descubre cómo Encumbra calcula el Q-Score perfecto para volar volantines. Sistema inteligente basado en velocidad del viento, ráfagas, estabilidad y tu perfil de volantín. Datos meteorológicos de Open-Meteo.",
  keywords: [
    "Q-Score",
    "cómo funciona Encumbra",
    "algoritmo viento",
    "Open-Meteo",
    "pronóstico meteorológico",
    "GFS NOAA",
    "ECMWF",
    "DWD ICON",
    "velocidad viento",
    "ráfagas",
    "perfiles volantín",
  ],
  openGraph: {
    title: "Cómo Funciona Encumbra | Pronóstico Inteligente de Viento",
    description:
      "Sistema de 4 pasos: elige ubicación, personaliza preferencias, verifica Q-Score y recibe pronósticos por hora.",
    type: "article",
    url: "https://encumbra.vercel.app/como-funciona",
  },
  alternates: {
    canonical: "https://encumbra.vercel.app/como-funciona",
  },
};

export default function ComoFuncionaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {/* Header */}
      <header className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-40 shadow-sm dark:shadow-black/40">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-purple-400 transition-colors"
            >
              <FaArrowLeft className="w-4 h-4" />
              <span className="font-semibold">Volver</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-purple-600 dark:to-violet-600 p-2 rounded-lg">
                <FaWind className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-purple-400 dark:to-violet-400 bg-clip-text text-transparent">
                Encumbra
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl shadow-xl dark:shadow-black/60 border border-neutral-200 dark:border-neutral-700 p-8 md:p-12">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            ¿Cómo funciona Encumbra?
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-8">
            Tu compañero inteligente para volar volantines en el momento
            perfecto
          </p>

          <div className="space-y-12">
            {/* Paso 1 */}
            <section>
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-purple-600 dark:to-violet-600 p-2 sm:p-4 rounded-xl shadow-lg flex-shrink-0">
                  <FaMapMarkerAlt className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                    1. Elige tu ubicación
                  </h2>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    Selecciona un parque de nuestra lista de ubicaciones en
                    Santiago o permite que detectemos tu ubicación
                    automáticamente. Tenemos los mejores parques y espacios
                    abiertos para volar volantines.
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-purple-950/30 dark:to-violet-950/30 border-2 border-blue-200 dark:border-purple-700/50 rounded-xl p-6 ml-20">
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  <strong className="text-blue-700 dark:text-purple-400">
                    Tip:
                  </strong>{" "}
                  Todos nuestros parques están verificados como espacios
                  seguros, lejos de cables eléctricos y con suficiente espacio
                  abierto.
                </p>
              </div>
            </section>

            {/* Paso 2 */}
            <section>
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600 p-2 sm:p-4 rounded-xl shadow-lg flex-shrink-0">
                  <FaCog className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                    2. Personaliza tus preferencias
                  </h2>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                    Configura el tipo de volantín que vas a usar y tus unidades
                    preferidas. Esto nos ayuda a darte recomendaciones más
                    precisas.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 font-bold mt-1">
                        🪁
                      </span>
                      <span className="text-neutral-700 dark:text-neutral-300">
                        <strong>Liviano infantil:</strong> Condiciones más
                        suaves, menos ráfagas
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 font-bold mt-1">
                        🎯
                      </span>
                      <span className="text-neutral-700 dark:text-neutral-300">
                        <strong>Estándar:</strong> Balance perfecto para uso
                        general
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 font-bold mt-1">
                        ⚡
                      </span>
                      <span className="text-neutral-700 dark:text-neutral-300">
                        <strong>Acrobático:</strong> Mayor tolerancia a
                        condiciones variables
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Paso 3 */}
            <section>
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-violet-600 p-2 sm:p-4 rounded-xl shadow-lg flex-shrink-0">
                  <FaChartLine className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                    3. Revisa el Q-Score
                  </h2>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                    Nuestro índice exclusivo Q-Score evalúa las condiciones de
                    viento en una escala de 0 a 100, considerando:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-400 dark:to-violet-400"></div>
                        <strong className="text-neutral-900 dark:text-neutral-100">
                          Velocidad
                        </strong>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        El rango ideal es 16-22 km/h
                      </p>
                    </div>
                    <div className="bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-400 dark:to-violet-400"></div>
                        <strong className="text-neutral-900 dark:text-neutral-100">
                          Ráfagas
                        </strong>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Penalizamos viento muy gustoso
                      </p>
                    </div>
                    <div className="bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-400 dark:to-violet-400"></div>
                        <strong className="text-neutral-900 dark:text-neutral-100">
                          Estabilidad
                        </strong>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Condiciones consistentes
                      </p>
                    </div>
                    <div className="bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-400 dark:to-violet-400"></div>
                        <strong className="text-neutral-900 dark:text-neutral-100">
                          Perfil
                        </strong>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Ajustado a tu volantín
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Paso 4 */}
            <section>
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 p-2 sm:p-4 rounded-xl shadow-lg flex-shrink-0">
                  <FaBell className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                    4. Recibe pronósticos hora por hora
                  </h2>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    Ve gráficos detallados de velocidad del viento, ráfagas y
                    Q-Score para las próximas 48 horas. Identifica las mejores
                    ventanas de tiempo para volar con las recomendaciones de
                    "Mejor Hoy" y "Mejor Mañana".
                  </p>
                </div>
              </div>
            </section>

            {/* Datos meteorológicos */}
            <section className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-purple-950/30 dark:to-violet-950/30 border-2 border-blue-200 dark:border-purple-700/50 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <FaCloudSun className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600 dark:text-purple-400 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                    Datos meteorológicos confiables
                  </h3>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                    Utilizamos datos de <strong>Open-Meteo</strong>, uno de los
                    servicios meteorológicos más precisos y actualizados del
                    mundo. Los pronósticos se actualizan cada 30 minutos para
                    darte la información más reciente.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-purple-400">
                    <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-purple-400"></div>
                    <span>Actualización automática cada 30 minutos</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-purple-400 mt-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-purple-400"></div>
                    <span>Pronósticos hasta 7 días</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-purple-400 mt-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-purple-400"></div>
                    <span>Resolución horaria precisa</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Seguridad */}
            <section className="border-l-4 border-amber-500 dark:border-amber-600 pl-6">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                Seguridad siempre primero
              </h3>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                Además de pronósticos, te proporcionamos guías de seguridad
                esenciales sobre dónde volar, qué materiales usar y qué hacer en
                emergencias. Tu seguridad y la de tu familia son nuestra
                prioridad.
              </p>
              <Link
                href="/seguridad"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-purple-400 hover:text-blue-700 dark:hover:text-purple-300 font-semibold"
              >
                Ver guía de seguridad completa
                <span>→</span>
              </Link>
            </section>
          </div>

          {/* Botón de regreso */}
          <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-purple-600 dark:to-violet-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-cyan-600 dark:hover:from-purple-700 dark:hover:to-violet-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <FaArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
