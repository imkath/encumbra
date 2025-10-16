import React from "react";
import { ScoreTooltip } from "./ScoreTooltip";

export function scoreColor(score: number): string {
  if (score >= 80) return "bg-brand-500"; // Azul marca para óptimo
  if (score >= 60) return "bg-ok-500"; // Verde para bueno
  if (score >= 40) return "bg-mid-500"; // Amarillo para marginal
  return "bg-bad-500"; // Rojo para no recomendado
}

export function scoreTextColor(score: number): string {
  if (score >= 80) return "text-brand-600 dark:text-purple-400";
  if (score >= 60) return "text-ok-600 dark:text-green-400";
  if (score >= 40) return "text-mid-600 dark:text-yellow-400";
  return "text-bad-600 dark:text-red-400";
}

export function scoreBgColor(score: number): string {
  if (score >= 80)
    return "bg-brand-50 dark:bg-purple-950/30 border-brand-200 dark:border-purple-700/30";
  if (score >= 60)
    return "bg-ok-50 dark:bg-green-950/30 border-ok-200 dark:border-green-700/30";
  if (score >= 40)
    return "bg-mid-50 dark:bg-yellow-950/30 border-mid-200 dark:border-yellow-700/30";
  return "bg-bad-50 dark:bg-red-950/30 border-bad-200 dark:border-red-700/30";
}

interface WindowBadgeProps {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function WindowBadge({ score, label, size = "md" }: WindowBadgeProps) {
  const sizeClasses = {
    sm: {
      bar: "h-1.5 w-10",
      text: "text-xs",
      badge: "px-2 py-1 text-xs",
    },
    md: {
      bar: "h-2 w-12",
      text: "text-sm",
      badge: "px-2.5 py-1.5 text-sm",
    },
    lg: {
      bar: "h-2.5 w-16",
      text: "text-base",
      badge: "px-3 py-2 text-base",
    },
  };

  const classes = sizeClasses[size];

  return (
    <ScoreTooltip side="left">
      <div className="inline-flex items-center gap-2">
        <div
          className={`${
            classes.badge
          } rounded-button font-semibold border ${scoreBgColor(
            score
          )} ${scoreTextColor(score)}`}
        >
          {Math.round(score)}
        </div>
        {label && (
          <span
            className={`${classes.text} text-neutral-600 dark:text-neutral-300 font-medium`}
          >
            {label}
          </span>
        )}
      </div>
    </ScoreTooltip>
  );
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return "Óptimo";
  if (score >= 60) return "Bueno";
  if (score >= 40) return "Marginal";
  return "No recomendado";
}
