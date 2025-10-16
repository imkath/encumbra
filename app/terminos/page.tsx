import Link from "next/link";
import { FaArrowLeft, FaWind } from "react-icons/fa";
import { Footer } from "@/components/Footer";
import { ContactForm } from "@/components/ContactForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description:
    "Términos y condiciones de uso de Encumbra. Información sobre el servicio, responsabilidades, datos meteorológicos de Open-Meteo y limitaciones de responsabilidad.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://encumbra.cl/terminos",
  },
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-neutral-200 sticky top-0 z-40 shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-neutral-600 hover:text-blue-600 transition-colors"
            >
              <FaArrowLeft className="w-4 h-4" />
              <span className="font-semibold">Volver</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
                <FaWind className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Encumbra
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-neutral-200 p-8 md:p-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Términos y Condiciones
          </h1>
          <p className="text-neutral-600 mb-8">
            Última actualización: Octubre 2025
          </p>

          <div className="space-y-8 text-neutral-700 leading-relaxed">
            {/* Sección 1 */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                1. Aceptación de los Términos
              </h2>
              <p>
                Al acceder y utilizar Encumbra, aceptas estar sujeto a estos
                términos y condiciones. Si no estás de acuerdo con alguna parte
                de estos términos, no debes utilizar nuestro servicio.
              </p>
            </section>

            {/* Sección 2 */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                2. Descripción del Servicio
              </h2>
              <p className="mb-4">
                Encumbra es una plataforma web que proporciona:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Pronósticos meteorológicos para actividades de volantines
                </li>
                <li>Recomendaciones de ubicaciones seguras</li>
                <li>Información sobre seguridad y mejores prácticas</li>
                <li>Índices de calidad de condiciones (Q-Score)</li>
              </ul>
            </section>

            {/* Sección 3 */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                3. Uso del Servicio
              </h2>
              <p className="mb-4">Al utilizar Encumbra, te comprometes a:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Utilizar el servicio de manera legal y responsable</li>
                <li>
                  No intentar interferir con el funcionamiento del servicio
                </li>
                <li>
                  No utilizar el servicio para actividades ilegales o dañinas
                </li>
                <li>Respetar los derechos de propiedad intelectual</li>
              </ul>
            </section>

            {/* Sección 4 */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                4. Limitación de Responsabilidad
              </h2>
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
                <p className="font-semibold text-amber-900 mb-3">Importante:</p>
                <p className="mb-3">
                  Los pronósticos y recomendaciones proporcionados por Encumbra
                  son de carácter informativo. No nos hacemos responsables por:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Lesiones o daños resultantes del uso de nuestras
                    recomendaciones
                  </li>
                  <li>Inexactitudes en los datos meteorológicos de terceros</li>
                  <li>Cambios repentinos en las condiciones climáticas</li>
                  <li>Decisiones tomadas basándose en nuestra información</li>
                </ul>
              </div>
              <p className="mt-4">
                <strong>
                  La seguridad es tu responsabilidad. Siempre evalúa las
                  condiciones locales antes de volar volantines.
                </strong>
              </p>
            </section>

            {/* Sección 5 */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                5. Datos Meteorológicos
              </h2>
              <p>
                Los datos meteorológicos son proporcionados por Open-Meteo y
                otras fuentes de terceros. No garantizamos la precisión,
                completitud o actualidad de estos datos. Los pronósticos pueden
                cambiar sin previo aviso.
              </p>
            </section>

            {/* Sección 6 */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                6. Propiedad Intelectual
              </h2>
              <p>
                Todo el contenido, diseño, código y materiales de Encumbra están
                protegidos por derechos de autor. No está permitido copiar,
                modificar o distribuir nuestro contenido sin autorización
                previa.
              </p>
            </section>

            {/* Sección 7 */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                7. Modificaciones del Servicio
              </h2>
              <p>
                Nos reservamos el derecho de modificar, suspender o discontinuar
                el servicio en cualquier momento, con o sin previo aviso. No
                seremos responsables ante ti o terceros por cualquier
                modificación, suspensión o discontinuación del servicio.
              </p>
            </section>

            {/* Sección 8 */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                8. Cambios en los Términos
              </h2>
              <p>
                Podemos actualizar estos términos ocasionalmente. Te
                notificaremos sobre cambios significativos publicando los nuevos
                términos en esta página. Tu uso continuado del servicio después
                de dichos cambios constituye tu aceptación de los nuevos
                términos.
              </p>
            </section>

            {/* Sección 9 */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                9. Contacto
              </h2>
              <p className="mb-6">
                Si tienes preguntas sobre estos términos, envíanos un mensaje:
              </p>
              <ContactForm
                subject="Consulta sobre Términos y Condiciones"
                placeholder="Describe tu consulta sobre los términos..."
                buttonText="Enviar consulta"
              />
            </section>
          </div>

          {/* Botón de regreso */}
          <div className="mt-12 pt-8 border-t border-neutral-200">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-200"
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
