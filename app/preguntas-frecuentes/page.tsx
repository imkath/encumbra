import Link from "next/link";
import {
  FaArrowLeft,
  FaWind,
  FaQuestionCircle,
  FaChartLine,
  FaClock,
  FaMapMarkerAlt,
  FaCog,
  FaCloudSun,
  FaShieldAlt,
  FaMobileAlt,
} from "react-icons/fa";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preguntas Frecuentes",
  description:
    "Respuestas a las preguntas más comunes sobre Encumbra: ¿Qué es el Q-Score? ¿Qué tan precisos son los pronósticos? ¿Cuáles son los mejores parques? ¿Es seguro volar volantines? Y más.",
  keywords: [
    "FAQ volantines",
    "preguntas frecuentes",
    "Q-Score explicación",
    "precisión pronósticos",
    "mejores parques Santiago",
    "tipos volantín",
    "actualización datos",
    "seguridad volantines",
  ],
  openGraph: {
    title: "Preguntas Frecuentes | Encumbra",
    description:
      "Encuentra respuestas a todas tus dudas sobre cómo usar Encumbra y volar volantines de forma segura.",
    type: "article",
    url: "https://encumbra.vercel.app/preguntas-frecuentes",
  },
  alternates: {
    canonical: "https://encumbra.vercel.app/preguntas-frecuentes",
  },
};

export default function PreguntasFrecuentesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Qué es el Q-Score?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "El Q-Score (Q de Qualitatem, calidad en latín) es una puntuación de 0 a 100 que indica qué tan buenas son las condiciones para volar tu tipo de volantín. Considera velocidad del viento, ráfagas, estabilidad y perfil.",
        },
      },
      {
        "@type": "Question",
        name: "¿Qué tan precisos son los pronósticos?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Encumbra utiliza datos de Open-Meteo, una de las fuentes meteorológicas más confiables. Los datos provienen de modelos oficiales como GFS (NOAA), ECMWF y DWD ICON. La precisión es mayor para las próximas horas.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cuáles son los mejores parques para volar?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Encumbra muestra parques verificados en Santiago que cumplen con criterios de seguridad: áreas amplias, alejados de cables eléctricos, buena accesibilidad y permitidos por autoridades.",
        },
      },
      {
        "@type": "Question",
        name: "¿Es seguro volar volantines?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí, siempre que sigas las reglas básicas: mantente lejos de cables eléctricos (mínimo 50 metros), usa hilo de algodón (nunca curado o metálico), y si se enreda nunca intentes rescatarlo.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cada cuánto se actualizan los datos?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Los datos meteorológicos se actualizan automáticamente cada vez que cargas la página. Open-Meteo actualiza sus modelos cada 1-6 horas dependiendo del modelo.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
        {/* Header */}
        <header className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-40 shadow-sm">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-purple-400 transition-colors"
              >
                <FaArrowLeft className="w-4 h-4" />
                <span className="font-semibold">Volver</span>
              </Link>
              <Link
                href="/"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-purple-600 dark:to-violet-600 p-2 rounded-xl">
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
            <div className="flex items-center gap-3 mb-4">
              <FaQuestionCircle className="w-10 h-10 text-blue-600 dark:text-purple-400" />
              <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
                Preguntas frecuentes
              </h1>
            </div>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-10">
              Encuentra respuestas a las dudas más comunes sobre Encumbra.
            </p>

            <div className="space-y-8">
              {/* FAQ 1: Qué es Q-Score */}
              <div className="border-2 border-blue-200 dark:border-purple-700/50 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-purple-950/30 dark:to-violet-950/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <FaChartLine className="w-6 h-6 text-blue-600 dark:text-purple-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                      ¿Qué es el Q-Score?
                    </h3>
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-3">
                      El <strong>Q-Score</strong> (Q de Qualitatem, calidad en
                      latín) es una puntuación de 0 a 100 que indica qué tan
                      buenas son las condiciones para volar tu tipo de volantín.
                      Considera:
                    </p>
                    <div className="grid md:grid-cols-2 gap-3 mt-4">
                      <div className="bg-white/60 dark:bg-neutral-800/60 rounded-lg p-3">
                        <strong className="text-blue-900 dark:text-purple-300 block mb-1">
                          Velocidad del viento
                        </strong>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Según tu tipo de volantín
                        </p>
                      </div>
                      <div className="bg-white/60 dark:bg-neutral-800/60 rounded-lg p-3">
                        <strong className="text-blue-900 dark:text-purple-300 block mb-1">
                          Ráfagas
                        </strong>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Menos ráfagas = mejor
                        </p>
                      </div>
                      <div className="bg-white/60 dark:bg-neutral-800/60 rounded-lg p-3">
                        <strong className="text-blue-900 dark:text-purple-300 block mb-1">
                          Estabilidad
                        </strong>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Viento constante ideal
                        </p>
                      </div>
                      <div className="bg-white/60 dark:bg-neutral-800/60 rounded-lg p-3">
                        <strong className="text-blue-900 dark:text-purple-300 block mb-1">
                          Perfil
                        </strong>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Adaptado a tu elección
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ 2: Precisión */}
              <div className="border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <FaCloudSun className="w-6 h-6 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                      ¿Qué tan precisos son los pronósticos?
                    </h3>
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-3">
                      Encumbra utiliza datos de <strong>Open-Meteo</strong>, una
                      de las fuentes meteorológicas más confiables del mundo.
                      Los datos provienen de modelos oficiales como:
                    </p>
                    <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-600 dark:text-cyan-400">
                          •
                        </span>
                        <span>GFS (NOAA - Estados Unidos)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-600 dark:text-cyan-400">
                          •
                        </span>
                        <span>ECMWF (Centro Europeo)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-600 dark:text-cyan-400">
                          •
                        </span>
                        <span>DWD ICON (Servicio Meteorológico Alemán)</span>
                      </li>
                    </ul>
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mt-3">
                      La precisión es mayor para las próximas horas y disminuye
                      gradualmente para días posteriores. Te recomendamos
                      siempre verificar las condiciones actuales antes de salir.
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ 3: Mejores parques */}
              <div className="border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <FaMapMarkerAlt className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                      ¿Cuáles son los mejores parques para volar?
                    </h3>
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-3">
                      Encumbra muestra parques verificados en Santiago que
                      cumplen con criterios de seguridad:
                    </p>
                    <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400">
                          ✓
                        </span>
                        <span>Áreas amplias y despejadas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400">
                          ✓
                        </span>
                        <span>Alejados de cables eléctricos</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400">
                          ✓
                        </span>
                        <span>Buena accesibilidad</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400">
                          ✓
                        </span>
                        <span>Permitidos por las autoridades locales</span>
                      </li>
                    </ul>
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mt-3">
                      Puedes ver el pronóstico específico de cada parque en el
                      mapa de la página principal. Los marcadores muestran en
                      tiempo real qué parques tienen las mejores condiciones.
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ 4: Tipo de volantín */}
              <div className="border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <FaCog className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                      ¿Qué tipo de volantín debo elegir?
                    </h3>
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                      Depende de tu volantín y tu experiencia. Encumbra ofrece
                      tres perfiles:
                    </p>
                    <div className="space-y-3">
                      <div className="bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-700/50 rounded-lg p-4">
                        <p className="font-bold text-blue-900 dark:text-blue-300 mb-1">
                          🪁 Liviano (5-15 km/h)
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Volantines pequeños o de papel, ideal para
                          principiantes o niños. Requiere vientos suaves.
                        </p>
                      </div>
                      <div className="bg-cyan-50 dark:bg-cyan-950/30 border-2 border-cyan-200 dark:border-cyan-700/50 rounded-lg p-4">
                        <p className="font-bold text-cyan-900 dark:text-cyan-300 mb-1">
                          🎯 Estándar (10-25 km/h)
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Volantines de tamaño medio, la opción más versátil
                          para todo tipo de situaciones.
                        </p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-950/30 border-2 border-purple-200 dark:border-purple-700/50 rounded-lg p-4">
                        <p className="font-bold text-purple-900 dark:text-purple-300 mb-1">
                          ⚡ Acrobático (15-35 km/h)
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Volantines grandes o delta, para usuarios avanzados.
                          Requiere vientos más fuertes.
                        </p>
                      </div>
                    </div>
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mt-3">
                      Puedes cambiar tu perfil en cualquier momento desde el
                      ícono de ajustes (⚙️) en la esquina superior derecha.
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ 5: Seguridad */}
              <div className="border-2 border-orange-200 dark:border-orange-700/50 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <FaShieldAlt className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                      ¿Es seguro volar volantines?
                    </h3>
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-3">
                      Sí, siempre que sigas las reglas básicas de seguridad:
                    </p>
                    <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 dark:text-orange-400 font-bold">
                          •
                        </span>
                        <span>
                          Mantente <strong>lejos de cables eléctricos</strong>{" "}
                          (mínimo 50 metros)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 dark:text-orange-400 font-bold">
                          •
                        </span>
                        <span>
                          Usa <strong>hilo de algodón</strong>, nunca hilo
                          curado o metálico
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 dark:text-orange-400 font-bold">
                          •
                        </span>
                        <span>
                          Si tu volantín se enreda en cables,{" "}
                          <strong>nunca intentes rescatarlo</strong>
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 dark:text-orange-400 font-bold">
                          •
                        </span>
                        <span>Supervisa siempre a los niños</span>
                      </li>
                    </ul>
                    <div className="mt-4">
                      <Link
                        href="/seguridad"
                        className="inline-flex items-center gap-2 text-orange-700 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 font-bold transition-colors"
                      >
                        Lee nuestra guía completa de seguridad →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ 6: Actualización de datos */}
              <div className="border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <FaClock className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                      ¿Cada cuánto se actualizan los datos?
                    </h3>
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                      Los datos meteorológicos se actualizan automáticamente
                      cada vez que cargas la página. Open-Meteo actualiza sus
                      modelos cada 1-6 horas dependiendo del modelo. Para
                      obtener el pronóstico más reciente, simplemente recarga la
                      página.
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ 7: Usar mi ubicación */}
              <div className="border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <FaMobileAlt className="w-6 h-6 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                      ¿Puedo usar mi ubicación actual?
                    </h3>
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-3">
                      Sí. Encumbra ya puede usar tu ubicación actual para
                      recomendarte el parque verificado más cercano en Santiago.
                      Cuando presionas <strong>"Usar ubicación"</strong> te
                      pediremos permiso al navegador y recordaremos tu elección
                      para tus próximas visitas.
                    </p>
                    <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-600 dark:text-cyan-400">
                          ○
                        </span>
                        <span>
                          Permite el acceso desde el botón{" "}
                          <strong>"Usar ubicación"</strong> y detectaremos tus
                          coordenadas actuales.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-600 dark:text-cyan-400">
                          ○
                        </span>
                        <span>
                          Guardamos tu preferencia localmente para no volver a
                          pedir el permiso cada vez.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-600 dark:text-cyan-400">
                          ○
                        </span>
                        <span>
                          Usamos la ubicación solo para sugerirte parques
                          cercanos y nunca la enviamos a servidores.
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* FAQ 8: Condiciones cambian */}
              <div className="border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <FaWind className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                      ¿Qué hago si las condiciones cambian repentinamente?
                    </h3>
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-3">
                      El clima puede cambiar rápidamente. Si notas alguno de
                      estos signos, recoge tu volantín inmediatamente:
                    </p>
                    <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 dark:text-red-400">
                          ⚠️
                        </span>
                        <span>Nubes oscuras acercándose</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 dark:text-red-400">
                          ⚠️
                        </span>
                        <span>
                          Truenos o relámpagos (¡nunca vueles en tormentas!)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 dark:text-red-400">
                          ⚠️
                        </span>
                        <span>Viento muy fuerte o ráfagas extremas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 dark:text-red-400">
                          ⚠️
                        </span>
                        <span>Lluvia o granizo</span>
                      </li>
                    </ul>
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mt-3">
                      <strong>Importante:</strong> El hilo mojado conduce la
                      electricidad. Nunca vueles volantines durante tormentas
                      eléctricas.
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ 9: Más preguntas */}
              <div className="border-2 border-blue-200 dark:border-purple-700/50 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-purple-950/30 dark:to-violet-950/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <FaQuestionCircle className="w-6 h-6 text-blue-600 dark:text-purple-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                      ¿Tienes más preguntas?
                    </h3>
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-3">
                      Si no encontraste la respuesta que buscabas, puedes
                      enviarnos tus sugerencias o preguntas a través del
                      formulario en el pie de página.
                    </p>
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                      También puedes explorar nuestra página{" "}
                      <Link
                        href="/como-funciona"
                        className="text-blue-600 dark:text-purple-400 hover:text-blue-700 dark:hover:text-purple-300 font-bold"
                      >
                        Cómo funciona
                      </Link>{" "}
                      para entender mejor cómo Encumbra calcula las condiciones
                      perfectas para volar.
                    </p>
                  </div>
                </div>
              </div>
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
    </>
  );
}
