"use client";

import { create } from "zustand";
import type { SceneId } from "@/lib/scenes";

export type InteractionPhase =
  | "INTRO_PLAYING"
  | "COLLECT_PAUSED"
  | "DRAGON_REVEAL_PLAYING"
  | "ALCHEMY_PAUSED"
  | "MECHANISM_PLAYING"
  | "PUZZLE_PAUSED"
  | "CLIMAX_PLAYING"
  | "REWARD_SHOWN";

type GameState = {
  currentScene: SceneId;
  phase: InteractionPhase;
  inventory: string[];
  isVideoTransitioning: boolean;
  dragonEyeInserted: boolean;
  completedCheckpoints: string[];
  addItem: (id: string) => void;
  removeItem: (id: string) => void;
  changeScene: (sceneId: SceneId) => void;
  setPhase: (phase: InteractionPhase) => void;
  completeCheckpoint: (id: string) => void;
  setVideoTransitioning: (isTransitioning: boolean) => void;
  insertDragonEye: () => void;
  resetGame: () => void;
};

const initialState = {
  currentScene: "SCENE_1_FOREST" as SceneId,
  phase: "INTRO_PLAYING" as InteractionPhase,
  inventory: [] as string[],
  isVideoTransitioning: false,
  dragonEyeInserted: false,
  completedCheckpoints: [] as string[]
};

export const useGameState = create<GameState>((set) => ({
  ...initialState,
  addItem: (id) =>
    set((state) => ({
      inventory: state.inventory.includes(id) ? state.inventory : [...state.inventory, id]
    })),
  removeItem: (id) =>
    set((state) => ({
      inventory: state.inventory.filter((itemId) => itemId !== id)
    })),
  changeScene: (sceneId) => set({ currentScene: sceneId }),
  setPhase: (phase) => set({ phase }),
  completeCheckpoint: (id) =>
    set((state) => ({
      completedCheckpoints: state.completedCheckpoints.includes(id)
        ? state.completedCheckpoints
        : [...state.completedCheckpoints, id]
    })),
  setVideoTransitioning: (isTransitioning) =>
    set({ isVideoTransitioning: isTransitioning }),
  insertDragonEye: () =>
    set((state) => ({
      dragonEyeInserted: true,
      inventory: state.inventory.includes("dragon_eye")
        ? state.inventory
        : [...state.inventory, "dragon_eye"]
    })),
  resetGame: () => set(initialState)
}));
