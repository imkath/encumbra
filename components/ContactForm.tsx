"use client";

import { useState, FormEvent } from "react";
import { FaEnvelope, FaPaperPlane } from "react-icons/fa";

interface ContactFormProps {
  title?: string;
  description?: string;
  subject?: string; // Asunto predefinido del email
  placeholder?: string;
  buttonText?: string;
  compact?: boolean; // Versión compacta para usar inline
}

export function ContactForm({
  title = "¿Necesitas ayuda?",
  description = "Envíanos un mensaje y te responderemos pronto",
  subject = "Contacto desde Encumbra",
  placeholder = "Escribe tu mensaje aquí...",
  buttonText = "Enviar mensaje",
  compact = false,
}: ContactFormProps) {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          email: email.trim() || undefined,
          subject,
        }),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setMessage("");
        setEmail("");
        // Reset después de 5 segundos
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 5000);
      } else {
        const data = await response.json();
        setError(data.error || "Error al enviar el mensaje");
      }
    } catch (err) {
      console.error("Error submitting contact form:", err);
      setError("Error de conexión. Por favor intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/30 mb-4">
          <FaPaperPlane className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <p className="text-green-700 dark:text-green-400 font-semibold text-lg">
          ¡Mensaje enviado!
        </p>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-2">
          Te responderemos pronto
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={3}
            placeholder={placeholder}
            className="w-full px-4 py-3 border-2 border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900/50 rounded-xl focus:border-blue-500 dark:focus:border-purple-500 focus:outline-none transition-colors resize-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
          />
        </div>

        <div>
          <label
            htmlFor="compact-email"
            className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2"
          >
            Tu email <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <input
            type="email"
            id="compact-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="tu@email.com"
            className="w-full px-4 py-3 border-2 border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900/50 rounded-xl focus:border-blue-500 dark:focus:border-purple-500 focus:outline-none transition-colors text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-700/50 rounded-lg p-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !message.trim()}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-purple-600 dark:to-violet-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-cyan-600 dark:hover:from-purple-700 dark:hover:to-violet-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Enviando...</span>
            </>
          ) : (
            <>
              <FaPaperPlane className="w-4 h-4" />
              <span>{buttonText}</span>
            </>
          )}
        </button>
      </form>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border-2 border-blue-200 dark:border-purple-700 p-6 shadow-lg dark:shadow-black/40">
      <div className="flex items-center gap-2 mb-4">
        <FaEnvelope className="w-5 h-5 text-blue-600 dark:text-purple-400" />
        <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-lg">
          {title}
        </h4>
      </div>

      {description && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          {description}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="contact-message"
            className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2"
          >
            Tu mensaje
          </label>
          <textarea
            id="contact-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={4}
            placeholder={placeholder}
            className="w-full px-4 py-3 border-2 border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900/50 rounded-xl focus:border-blue-500 dark:focus:border-purple-500 focus:outline-none transition-colors resize-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
          />
        </div>

        <div>
          <label
            htmlFor="contact-email"
            className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2"
          >
            Tu email <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <input
            type="email"
            id="contact-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="tu@email.com"
            className="w-full px-4 py-3 border-2 border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900/50 rounded-xl focus:border-blue-500 dark:focus:border-purple-500 focus:outline-none transition-colors text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-700/50 rounded-lg p-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !message.trim()}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-purple-600 dark:to-violet-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-cyan-600 dark:hover:from-purple-700 dark:hover:to-violet-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Enviando...</span>
            </>
          ) : (
            <>
              <FaPaperPlane className="w-4 h-4" />
              <span>{buttonText}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
