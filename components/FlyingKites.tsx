"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface KiteProps {
  type: "A" | "B" | "C" | "D";
  x: string;
  delay: number;
  duration: number;
  yOffset: string;
  scale: number;
  depth: number;
  initialRotate: number;
}

const KiteA = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 220 220"
    className="w-full h-full"
  >
    <g className="kite">
      <g className="body">
        {/* rombo */}
        <polygon
          points="100,10 160,70 100,130 40,70"
          fill="none"
          stroke="#1a1a1a"
          strokeOpacity="0.25"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {/* 4 triángulos */}
        <polygon points="100,70 100,10 40,70" fill="#E96D12" />
        <polygon points="100,70 160,70 100,10" fill="#0081C9" />
        <polygon points="100,70 100,130 160,70" fill="#6C2CA7" />
        <polygon points="100,70 40,70 100,130" fill="#E4E91A" />
      </g>

      {/* varillas */}
      <g
        className="frame"
        stroke="#1a1a1a"
        strokeOpacity="0.25"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      >
        <line x1="100" y1="10" x2="100" y2="130" />
        <line x1="40" y1="70" x2="160" y2="70" />
      </g>

      {/* cola con moños */}
      <g className="tail">
        <path
          d="M100,130 C85,155 115,175 95,200"
          fill="none"
          stroke="#1a1a1a"
          strokeOpacity="0.25"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <g className="bows">
          <g transform="translate(93,155) rotate(-20)">
            <polygon points="-7,0 0,-5 7,0 0,5" fill="#F04D98" />
          </g>
          <g transform="translate(101,168) rotate(10)">
            <polygon points="-7,0 0,-5 7,0 0,5" fill="#00A7D1" />
          </g>
          <g transform="translate(94,182) rotate(-15)">
            <polygon points="-7,0 0,-5 7,0 0,5" fill="#FFB703" />
          </g>
          <g transform="translate(100,196) rotate(8)">
            <polygon points="-7,0 0,-5 7,0 0,5" fill="#7BD389" />
          </g>
        </g>
      </g>
    </g>
  </svg>
);

const KiteB = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 220 220"
    className="w-full h-full"
  >
    <g className="kite">
      {/* cuerpo segmentado */}
      <polygon
        points="110,18 172,80 110,142 48,80"
        fill="none"
        stroke="#1a1a1a"
        strokeOpacity="0.25"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
      <polygon points="110,80 110,18 48,80" fill="#19B394" />
      <polygon points="110,80 172,80 110,18" fill="#FF7F50" />
      <polygon points="110,80 110,142 172,80" fill="#5B3FD6" />
      <polygon points="110,80 48,80 110,142" fill="#FFD166" />
      {/* cuña extra para look distinto */}
      <polygon
        points="110,18 130,60 110,80 90,60"
        fill="#1C8EF9"
        opacity="0.85"
      />

      {/* varillas */}
      <g
        className="frame"
        stroke="#1a1a1a"
        strokeOpacity="0.25"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      >
        <line x1="110" y1="18" x2="110" y2="142" />
        <line x1="48" y1="80" x2="172" y2="80" />
      </g>

      {/* cola más larga */}
      <g className="tail">
        <path
          d="M110,142 C130,165 90,178 115,198"
          fill="none"
          stroke="#1a1a1a"
          strokeOpacity="0.25"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <g className="bows">
          <g transform="translate(121,160) rotate(15)">
            <polygon points="-7,0 0,-5 7,0 0,5" fill="#FF5A5F" />
          </g>
          <g transform="translate(106,172) rotate(-10)">
            <polygon points="-7,0 0,-5 7,0 0,5" fill="#06D6A0" />
          </g>
          <g transform="translate(118,186) rotate(5)">
            <polygon points="-7,0 0,-5 7,0 0,5" fill="#FFD166" />
          </g>
        </g>
      </g>
    </g>
  </svg>
);

const KiteC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 220 220"
    className="w-full h-full"
  >
    <g className="kite">
      {/* borde blanco para destacar sobre fondos oscuros */}
      <polygon
        points="95,20 150,85 95,150 40,85"
        fill="#ffffff"
        opacity="0.9"
      />
      <g className="body">
        <polygon
          points="95,20 150,85 95,150 40,85"
          fill="none"
          stroke="#1a1a1a"
          strokeOpacity="0.25"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <polygon points="95,85 95,20 40,85" fill="#F94144" />
        <polygon points="95,85 150,85 95,20" fill="#277DA1" />
        <polygon points="95,85 95,150 150,85" fill="#F3722C" />
        <polygon points="95,85 40,85 95,150" fill="#90BE6D" />
        {/* acento central */}
        <circle cx="95" cy="85" r="7" fill="#ffffff" opacity="0.85" />
      </g>

      <g
        className="frame"
        stroke="#1a1a1a"
        strokeOpacity="0.25"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      >
        <line x1="95" y1="20" x2="95" y2="150" />
        <line x1="40" y1="85" x2="150" y2="85" />
      </g>

      <g className="tail">
        <path
          d="M95,150 C70,175 125,185 90,205"
          fill="none"
          stroke="#1a1a1a"
          strokeOpacity="0.25"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <g className="bows">
          <g transform="translate(85,168) rotate(-20)">
            <polygon points="-8,0 0,-6 8,0 0,6" fill="#577590" />
          </g>
          <g transform="translate(108,178) rotate(10)">
            <polygon points="-8,0 0,-6 8,0 0,6" fill="#F9C74F" />
          </g>
          <g transform="translate(92,194) rotate(-8)">
            <polygon points="-8,0 0,-6 8,0 0,6" fill="#43AA8B" />
          </g>
        </g>
      </g>
    </g>
  </svg>
);

const KiteD = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 230 230"
    className="w-full h-full"
  >
    <g className="kite">
      <g className="sail">
        {/* borde claro para contraste en fondos oscuros */}
        <polygon points="115,18 28,122 202,122" fill="#ffffff" opacity="0.92" />
        <polygon
          points="115,18 28,122 202,122"
          fill="none"
          stroke="#1a1a1a"
          strokeOpacity="0.28"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {/* franjas */}
        <polygon points="115,18 28,122 92,122" fill="#43AA8B" />
        <polygon points="115,18 92,122 138,122" fill="#F3722C" />
        <polygon points="115,18 138,122 202,122" fill="#277DA1" />
        {/* punta */}
        <circle cx="115" cy="28" r="6" fill="#ffffff" opacity="0.85" />
      </g>

      <g
        className="frame"
        stroke="#1a1a1a"
        strokeOpacity="0.3"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      >
        <line x1="115" y1="18" x2="115" y2="122" />
        <line x1="40" y1="112" x2="190" y2="112" />
      </g>

      <polygon
        className="keel"
        points="115,112 127,138 103,138"
        fill="#ffffff"
        stroke="#1a1a1a"
        strokeOpacity="0.25"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />

      <g className="tail">
        <path
          d="M115,138 C135,160 95,178 130,206"
          fill="none"
          stroke="#1a1a1a"
          strokeOpacity="0.25"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <g className="bows">
          <g transform="translate(124,154) rotate(10)">
            <polygon points="-7,0 0,-5 7,0 0,5" fill="#FF5A5F" />
          </g>
          <g transform="translate(110,168) rotate(-12)">
            <polygon points="-7,0 0,-5 7,0 0,5" fill="#06D6A0" />
          </g>
          <g transform="translate(122,188) rotate(6)">
            <polygon points="-7,0 0,-5 7,0 0,5" fill="#FFD166" />
          </g>
        </g>
      </g>
    </g>
  </svg>
);

const Kite = ({
  type,
  x,
  delay,
  duration,
  yOffset,
  scale,
  depth,
  initialRotate,
}: KiteProps) => {
  const KiteComponent =
    type === "A" ? KiteA : type === "B" ? KiteB : type === "C" ? KiteC : KiteD;

  // Física realista basada en profundidad y tamaño
  const speedFactor = 0.5 + depth * 0.5;
  const sizeFactor = scale;

  const baseAmplitude = depth * 60;
  const yAmplitude = baseAmplitude * (1.4 - sizeFactor * 0.2);
  const xAmplitude = baseAmplitude * (2.0 - sizeFactor * 0.3);
  const rotateAmplitude = (25 - sizeFactor * 5) * depth;

  // Generar valores aleatorios únicos para cada volantín (seed basado en posición)
  const seed = parseFloat(x) + parseFloat(yOffset) + scale + depth;
  const random = (min: number, max: number, offset: number) => {
    const val = Math.sin(seed * offset) * 10000;
    const normalized = val - Math.floor(val);
    return min + normalized * (max - min);
  };

  // Patrón de movimiento orgánico con muchos puntos de control para suavidad
  // Usando múltiples puntos intermedios para crear movimiento continuo y fluido
  const yPoints = [
    random(-yAmplitude * 1.2, -yAmplitude * 0.4, 1),
    random(-yAmplitude * 0.8, yAmplitude * 0.2, 2),
    random(yAmplitude * 0.3, yAmplitude * 1.0, 3),
    random(-yAmplitude * 0.6, yAmplitude * 0.5, 4),
    random(-yAmplitude * 1.0, -yAmplitude * 0.3, 5),
    random(-yAmplitude * 0.5, yAmplitude * 0.4, 6),
    random(yAmplitude * 0.2, yAmplitude * 0.9, 7),
    random(-yAmplitude * 1.2, -yAmplitude * 0.4, 8),
  ];

  const xPoints = [
    random(-xAmplitude * 0.5, xAmplitude * 0.8, 9),
    random(xAmplitude * 0.2, xAmplitude * 1.2, 10),
    random(-xAmplitude * 0.7, xAmplitude * 0.5, 11),
    random(-xAmplitude * 0.4, xAmplitude * 0.9, 12),
    random(xAmplitude * 0.1, xAmplitude * 1.1, 13),
    random(-xAmplitude * 0.6, xAmplitude * 0.6, 14),
    random(-xAmplitude * 0.3, xAmplitude * 0.7, 15),
    random(-xAmplitude * 0.5, xAmplitude * 0.8, 16),
  ];

  const rotatePoints = [
    initialRotate + random(-rotateAmplitude * 1.2, rotateAmplitude * 1.2, 17),
    initialRotate + random(-rotateAmplitude * 0.8, rotateAmplitude * 0.8, 18),
    initialRotate + random(-rotateAmplitude * 1.0, rotateAmplitude * 1.0, 19),
    initialRotate + random(-rotateAmplitude * 0.6, rotateAmplitude * 1.3, 20),
    initialRotate + random(-rotateAmplitude * 1.1, rotateAmplitude * 0.9, 21),
    initialRotate + random(-rotateAmplitude * 0.7, rotateAmplitude * 1.1, 22),
    initialRotate + random(-rotateAmplitude * 0.9, rotateAmplitude * 1.0, 23),
    initialRotate + random(-rotateAmplitude * 1.2, rotateAmplitude * 1.2, 24),
  ];

  // Blur y opacidad para profundidad atmosférica
  const blur = (1 - depth) * 2;
  const opacity = 0.7 + depth * 0.3;

  return (
    <motion.div
      className="absolute"
      style={{
        left: x,
        top: yOffset,
        width: `${80 * scale}px`,
        height: `${80 * scale}px`,
        filter: `drop-shadow(0 ${4 * depth}px ${8 * depth}px rgba(0,0,0,${
          0.15 * depth
        })) blur(${blur}px)`,
        opacity: opacity,
        zIndex: Math.round(depth * 15 - 5),
      }}
      initial={{
        y: yPoints[0],
        x: xPoints[0],
        rotate: rotatePoints[0],
      }}
      animate={{
        y: yPoints,
        x: xPoints,
        rotate: rotatePoints,
      }}
      transition={{
        duration: duration / speedFactor,
        repeat: Infinity,
        ease: "linear",
        delay: delay,
      }}
    >
      <KiteComponent />
    </motion.div>
  );
};

export function FlyingKites() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Detectar si es mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Configuración desktop: 12 volantines, velocidad normal
  const desktopKites = [
    {
      type: "C" as const,
      x: "15%",
      delay: 0,
      duration: 11,
      yOffset: "12%",
      scale: 1.3,
      depth: 1,
      initialRotate: -25,
    },
    {
      type: "B" as const,
      x: "78%",
      delay: 1.2,
      duration: 12,
      yOffset: "8%",
      scale: 1.25,
      depth: 0.95,
      initialRotate: 15,
    },
    {
      type: "D" as const,
      x: "45%",
      delay: 2.8,
      duration: 12,
      yOffset: "5%",
      scale: 1.0,
      depth: 0.75,
      initialRotate: -10,
    },
    {
      type: "A" as const,
      x: "88%",
      delay: 1.8,
      duration: 13,
      yOffset: "35%",
      scale: 0.95,
      depth: 0.7,
      initialRotate: 30,
    },
    {
      type: "C" as const,
      x: "25%",
      delay: 3.5,
      duration: 13,
      yOffset: "45%",
      scale: 0.9,
      depth: 0.65,
      initialRotate: -35,
    },
    {
      type: "B" as const,
      x: "62%",
      delay: 2.2,
      duration: 14,
      yOffset: "55%",
      scale: 0.7,
      depth: 0.5,
      initialRotate: 20,
    },
    {
      type: "D" as const,
      x: "8%",
      delay: 4.1,
      duration: 14,
      yOffset: "62%",
      scale: 0.65,
      depth: 0.45,
      initialRotate: -15,
    },
    {
      type: "A" as const,
      x: "52%",
      delay: 3.2,
      duration: 13,
      yOffset: "25%",
      scale: 0.8,
      depth: 0.6,
      initialRotate: 5,
    },
    {
      type: "B" as const,
      x: "35%",
      delay: 5,
      duration: 16,
      yOffset: "70%",
      scale: 0.5,
      depth: 0.3,
      initialRotate: -20,
    },
    {
      type: "D" as const,
      x: "72%",
      delay: 4.5,
      duration: 16,
      yOffset: "18%",
      scale: 0.55,
      depth: 0.35,
      initialRotate: 25,
    },
    {
      type: "A" as const,
      x: "5%",
      delay: 3.8,
      duration: 15,
      yOffset: "38%",
      scale: 0.6,
      depth: 0.4,
      initialRotate: -30,
    },
    {
      type: "C" as const,
      x: "92%",
      delay: 5.5,
      duration: 17,
      yOffset: "50%",
      scale: 0.52,
      depth: 0.32,
      initialRotate: 18,
    },
  ];

  // Configuración mobile: 4 volantines en los extremos, más lentos y difuminados
  const mobileKites = [
    // Esquina superior izquierda
    {
      type: "C" as const,
      x: "8%",
      delay: 0,
      duration: 28, // Muy lento
      yOffset: "5%",
      scale: 0.7, // Más pequeños
      depth: 0.4, // Más difuminados
      initialRotate: -20,
    },
    // Esquina superior derecha
    {
      type: "B" as const,
      x: "88%",
      delay: 3,
      duration: 30,
      yOffset: "8%",
      scale: 0.65,
      depth: 0.35,
      initialRotate: 15,
    },
    // Medio-bajo izquierda
    {
      type: "D" as const,
      x: "5%",
      delay: 6,
      duration: 32,
      yOffset: "70%",
      scale: 0.55,
      depth: 0.3,
      initialRotate: -15,
    },
    // Medio-bajo derecha
    {
      type: "A" as const,
      x: "90%",
      delay: 9,
      duration: 34,
      yOffset: "75%",
      scale: 0.5,
      depth: 0.28,
      initialRotate: 20,
    },
  ];

  const kites = isMobile ? mobileKites : desktopKites;

  // No renderizar en el servidor para evitar problemas de hidratación
  if (!mounted) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none" />
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {kites.map((kite, index) => (
        <Kite key={index} {...kite} />
      ))}
    </div>
  );
}
