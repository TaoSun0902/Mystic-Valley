"use client";

import type { HotspotAction, SceneConfig } from "@/lib/scenes";
import { useGameState } from "@/store/gameStore";

type HotspotLayerProps = {
  scene: SceneConfig;
  onTrigger: (action: HotspotAction) => void;
};

export function HotspotLayer({ scene, onTrigger }: HotspotLayerProps) {
  const inventory = useGameState((state) => state.inventory);
  const isVideoTransitioning = useGameState((state) => state.isVideoTransitioning);

  return (
    <div className="absolute inset-0 z-10">
      {scene.hotspots.map((hotspot) => {
        const disabled =
          isVideoTransitioning ||
          Boolean(hotspot.requiredItemId && !inventory.includes(hotspot.requiredItemId));

        return (
          <button
            key={hotspot.id}
            type="button"
            aria-label={hotspot.label}
            disabled={disabled}
            onClick={() => onTrigger(hotspot)}
            className="absolute border border-amber-200/45 bg-amber-200/10 text-[0px] outline-none transition hover:bg-amber-200/20 focus-visible:ring-2 focus-visible:ring-amber-200 disabled:pointer-events-none disabled:opacity-25"
            style={{
              left: `${hotspot.x}%`,
              top: `${hotspot.y}%`,
              width: `${hotspot.width}%`,
              height: `${hotspot.height}%`
            }}
          >
            {hotspot.label}
          </button>
        );
      })}
    </div>
  );
}
