"use client";

import { FaBullseye, FaClock, FaMapMarkerAlt, FaBell } from "react-icons/fa";

export type MobileTabKey = "summary" | "windows" | "map" | "alerts";

interface MobileTabBarProps {
  activeTab: MobileTabKey;
  onChange: (tab: MobileTabKey) => void;
}

const TABS: { key: MobileTabKey; label: string; icon: React.ElementType }[] = [
  { key: "summary", label: "Inicio", icon: FaBullseye },
  { key: "windows", label: "Ventanas", icon: FaClock },
  { key: "map", label: "Mapa", icon: FaMapMarkerAlt },
  { key: "alerts", label: "Alertas", icon: FaBell },
];

export function MobileTabBar({ activeTab, onChange }: MobileTabBarProps) {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-lg border-t border-neutral-200 dark:border-neutral-800 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] pointer-events-auto"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 grid grid-cols-4 gap-2">
        {TABS.map(({ key, label, icon: Icon }) => {
          const isActive = key === activeTab;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition-all ${
                isActive
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20"
                  : "bg-white/70 dark:bg-neutral-800/80 text-neutral-500 dark:text-neutral-400 border border-transparent"
              }`}
              aria-pressed={isActive}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive
                    ? "text-white"
                    : "text-neutral-400 dark:text-neutral-500"
                }`}
              />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
