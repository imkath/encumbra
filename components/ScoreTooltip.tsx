"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { FaInfoCircle } from "react-icons/fa";

interface ScoreTooltipProps {
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
}

export function ScoreTooltip({
  children,
  side = "top",
  align = "center",
}: ScoreTooltipProps) {
  const [isTouch, setIsTouch] = useState(false);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasTouch = () =>
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches;

    setIsTouch(hasTouch());

    const mediaQuery = window.matchMedia("(pointer: coarse)");
    const handleChange = (event: MediaQueryListEvent) => {
      setIsTouch(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      // Safari
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  useEffect(() => {
    if (!isTouch || !open) return;

    const handleOutside = (event: Event) => {
      if (
        triggerRef.current &&
        event.target instanceof Node &&
        !triggerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("touchstart", handleOutside);
    document.addEventListener("click", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("click", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isTouch, open]);

  useEffect(() => {
    if (!isTouch) {
      setOpen(false);
    }
  }, [isTouch]);

  useEffect(() => {
    if (!isTouch || !open || !triggerRef.current) return;

    const node = triggerRef.current;

    requestAnimationFrame(() => {
      node.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    });
  }, [isTouch, open]);

  const handleTriggerClick = () => {
    if (isTouch) {
      setOpen((prev) => !prev);
    }
  };

  const focusTrigger = () => {
    if (!triggerRef.current) return;
    try {
      triggerRef.current.focus({ preventScroll: true } as FocusOptions);
    } catch {
      triggerRef.current.focus();
    }
  };

  const resolvedSide = isTouch ? "top" : side;
  const resolvedAlign = isTouch ? "center" : align;

  // Attach native touch listeners for the trigger element on touch devices.
  useAttachNativeTouchHandlers(triggerRef, isTouch, (v) => setOpen(v),
    focusTrigger);

  return (
    <Tooltip
      open={isTouch ? open : undefined}
      onOpenChange={isTouch ? setOpen : undefined}
    >
      <TooltipTrigger asChild>
        <span
          ref={triggerRef}
          tabIndex={0}
          role="button"
          /* For touch devices we attach native listeners with passive:false
             so we can call preventDefault without triggering the browser warning.
             Avoid calling preventDefault from React synthetic handlers because
             they may be registered as passive. */
          onKeyDown={(event) => {
            if (isTouch) return;
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setOpen((prev) => !prev);
            }
          }}
          // touch handlers moved to a native listener (see useEffect below)
          className="inline-flex items-center gap-1 cursor-help text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm group touch-manipulation"
          aria-expanded={isTouch ? open : undefined}
          aria-haspopup="true"
        >
          {children}
          <FaInfoCircle className="w-4 h-4 sm:w-3 sm:h-3 text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-purple-400 transition-colors" />
        </span>
      </TooltipTrigger>
      <TooltipContent
        side={resolvedSide}
        align={resolvedAlign}
        sideOffset={6}
        collisionPadding={16}
        /* TooltipContent touch handlers are unnecessary because the trigger
           has native touch listeners attached to the trigger element. */
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

// Attach native touch listeners to trigger element when on touch devices.
// We'll add the listeners in a separate effect so we can use passive: false.
// This avoids the browser warning when calling event.preventDefault().
function useAttachNativeTouchHandlers(
  ref: React.RefObject<HTMLElement | null>,
  isTouchDevice: boolean,
  setOpenState: (v: boolean) => void,
  focusFn: () => void
) {
  useEffect(() => {
    const node = ref.current;
    if (!node || !isTouchDevice) return;

    const onTouchStart = (event: TouchEvent) => {
      // Prevent default to avoid page scroll while interacting with tooltip
      event.preventDefault();
      event.stopPropagation();
      focusFn();
      setOpenState(true);
    };

    const onTouchMove = (event: TouchEvent) => {
      // Prevent accidental scrolling when moving finger over trigger
      event.preventDefault();
    };

    node.addEventListener("touchstart", onTouchStart, { passive: false });
    node.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      node.removeEventListener("touchstart", onTouchStart as EventListener);
      node.removeEventListener("touchmove", onTouchMove as EventListener);
    };
    // We intentionally exclude focusFn from deps because it's stable in this
    // component; include only values that matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, isTouchDevice, setOpenState]);
}

// Hook definition is below. The usage is inside the component above.
