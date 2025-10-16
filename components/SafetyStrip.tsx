"use client";

import { FaMapMarkerAlt, FaBox, FaExclamationTriangle } from "react-icons/fa";

export function SafetyStrip() {
  const cards = [
    {
      id: "donde",
      icon: FaMapMarkerAlt,
      title: "Dónde elevar",
      items: [
        "Parques abiertos con espacio",
        "Lejos de cables eléctricos",
        "Sin calles ni vehículos cerca",
      ],
      accentColor: "blue",
      bgGradient: "from-blue-50 to-sky-50",
    },
    {
      id: "material",
      icon: FaBox,
      title: "Material correcto",
      items: [
        "Hilo de algodón o nylon no conductor",
        "Prohibido hilo curado o metálico",
        "Sin materiales conductores de electricidad",
      ],
      accentColor: "green",
      bgGradient: "from-green-50 to-emerald-50",
    },
    {
      id: "enredado",
      icon: FaExclamationTriangle,
      title: "Si se enreda",
      items: [
        "Nunca intentes rescatarlo tú mismo",
        "No toques cables eléctricos",
        "Llama a la compañía eléctrica",
      ],
      accentColor: "orange",
      bgGradient: "from-orange-50 to-amber-50",
    },
  ];

  const getAccentClasses = (color: string) => {
    const classes = {
      blue: {
        border: "border-blue-200",
        icon: "from-blue-500 to-cyan-500",
        text: "text-blue-600",
        dot: "bg-blue-500",
      },
      green: {
        border: "border-green-200",
        icon: "from-green-500 to-emerald-500",
        text: "text-green-600",
        dot: "bg-green-500",
      },
      orange: {
        border: "border-orange-200",
        icon: "from-orange-500 to-red-500",
        text: "text-orange-600",
        dot: "bg-orange-500",
      },
    };
    return classes[color as keyof typeof classes];
  };

  return (
    <section className="relative overflow-hidden py-16">
      <div className="relative mx-auto max-w-7xl px-4">
        {/* Título de la sección */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Vuela seguro, vuela feliz
            </span>
          </h2>
          <p className="text-lg text-neutral-600 font-medium">
            Tres reglas simples para disfrutar responsablemente
          </p>
        </div>

        {/* Grid de cards - Sin expansión, contenido siempre visible */}
        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            const accent = getAccentClasses(card.accentColor);

            return (
              <div
                key={card.id}
                className={`
                  bg-white
                  border ${accent.border}
                  rounded-2xl
                  p-6
                  shadow-sm hover:shadow-lg
                  transition-all duration-200
                `}
              >
                {/* Icono y título */}
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className={`
                      bg-gradient-to-r ${accent.icon}
                      p-3 rounded-xl
                      shadow-sm
                      flex-shrink-0
                    `}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className={`text-lg font-bold ${accent.text}`}>
                    {card.title}
                  </h3>
                </div>

                {/* Lista de items */}
                <ul className="space-y-3">
                  {card.items.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div
                        className={`
                          w-1.5 h-1.5 rounded-full
                          ${accent.dot}
                          mt-2 flex-shrink-0
                        `}
                      ></div>
                      <span className="text-neutral-700 leading-relaxed text-sm">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
