export const colors = {
  // Paleta primaria - Azules modernos
  primary: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9",
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e",
  },

  // Acentos - Verde neón suave
  accent: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
  },

  // Alertas - Coral/Naranja moderno
  warning: {
    50: "#fff7ed",
    100: "#ffedd5",
    200: "#fed7aa",
    300: "#fdba74",
    400: "#fb923c",
    500: "#f97316",
  },

  // Neutrales - Grises fríos
  neutral: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },
};

export const gradients = {
  // Cielo sutil
  sky: "bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50",
  skyText: "bg-gradient-to-r from-blue-600 to-cyan-600",

  // Cards con glassmorphism
  glass: "bg-white/80 backdrop-blur-xl",
  glassHover: "hover:bg-white/90",

  // Condiciones buenas
  good: "bg-gradient-to-br from-emerald-50 to-green-50",
  goodAccent: "from-green-400 to-emerald-500",

  // Advertencias
  alert: "bg-gradient-to-br from-orange-50 to-amber-50",
  alertAccent: "from-orange-400 to-amber-500",
};

export const shadows = {
  // Sombras sutiles modernas
  sm: "shadow-sm shadow-black/5",
  md: "shadow-md shadow-black/10",
  lg: "shadow-lg shadow-black/10",
  xl: "shadow-xl shadow-black/10",
  "2xl": "shadow-2xl shadow-black/15",

  // Sombras de color para acentos
  accent: "shadow-lg shadow-green-500/20",
  primary: "shadow-lg shadow-blue-500/20",
};

export const borders = {
  // Borders sutiles
  light: "border border-neutral-200/50",
  medium: "border border-neutral-300/50",
  strong: "border-2 border-neutral-300",

  // Borders con color
  accent: "border-2 border-green-200",
  primary: "border-2 border-blue-200",
};

export const spacing = {
  // Spacing generoso para diseño moderno
  card: "p-6 md:p-8",
  section: "py-12 md:py-16",
  gap: "gap-6 md:gap-8",
};

export const typography = {
  // Tipografía limpia y legible
  hero: "text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight",
  title: "text-2xl md:text-3xl font-bold tracking-tight",
  subtitle: "text-lg md:text-xl text-neutral-600",
  body: "text-base text-neutral-700 leading-relaxed",
  small: "text-sm text-neutral-600",
};

export const animations = {
  // Transiciones suaves
  fast: "transition-all duration-150 ease-out",
  normal: "transition-all duration-300 ease-out",
  slow: "transition-all duration-500 ease-out",

  // Hover states modernos
  hover: "hover:scale-[1.02] hover:shadow-lg",
  hoverSubtle: "hover:shadow-md hover:-translate-y-0.5",
};

export const buttons = {
  // Botones primarios
  primary: `
    px-6 py-3 rounded-xl font-semibold
    bg-gradient-to-r from-blue-500 to-cyan-500
    text-white
    hover:from-blue-600 hover:to-cyan-600
    shadow-lg shadow-blue-500/25
    transition-all duration-200
    hover:shadow-xl hover:shadow-blue-500/30
    hover:scale-[1.02]
    active:scale-[0.98]
  `,

  // Botones secundarios con glassmorphism
  secondary: `
    px-6 py-3 rounded-xl font-semibold
    bg-white/60 backdrop-blur-md
    border border-neutral-200/50
    text-neutral-700
    hover:bg-white/80
    shadow-md shadow-black/5
    transition-all duration-200
    hover:shadow-lg
    hover:scale-[1.02]
    active:scale-[0.98]
  `,

  // Botones de acción verde
  accent: `
    px-6 py-3 rounded-xl font-semibold
    bg-gradient-to-r from-green-500 to-emerald-500
    text-white
    hover:from-green-600 hover:to-emerald-600
    shadow-lg shadow-green-500/25
    transition-all duration-200
    hover:shadow-xl hover:shadow-green-500/30
    hover:scale-[1.02]
    active:scale-[0.98]
  `,
};

export const cards = {
  // Card base con glassmorphism
  base: `
    bg-white/80 backdrop-blur-xl
    border border-neutral-200/50
    rounded-2xl
    p-6
    shadow-lg shadow-black/5
    transition-all duration-300
  `,

  // Card interactivo
  interactive: `
    bg-white/80 backdrop-blur-xl
    border border-neutral-200/50
    rounded-2xl
    p-6
    shadow-lg shadow-black/5
    transition-all duration-300
    hover:shadow-xl hover:shadow-black/10
    hover:-translate-y-1
    cursor-pointer
  `,

  // Card destacado
  featured: `
    bg-white/90 backdrop-blur-xl
    border-2 border-blue-200/50
    rounded-2xl
    p-8
    shadow-xl shadow-blue-500/10
  `,
};
