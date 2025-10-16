"use client";

import { FaBox, FaChild, FaExclamationCircle } from "react-icons/fa";

export function SafetyBadges() {
  const badges = [
    {
      icon: FaBox,
      text: "Hilo de algodón",
      color: "text-green-700 dark:text-green-400",
      bg: "bg-neutral-100 dark:bg-neutral-700",
    },
    {
      icon: FaChild,
      text: "Niños con adulto",
      color: "text-blue-700 dark:text-blue-400",
      bg: "bg-neutral-100 dark:bg-neutral-700",
    },
    {
      icon: FaExclamationCircle,
      text: "No rescatar en altura",
      color: "text-amber-700 dark:text-amber-400",
      bg: "bg-neutral-100 dark:bg-neutral-700",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-2 pb-0 sm:pb-1">
      {badges.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <div
            key={index}
            className={`${badge.bg} flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium`}
          >
            <Icon className={`${badge.color} text-sm`} />
            <span className="text-neutral-700 dark:text-neutral-300">
              {badge.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}
