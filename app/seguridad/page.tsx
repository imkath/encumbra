import Link from "next/link";
import {
  FaArrowLeft,
  FaWind,
  FaMapMarkerAlt,
  FaBox,
  FaExclamationTriangle,
  FaFirstAid,
  FaPhoneAlt,
  FaShieldAlt,
} from "react-icons/fa";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guía de Seguridad para Volar Volantín",
  description:
    "Guía completa de seguridad para volar volantines en Chile. Aprende dónde elevar, qué materiales usar, qué hacer si se enreda y primeros auxilios. Información sobre Ley 20.700 y su reglamento, además de prevención de accidentes eléctricos.",
  keywords: [
    "seguridad volantines",
    "hilo de algodón",
    "hilo curado prohibido",
    "Ley 20.700",
    "cables eléctricos",
    "accidentes volantines",
    "primeros auxilios",
    "SAMU 131",
    "prevención accidentes",
    "seguridad eléctrica",
  ],
  openGraph: {
    title: "Guía de Seguridad para Volar Volantín | Encumbra",
    description:
      "Todo lo que necesitas saber para volar volantines de forma segura. Lugares permitidos, materiales correctos y qué hacer en emergencias.",
    type: "article",
    url: "https://encumbra.vercel.app/seguridad",
  },
  alternates: {
    canonical: "https://encumbra.vercel.app/seguridad",
  },
};

export default function SeguridadPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Guía de Seguridad para Volar Volantín",
    description:
      "Instrucciones completas sobre cómo volar volantines de forma segura en Chile",
    step: [
      {
        "@type": "HowToStep",
        name: "Elegir el lugar correcto",
        text: "Parques abiertos, playas, campos deportivos. Mantén mínimo 50 metros de distancia de cables eléctricos.",
      },
      {
        "@type": "HowToStep",
        name: "Usar materiales seguros",
        text: "Hilo de algodón o nylon no conductor. Prohibido hilo curado o metálico (Ley 20.700 y su reglamento).",
      },
      {
        "@type": "HowToStep",
        name: "Si se enreda",
        text: "Aléjate inmediatamente. Nunca intentes rescatarlo. Llama a la compañía eléctrica.",
      },
      {
        "@type": "HowToStep",
        name: "Primeros auxilios",
        text: "En caso de descarga eléctrica, no toques a la víctima directamente. Llama al 131 (SAMU).",
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
              <FaShieldAlt className="w-7 h-7 sm:w-10 sm:h-10 text-blue-600 dark:text-purple-400" />
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100">
                Guía de Seguridad
              </h1>
            </div>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-8">
              Vuela seguro, vuela feliz. Conoce las reglas esenciales para
              disfrutar al máximo.
            </p>

            {/* Banner de advertencia principal */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 text-white rounded-2xl p-6 mb-10 shadow-lg dark:shadow-black/40">
              <div className="flex items-start gap-4">
                <FaExclamationTriangle className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">
                    ¡Atención!
                  </h3>
                  <p className="text-lg leading-relaxed">
                    Los cables eléctricos pueden ser extremadamente peligrosos.
                    Mantén siempre una distancia segura y nunca intentes
                    rescatar un volantín enredado en cables.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-10">
              {/* Sección 1: Dónde elevar */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-purple-600 dark:to-violet-600 p-2 sm:p-3 rounded-xl">
                    <FaMapMarkerAlt className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                    Dónde elevar tu volantín
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200 dark:border-green-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-green-800 dark:text-green-300 mb-4 flex items-center gap-2">
                      <span className="text-2xl">✓</span> Lugares seguros y
                      recomendados
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400 mt-2 flex-shrink-0"></div>
                        <span className="text-neutral-700 dark:text-neutral-300">
                          <strong>Parques públicos</strong> con áreas amplias y
                          despejadas
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400 mt-2 flex-shrink-0"></div>
                        <span className="text-neutral-700 dark:text-neutral-300">
                          <strong>Playas abiertas</strong> lejos de
                          construcciones
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400 mt-2 flex-shrink-0"></div>
                        <span className="text-neutral-700 dark:text-neutral-300">
                          <strong>Campos deportivos</strong> cuando no estén en
                          uso
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400 mt-2 flex-shrink-0"></div>
                        <span className="text-neutral-700 dark:text-neutral-300">
                          Mantén <strong>mínimo 50 metros</strong> de distancia
                          de cables eléctricos
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-2 border-red-200 dark:border-red-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-red-800 dark:text-red-300 mb-4 flex items-center gap-2">
                      <span className="text-2xl">✗</span> Lugares prohibidos y
                      peligrosos
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400 mt-2 flex-shrink-0"></div>
                        <span className="text-neutral-700 dark:text-neutral-300">
                          <strong>Cerca de cables eléctricos</strong> o postes
                          de alta tensión
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400 mt-2 flex-shrink-0"></div>
                        <span className="text-neutral-700 dark:text-neutral-300">
                          <strong>Calles y carreteras</strong> con tráfico
                          vehicular
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400 mt-2 flex-shrink-0"></div>
                        <span className="text-neutral-700 dark:text-neutral-300">
                          <strong>Techos de edificios</strong> o construcciones
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400 mt-2 flex-shrink-0"></div>
                        <span className="text-neutral-700 dark:text-neutral-300">
                          <strong>Cerca de aeropuertos</strong> o rutas de vuelo
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400 mt-2 flex-shrink-0"></div>
                        <span className="text-neutral-700 dark:text-neutral-300">
                          <strong>Junto a antenas</strong> o torres de
                          comunicación
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Sección 2: Material correcto */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-700 p-2 sm:p-3 rounded-xl">
                    <FaBox className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                    Material correcto y seguro
                  </h2>
                </div>

                <div className="bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl p-6 mb-6">
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                    Hilo de volantín
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-700/50 rounded-lg p-4">
                      <p className="font-bold text-green-800 dark:text-green-300 mb-2">
                        ✓ Permitido
                      </p>
                      <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
                        <li>• Hilo de algodón</li>
                        <li>• Nylon no conductor</li>
                        <li>• Materiales no metálicos</li>
                      </ul>
                    </div>
                    <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-700/50 rounded-lg p-4">
                      <p className="font-bold text-red-800 dark:text-red-300 mb-2">
                        ✗ Prohibido
                      </p>
                      <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
                        <li>• Hilo curado (vidrio molido)</li>
                        <li>• Hilo metálico o con metal</li>
                        <li>• Cables conductores</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700/50 rounded-xl p-6">
                  <p className="text-amber-900 dark:text-amber-200 leading-relaxed">
                    <strong>Importante:</strong> El hilo curado está prohibido
                    en Chile según la{" "}
                    <a
                      href="https://www.bcn.cl/leychile/navegar?idNorma=1054358"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline text-blue-800 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
                    >
                      Ley 20.700
                    </a>{" "}
                    y su reglamento. Además de ser ilegal, es
                    extremadamente peligroso y puede causar lesiones graves a
                    personas, animales y ciclistas.
                  </p>
                </div>
              </section>

              {/* Sección 3: Si se enreda */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 p-2 sm:p-3 rounded-xl">
                    <FaExclamationTriangle className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                    Si tu volantín se enreda
                  </h2>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-2 border-red-300 dark:border-red-700/50 rounded-xl p-6 mb-6">
                  <h3 className="text-xl font-bold text-red-900 dark:text-red-300 mb-4">
                    Protocolo de emergencia
                  </h3>
                  <ol className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="bg-red-600 dark:bg-red-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                        1
                      </div>
                      <div>
                        <strong className="text-neutral-900 dark:text-neutral-100">
                          Aléjate inmediatamente
                        </strong>
                        <p className="text-neutral-700 dark:text-neutral-300 mt-1">
                          No te acerques al volantín ni al hilo. Mantén una
                          distancia segura de al menos 10 metros.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-red-600 dark:bg-red-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                        2
                      </div>
                      <div>
                        <strong className="text-neutral-900 dark:text-neutral-100">
                          No intentes rescatarlo
                        </strong>
                        <p className="text-neutral-700 dark:text-neutral-300 mt-1">
                          Nunca subas a techos, árboles o estructuras. Nunca
                          uses objetos conductores para intentar bajarlo.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-red-600 dark:bg-red-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                        3
                      </div>
                      <div>
                        <strong className="text-neutral-900 dark:text-neutral-100">
                          Llama a la compañía eléctrica
                        </strong>
                        <p className="text-neutral-700 dark:text-neutral-300 mt-1">
                          Contacta a la empresa eléctrica local. Ellos tienen el
                          equipo y capacitación para actuar de forma segura.
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="bg-neutral-900 dark:bg-neutral-800 text-white rounded-xl p-6 border-2 border-neutral-800 dark:border-neutral-700">
                  <p className="text-lg mb-2">
                    <strong>Recuerda:</strong> Los cables pueden tener hasta{" "}
                    <span className="text-red-400 dark:text-red-300 font-bold">
                      13.000 voltios
                    </span>
                    . Incluso cables que parecen apagados pueden ser mortales.
                  </p>
                </div>
              </section>

              {/* Sección 4: Primeros auxilios */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-red-500 to-pink-500 dark:from-red-600 dark:to-pink-600 p-2 sm:p-3 rounded-xl">
                    <FaFirstAid className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                    Primeros auxilios básicos
                  </h2>
                </div>

                <div className="bg-white dark:bg-neutral-800 border-2 border-red-200 dark:border-red-700/50 rounded-xl p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-gradient-to-r from-red-500 to-orange-500 dark:from-red-600 dark:to-orange-600 p-2.5 rounded-lg flex-shrink-0">
                        <FaExclamationTriangle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <strong className="text-neutral-900 dark:text-neutral-100 block mb-2">
                          En caso de descarga eléctrica
                        </strong>
                        <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
                          <li>
                            • NO toques a la persona afectada directamente
                          </li>
                          <li>
                            • Corta la corriente eléctrica si es posible y
                            seguro
                          </li>
                          <li>
                            • Usa un objeto seco no conductor para separar a la
                            víctima
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-300 dark:border-red-700/50 rounded-lg p-4 flex items-center gap-3">
                      <FaPhoneAlt className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                      <div>
                        <strong className="text-red-900 dark:text-red-300 block">
                          Llama inmediatamente al 131
                        </strong>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">
                          Sistema de Atención Médica de Urgencia (SAMU)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Consejos adicionales */}
              <section className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-purple-950/30 dark:to-violet-950/30 border-2 border-blue-200 dark:border-purple-700/50 rounded-xl p-8">
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
                  Consejos adicionales
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-purple-400 mt-2 flex-shrink-0"></div>
                    <span className="text-neutral-700 dark:text-neutral-300">
                      Supervisa siempre a los niños mientras vuelan volantines
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-purple-400 mt-2 flex-shrink-0"></div>
                    <span className="text-neutral-700 dark:text-neutral-300">
                      Usa guantes para proteger tus manos del hilo
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-purple-400 mt-2 flex-shrink-0"></div>
                    <span className="text-neutral-700 dark:text-neutral-300">
                      Vuela durante el día con buena visibilidad
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-purple-400 mt-2 flex-shrink-0"></div>
                    <span className="text-neutral-700 dark:text-neutral-300">
                      Mantente hidratado y usa protector solar
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-purple-400 mt-2 flex-shrink-0"></div>
                    <span className="text-neutral-700 dark:text-neutral-300">
                      Revisa el clima antes de salir
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-purple-400 mt-2 flex-shrink-0"></div>
                    <span className="text-neutral-700 dark:text-neutral-300">
                      Respeta las señales y restricciones del parque
                    </span>
                  </div>
                </div>
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
    </>
  );
}
