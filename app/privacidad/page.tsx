import Link from "next/link";
import {
  FaArrowLeft,
  FaWind,
  FaShieldAlt,
  FaCookie,
  FaUserLock,
} from "react-icons/fa";
import { Footer } from "@/components/Footer";
import { ContactForm } from "@/components/ContactForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Política de privacidad de Encumbra. Información sobre recolección de datos, uso de cookies, compartición con terceros, seguridad y derechos de los usuarios.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://encumbra.vercel.app/privacidad",
  },
};

export default function PrivacidadPage() {
  return (
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
            <FaShieldAlt className="w-8 h-8 text-blue-600 dark:text-purple-400" />
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
              Política de Privacidad
            </h1>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">
            Última actualización: Octubre 2025
          </p>

          <div className="bg-blue-50 dark:bg-purple-950/30 border-2 border-blue-200 dark:border-purple-700/50 rounded-xl p-6 mb-8">
            <p className="text-blue-900 dark:text-purple-200 font-semibold">
              En Encumbra, respetamos y protegemos tu privacidad. Esta política
              explica qué información recopilamos y cómo la utilizamos.
            </p>
          </div>

          <div className="space-y-8 text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {/* Sección 1 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-purple-600 dark:to-violet-600 p-2 rounded-lg">
                  <FaUserLock className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  1. Información que Recopilamos
                </h2>
              </div>

              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-3 mt-6">
                1.1 Información Proporcionada Voluntariamente
              </h3>
              <p className="mb-4">
                Cuando usas Encumbra, puedes proporcionarnos:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Tu ubicación geográfica (solo si la autorizas)</li>
                <li>
                  Preferencias de configuración (tipo de volantín, unidades)
                </li>
                <li>Sugerencias o comentarios que envíes</li>
                <li>Email (opcional, solo para responder sugerencias)</li>
              </ul>

              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-3 mt-6">
                1.2 Información Recopilada Automáticamente
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Datos de navegación (páginas visitadas, tiempo de uso)</li>
                <li>Información del dispositivo (tipo, sistema operativo)</li>
                <li>Dirección IP (anónima)</li>
                <li>Preferencias almacenadas localmente en tu navegador</li>
              </ul>
            </section>

            {/* Sección 2 */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                2. Cómo Utilizamos tu Información
              </h2>
              <p className="mb-4">Utilizamos la información recopilada para:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Proporcionar pronósticos meteorológicos personalizados</li>
                <li>Recordar tus preferencias y configuraciones</li>
                <li>Mejorar la experiencia del usuario</li>
                <li>Analizar el uso del sitio y optimizar el servicio</li>
                <li>Responder a tus sugerencias o consultas</li>
                <li>Prevenir fraude y garantizar la seguridad</li>
              </ul>
            </section>

            {/* Sección 3 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-700 p-2 rounded-lg">
                  <FaCookie className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  3. Cookies y Almacenamiento Local
                </h2>
              </div>
              <p className="mb-4">
                Encumbra utiliza cookies y almacenamiento local del navegador
                para:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Guardar tus preferencias (tipo de volantín, unidades)</li>
                <li>Recordar tu ubicación seleccionada</li>
                <li>Mejorar el rendimiento del sitio</li>
                <li>Analizar el uso (cookies analíticas)</li>
              </ul>
              <p className="bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl p-4">
                <strong>Puedes desactivar las cookies</strong> en la
                configuración de tu navegador, pero esto puede afectar la
                funcionalidad del sitio.
              </p>
            </section>

            {/* Sección 4 */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                4. Compartir Información con Terceros
              </h2>
              <div className="bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-700/50 rounded-xl p-6">
                <p className="font-semibold text-green-900 dark:text-green-300 mb-3">
                  ✓ No vendemos tu información personal
                </p>
                <p>
                  Compartimos información limitada solo con servicios
                  esenciales:
                </p>
              </div>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                <li>
                  <strong>Open-Meteo:</strong> Para obtener datos meteorológicos
                  (no enviamos tu información personal)
                </li>
                <li>
                  <strong>Servicios de análisis:</strong> Datos anónimos para
                  entender el uso del sitio
                </li>
                <li>
                  <strong>Hosting:</strong> Proveedores de infraestructura
                  (Vercel, etc.)
                </li>
              </ul>
            </section>

            {/* Sección 5 */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                5. Seguridad de tus Datos
              </h2>
              <p className="mb-4">
                Implementamos medidas de seguridad para proteger tu información:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Conexión HTTPS cifrada en todo el sitio</li>
                <li>Almacenamiento seguro de datos</li>
                <li>Acceso restringido a información personal</li>
                <li>Actualizaciones regulares de seguridad</li>
              </ul>
            </section>

            {/* Sección 6 */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                6. Tus Derechos
              </h2>
              <p className="mb-4">Tienes derecho a:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Acceder a tu información personal</li>
                <li>Solicitar la corrección de datos incorrectos</li>
                <li>Solicitar la eliminación de tus datos</li>
                <li>Retirar el consentimiento para el uso de tu ubicación</li>
                <li>Exportar tus datos en formato legible</li>
              </ul>
              <p className="mt-4">
                Para ejercer estos derechos, utiliza el formulario de contacto
                al final de esta página.
              </p>
            </section>

            {/* Sección 7 */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                7. Privacidad de Menores
              </h2>
              <p>
                Encumbra está diseñado para uso familiar. No recopilamos
                intencionalmente información personal de menores de 13 años sin
                el consentimiento de los padres. Si crees que hemos recopilado
                información de un menor, por favor contáctanos inmediatamente.
              </p>
            </section>

            {/* Sección 8 */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                8. Cambios en esta Política
              </h2>
              <p>
                Podemos actualizar esta política ocasionalmente. Te
                notificaremos sobre cambios significativos publicando la nueva
                política en esta página y actualizando la fecha de "Última
                actualización".
              </p>
            </section>

            {/* Sección 9 */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                9. Contacto
              </h2>
              <p className="mb-6">
                Si tienes preguntas sobre esta política de privacidad o sobre
                cómo manejamos tus datos, envíanos un mensaje:
              </p>
              <ContactForm
                subject="Consulta sobre Política de Privacidad"
                placeholder="Describe tu consulta sobre privacidad..."
                buttonText="Enviar consulta"
              />
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
