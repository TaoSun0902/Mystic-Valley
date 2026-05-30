"use client";

import { RotateCcw } from "lucide-react";
import { useGameState } from "@/store/gameStore";

type GameHudProps = {
  onReset?: () => void;
};

export function GameHud({ onReset }: GameHudProps) {
  const resetGame = useGameState((state) => state.resetGame);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-start justify-end p-3 pt-[calc(env(safe-area-inset-top)+12px)] text-amber-50 sm:left-1/2 sm:max-w-[430px] sm:-translate-x-1/2">
      <button
        type="button"
        aria-label="リセット"
        title="リセット"
        onClick={onReset ?? resetGame}
        className="pointer-events-auto grid h-12 w-12 shrink-0 place-items-center border border-amber-100/50 bg-black/36 text-amber-50 shadow-rune backdrop-blur-md transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
      >
        <RotateCcw size={18} />
      </button>
    </div>
  );
}
