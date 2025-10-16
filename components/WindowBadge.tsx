import React from "react";
import { ScoreTooltip } from "./ScoreTooltip";

export function scoreColor(score: number): string {
  if (score >= 80) return "bg-brand-500"; // Azul marca para óptimo
  if (score >= 60) return "bg-ok-500"; // Verde para bueno
  if (score >= 40) return "bg-mid-500"; // Amarillo para marginal
  return "bg-bad-500"; // Rojo para no recomendado
}

export function scoreTextColor(score: number): string {
  if (score >= 80) return "text-brand-600";
  if (score >= 60) return "text-ok-600";
  if (score >= 40) return "text-mid-600";
  return "text-bad-600";
}

export function scoreBgColor(score: number): string {
  if (score >= 80) return "bg-brand-50 border-brand-200";
  if (score >= 60) return "bg-ok-50 border-ok-200";
  if (score >= 40) return "bg-mid-50 border-mid-200";
  return "bg-bad-50 border-bad-200";
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
          <span className={`${classes.text} text-neutral-600 font-medium`}>
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
