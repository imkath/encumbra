"use client";

import React from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { FaInfoCircle } from "react-icons/fa";

interface ScoreTooltipProps {
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}

export function ScoreTooltip({ children, side = "top" }: ScoreTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 cursor-help">
          {children}
          <FaInfoCircle className="w-3 h-3 text-neutral-400 hover:text-blue-600 transition-colors" />
        </span>
      </TooltipTrigger>
      <TooltipContent
        side={side}
        className="max-w-xs bg-neutral-900 text-white border-neutral-700"
      >
        <div className="space-y-1">
          <p className="font-semibold">Q-Score: Índice Volantín</p>
          <p className="text-xs">
            Puntaje de 0-100 que indica qué tan buenas son las condiciones.
          </p>
          <div className="text-xs space-y-0.5 pt-1 border-t border-neutral-700">
            <div>
              <strong className="text-green-400">80+</strong> Excelente
            </div>
            <div>
              <strong className="text-blue-400">60-79</strong> Bueno
            </div>
            <div>
              <strong className="text-yellow-400">40-59</strong> Marginal
            </div>
            <div>
              <strong className="text-red-400">0-39</strong> No recomendado
            </div>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
