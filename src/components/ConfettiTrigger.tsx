"use client";

import { useEffect, useRef } from "react";
import confetti, { type Options } from "canvas-confetti";

interface ConfettiTriggerProps {
  isCorrect: boolean | null;
}

export default function ConfettiTrigger({ isCorrect }: ConfettiTriggerProps) {
  const prevCorrect = useRef<boolean | null>(null);

  useEffect(() => {
    if (isCorrect !== true) {
      prevCorrect.current = isCorrect;
      return;
    }
    if (prevCorrect.current === true) return;
    prevCorrect.current = true;

    const fire = (opts: Options) => {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
        colors: ["#f59e0b", "#f97316", "#fb923c", "#fbbf24", "#fcd34d"],
        ...opts,
      });
    };

    fire({});
    const t1 = setTimeout(() => fire({ origin: { x: 0.2, y: 0.7 } }), 150);
    const t2 = setTimeout(() => fire({ origin: { x: 0.8, y: 0.7 } }), 300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isCorrect]);

  return null;
}
