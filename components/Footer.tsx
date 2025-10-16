"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  FaWind,
  FaGithub,
  FaTwitter,
  FaEnvelope,
  FaHeart,
  FaCloudSun,
  FaPaperPlane,
  FaLightbulb,
} from "react-icons/fa";

export function Footer() {
  const currentYear = new Date().getFullYear();

  // Estados del formulario de sugerencias
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Alternar formulario y hacer scroll suave
  const handleToggleSuggestionForm = () => {
    setShowSuggestionForm(!showSuggestionForm);

    // Hacer scroll al formulario después de que se expanda
    if (!showSuggestionForm) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 100);
    }
  };

  // Manejar envío del formulario
  const handleSubmitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/suggestion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          suggestion,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al enviar sugerencia");
      }

      setIsSubmitting(false);
      setSubmitSuccess(true);
      setSubmitError(null);
      setSuggestion("");
      setEmail("");

      // Ocultar mensaje de éxito después de 4 segundos
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowSuggestionForm(false);
      }, 4000);
    } catch (error) {
      console.error("Error al enviar sugerencia:", error);
      setIsSubmitting(false);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Error al enviar la sugerencia. Por favor intenta más tarde."
      );

      // Ocultar mensaje de error después de 5 segundos
      setTimeout(() => {
        setSubmitError(null);
      }, 5000);
    }
  };

  return (
    <footer
      id="footer"
      className="relative bg-gradient-to-br from-neutral-50 to-blue-50 border-t border-neutral-200/50 mt-20"
    >
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Columna 1: Branding */}
          <div className="col-span-1 md:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity w-fit"
            >
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-xl shadow-md">
                <FaWind className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-display font-bold text-2xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Encumbra
                </h2>
                <p className="text-sm text-neutral-600">
                  Vuela cuando el viento es perfecto
                </p>
              </div>
            </Link>
            <p className="text-neutral-600 leading-relaxed mb-4">
              Encumbra te ayuda a encontrar el momento ideal para elevar tu
              volantín, con pronósticos precisos y recomendaciones de seguridad
              para disfrutar al máximo esta tradición chilena.
            </p>
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <span>Hecha con</span>
              <a
                href="https://obliq.kthcsk.me"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:opacity-80 transition-opacity"
              >
                <FaHeart className="w-4 h-4 text-red-500 animate-pulse" />
              </a>
              <span>por</span>
              <a
                href="https://obliq.kthcsk.me"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-neutral-900 hover:text-neutral-700 hover:underline transition-colors"
              >
                OBLIQ
              </a>
            </div>
          </div>

          {/* Columna 2: Enlaces útiles */}
          <div>
            <h3 className="font-bold text-neutral-900 mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/como-funciona"
                  className="text-neutral-600 hover:text-blue-600 transition-colors text-sm"
                >
                  Cómo funciona
                </Link>
              </li>
              <li>
                <Link
                  href="/seguridad"
                  className="text-neutral-600 hover:text-blue-600 transition-colors text-sm"
                >
                  Seguridad
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    const section = document.getElementById("parques");
                    if (section) {
                      const headerHeight = 64; // h-16 del header
                      const padding = 16;
                      const top =
                        section.getBoundingClientRect().top +
                        window.scrollY -
                        headerHeight -
                        padding;
                      window.scrollTo({ top, behavior: "smooth" });
                    }
                  }}
                  className="text-neutral-600 hover:text-blue-600 transition-colors text-sm cursor-pointer"
                >
                  Mejores parques
                </button>
              </li>
              <li>
                <Link
                  href="/preguntas-frecuentes"
                  className="text-neutral-600 hover:text-blue-600 transition-colors text-sm"
                >
                  Preguntas frecuentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Sugerencias */}
          <div>
            <h3 className="font-bold text-neutral-900 mb-4">¿Tienes ideas?</h3>
            <p className="text-sm text-neutral-600 mb-4">
              Ayúdanos a mejorar Encumbra compartiendo tus sugerencias
            </p>

            {/* Botón de sugerencias */}
            <button
              onClick={handleToggleSuggestionForm}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 hover:from-blue-100 hover:to-cyan-100 transition-all duration-200 hover:shadow-md text-sm font-semibold text-blue-700 cursor-pointer"
            >
              <FaLightbulb className="w-4 h-4" />
              <span>Enviar sugerencia</span>
            </button>
          </div>
        </div>

        {/* Formulario de sugerencias expandible */}
        {showSuggestionForm && (
          <div
            ref={formRef}
            className="mt-6 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border-2 border-blue-200 p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <FaLightbulb className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-neutral-900 text-lg">
                  ¿Tienes una idea para mejorar Encumbra?
                </h4>
              </div>

              {submitSuccess ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                    <FaPaperPlane className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-green-700 font-semibold text-lg">
                    ¡Gracias por tu sugerencia!
                  </p>
                  <p className="text-neutral-600 text-sm mt-2">
                    La revisaremos pronto
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitSuggestion} className="space-y-4">
                  {/* Mensaje de error */}
                  {submitError && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                      <p className="text-red-700 text-sm font-semibold">
                        {submitError}
                      </p>
                    </div>
                  )}
                  <div>
                    <label
                      htmlFor="suggestion"
                      className="block text-sm font-semibold text-neutral-700 mb-2"
                    >
                      Tu sugerencia
                    </label>
                    <textarea
                      id="suggestion"
                      value={suggestion}
                      onChange={(e) => setSuggestion(e.target.value)}
                      required
                      rows={3}
                      placeholder="Cuéntanos tu idea o sugerencia..."
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none text-neutral-900"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-neutral-700 mb-2"
                    >
                      Tu email (opcional)
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-neutral-900"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting || !suggestion.trim()}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <FaPaperPlane className="w-4 h-4" />
                          <span>Enviar</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSuggestionForm(false)}
                      className="px-6 py-3 border-2 border-neutral-300 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-50 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Separator */}
        <div className="border-t border-neutral-200 my-8"></div>

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-neutral-600 text-center md:text-left">
            © {currentYear} Encumbra. Todos los derechos reservados.
          </div>

          {/* Créditos meteorológicos */}
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-xl px-4 py-2 shadow-sm">
            <FaCloudSun className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-neutral-600">
              Datos meteorológicos por{" "}
              <a
                href="https://open-meteo.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-blue-600 hover:underline"
              >
                Open-Meteo
              </a>
            </span>
          </div>

          {/* Legal links */}
          <div className="flex gap-4 text-xs text-neutral-500">
            <Link
              href="/privacidad"
              className="hover:text-neutral-900 transition-colors"
            >
              Privacidad
            </Link>
            <Link
              href="/terminos"
              className="hover:text-neutral-900 transition-colors"
            >
              Términos
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative gradient at bottom */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500"></div>
    </footer>
  );
}
