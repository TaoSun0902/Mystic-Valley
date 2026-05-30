"use client";

import {
  DndContext,
  DragEndEvent,
  useDraggable,
  useDroppable
} from "@dnd-kit/core";
import { Check, Copy, Play } from "lucide-react";
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import {
  CHECKPOINTS,
  GIFT_CODE,
  collectHotspots,
  dragonEyeSocket
} from "@/lib/interactionFlow";
import { useGameState } from "@/store/gameStore";
import { GameHud } from "@/components/GameHud";

const grassIds = ["grass_1", "grass_2", "grass_3"];

export function InteractiveVideoExperience() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const phase = useGameState((state) => state.phase);
  const inventory = useGameState((state) => state.inventory);
  const completedCheckpoints = useGameState((state) => state.completedCheckpoints);
  const addItem = useGameState((state) => state.addItem);
  const completeCheckpoint = useGameState((state) => state.completeCheckpoint);
  const resetGame = useGameState((state) => state.resetGame);
  const setPhase = useGameState((state) => state.setPhase);

  const [needsStart, setNeedsStart] = useState(false);
  const [whiteFlash, setWhiteFlash] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const playPromise = video.play();
    if (playPromise) {
      void playPromise.catch(() => setNeedsStart(true));
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const handleTimeUpdate = () => {
      const time = video.currentTime;

      if (time >= CHECKPOINTS.collect && !completedCheckpoints.includes("collect")) {
        video.pause();
        setPhase("COLLECT_PAUSED");
      }

      if (time >= CHECKPOINTS.alchemy && !completedCheckpoints.includes("alchemy")) {
        video.pause();
        setPhase("ALCHEMY_PAUSED");
      }

      if (time >= CHECKPOINTS.puzzle && !completedCheckpoints.includes("puzzle")) {
        video.pause();
        setPhase("PUZZLE_PAUSED");
      }

      if (time >= CHECKPOINTS.reward && !completedCheckpoints.includes("reward")) {
        video.pause();
        completeCheckpoint("reward");
        setPhase("REWARD_SHOWN");
      }
    };

    const handleEnded = () => {
      completeCheckpoint("reward");
      setPhase("REWARD_SHOWN");
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [completeCheckpoint, completedCheckpoints, setPhase]);

  function playNext(nextPhase: Parameters<typeof setPhase>[0]) {
    const video = videoRef.current;

    setPhase(nextPhase);
    if (video) {
      void video.play().catch(() => setNeedsStart(true));
    }
  }

  function handleCollect(itemId: string) {
    addItem(itemId);

    const nextInventory = inventory.includes(itemId)
      ? inventory
      : [...inventory, itemId];
    const collectedGrassCount = nextInventory.filter((id) => grassIds.includes(id)).length;

    if (collectedGrassCount >= 3) {
      completeCheckpoint("collect");
      window.setTimeout(() => playNext("DRAGON_REVEAL_PLAYING"), 520);
    }
  }

  function handleAlchemyComplete() {
    completeCheckpoint("alchemy");
    playNext("MECHANISM_PLAYING");
  }

  function handleRuneSuccess() {
    setWhiteFlash(true);
    completeCheckpoint("puzzle");

    window.setTimeout(() => {
      setWhiteFlash(false);
      playNext("CLIMAX_PLAYING");
    }, 300);
  }

  function handleReset() {
    resetGame();
    setNeedsStart(false);
    setWhiteFlash(false);

    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      void video.play().catch(() => setNeedsStart(true));
    }
  }

  return (
    <>
      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-cover ${
          phase === "MECHANISM_PLAYING" ? "screen-shake" : ""
        }`}
        src="/videos/main.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
      />

      <GameHud onReset={handleReset} />

      {phase === "COLLECT_PAUSED" ? (
        <CollectLayer inventory={inventory} onCollect={handleCollect} />
      ) : null}

      {phase === "ALCHEMY_PAUSED" ? (
        <AlchemyLayer onComplete={handleAlchemyComplete} />
      ) : null}

      {phase === "PUZZLE_PAUSED" ? (
        <RuneConsole onSuccess={handleRuneSuccess} />
      ) : null}

      {phase === "REWARD_SHOWN" ? <RewardCard /> : null}

      <div
        className={`pointer-events-none absolute inset-0 z-40 bg-white transition-opacity duration-150 ${
          whiteFlash ? "opacity-95" : "opacity-0"
        }`}
      />

      {needsStart ? (
        <button
          type="button"
          onClick={() => {
            setNeedsStart(false);
            void videoRef.current?.play().catch(() => setNeedsStart(true));
          }}
          className="absolute inset-0 z-50 grid place-items-center bg-black/55 text-amber-50 backdrop-blur-sm"
        >
          <span className="grid h-20 w-20 place-items-center rounded-full border border-amber-100/45 bg-amber-200/15 shadow-rune">
            <Play size={28} fill="currentColor" />
          </span>
        </button>
      ) : null}
    </>
  );
}

function CollectLayer({
  inventory,
  onCollect
}: {
  inventory: string[];
  onCollect: (itemId: string) => void;
}) {
  const collectedGrass = inventory.filter((id) => grassIds.includes(id));

  return (
    <>
      <div className="absolute inset-0 z-20">
        {collectHotspots.map((hotspot, index) => {
          const collected = inventory.includes(hotspot.id);

          return (
            <button
              key={hotspot.id}
              type="button"
              aria-label={hotspot.label}
              disabled={collected}
              onClick={() => onCollect(hotspot.id)}
              className={`game-item-hotspot absolute transition ${
                collected ? "scale-75 opacity-0" : "hotspot-pulse opacity-100"
              }`}
              style={{
                left: `${hotspot.x}%`,
                top: `${hotspot.y}%`,
                width: `${hotspot.width}%`,
                height: `${hotspot.height}%`,
                animationDelay: `${index * 120}ms`
              }}
            >
              <span className="game-icon game-icon-grass" />
              <span className="tap-cue">TAP</span>
              <span className="sr-only">{hotspot.label}</span>
            </button>
          );
        })}
      </div>
      <InventoryDock items={collectedGrass} />
    </>
  );
}

function InventoryDock({ items }: { items: string[] }) {
  return (
    <div className="game-dock pointer-events-none absolute inset-x-3 bottom-3 z-30 p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs uppercase tracking-[0.2em] text-amber-100/70">アイテムポーチ</div>
        <div className="text-xs font-semibold text-lime-100">{items.length}/3</div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {grassIds.map((id) => (
          <div
            key={id}
            className={`game-slot ${items.includes(id) ? "game-slot-filled" : ""}`}
          >
            {items.includes(id) ? <span className="game-icon game-icon-grass" /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function AlchemyLayer({ onComplete }: { onComplete: () => void }) {
  const inventory = useGameState((state) => state.inventory);
  const removeItem = useGameState((state) => state.removeItem);
  const insertDragonEye = useGameState((state) => state.insertDragonEye);
  const [offeredGrass, setOfferedGrass] = useState<string[]>([]);
  const [eyeGlowKey, setEyeGlowKey] = useState(0);

  const availableGrass = useMemo(
    () => inventory.filter((id) => grassIds.includes(id)),
    [inventory]
  );

  function handleDragEnd(event: DragEndEvent) {
    const itemId = String(event.active.id);

    if (event.over?.id === dragonEyeSocket.id && grassIds.includes(itemId)) {
      if (offeredGrass.includes(itemId)) {
        return;
      }

      const nextItems = [...offeredGrass, itemId];
      setOfferedGrass(nextItems);
      removeItem(itemId);
      setEyeGlowKey((value) => value + 1);

      if (nextItems.length === 3) {
        insertDragonEye();
        window.setTimeout(onComplete, 620);
      }
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <DragonEyeSocket active glowKey={eyeGlowKey} progress={offeredGrass.length} />
      <div className="game-dock pointer-events-auto absolute inset-x-3 bottom-3 z-30 p-3 pb-[calc(env(safe-area-inset-bottom)+12px)] text-cyan-50">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-100/70">
              Alchemy
            </div>
            <div className="mt-1 text-sm font-semibold">
              光る草を竜の瞳へ
            </div>
          </div>
          <div className="text-xs font-semibold text-cyan-100">{offeredGrass.length}/3</div>
        </div>
        <AlchemyRitualMeter count={offeredGrass.length} />
        <div className="mt-3 flex min-h-14 flex-wrap gap-2">
          {availableGrass.map((id) => (
            <DraggableToken key={id} id={id} label="光る草" tone="grass" />
          ))}
        </div>
      </div>
    </DndContext>
  );
}

function AlchemyRitualMeter({ count }: { count: number }) {
  return (
    <div className="alchemy-drop mt-3 min-h-32">
      <div className="alchemy-sigil" />
      <div className="relative z-10 text-center text-sm font-semibold text-cyan-50">
        {count < 3 ? `竜の瞳へ捧げる ${count}/3` : "竜の瞳が目覚める"}
      </div>
    </div>
  );
}

function DragonEyeSocket({
  active,
  glowKey,
  progress
}: {
  active: boolean;
  glowKey: number;
  progress: number;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: dragonEyeSocket.id });

  return (
    <div
      ref={setNodeRef}
      className={`dragon-socket absolute z-20 transition ${
        active ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      } ${isOver ? "dragon-socket-active" : ""}`}
      style={{
        left: `${dragonEyeSocket.x}%`,
        top: `${dragonEyeSocket.y}%`,
        width: `${dragonEyeSocket.width}%`,
        height: `${dragonEyeSocket.height}%`
      }}
      aria-label={dragonEyeSocket.label}
    >
      <span className="game-icon game-icon-eye" />
      {glowKey > 0 ? <span key={glowKey} className="dragon-eye-burst" /> : null}
      <span className="dragon-socket-count">{progress}/3</span>
    </div>
  );
}

function DraggableToken({
  id,
  label,
  tone
}: {
  id: string;
  label: string;
  tone: "grass" | "eye";
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id
  });
  const style: CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined
  };

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      className={`game-token ${tone === "eye" ? "game-token-eye" : "game-token-grass"} ${
        isDragging ? "scale-105 opacity-80" : ""
      }`}
      {...listeners}
      {...attributes}
    >
      <span className={`game-icon ${tone === "eye" ? "game-icon-eye" : "game-icon-grass"}`} />
      <span>{label}</span>
    </button>
  );
}

function RuneConsole({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [hasError, setHasError] = useState(false);

  function submit() {
    if (code.trim().toUpperCase() === "DRAGON") {
      setHasError(false);
      onSuccess();
      return;
    }

    setHasError(true);
    window.setTimeout(() => setHasError(false), 420);
  }

  return (
    <div className="rune-panel pointer-events-auto absolute inset-x-3 bottom-3 z-30 p-4 pb-[calc(env(safe-area-inset-bottom)+14px)] text-sky-50">
      <div className="rune-console-art" />
      <div className="relative z-10 text-[11px] uppercase tracking-[0.2em] text-sky-100/70">
        Rune Console
      </div>
      <div className="relative z-10 mt-1 text-sm font-semibold">竜語コードを入力</div>
      <div className={`relative z-10 mt-3 grid gap-3 ${hasError ? "ui-shake" : ""}`}>
        <input
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase().slice(0, 6))}
          placeholder="DRAGON"
          inputMode="text"
          autoCapitalize="characters"
          className="h-12 border border-sky-100/40 bg-sky-100/10 px-4 text-center text-lg font-semibold uppercase tracking-[0.24em] text-sky-50 outline-none placeholder:text-sky-100/30 focus:border-sky-100"
        />
        <button
          type="button"
          onClick={submit}
          className="h-12 border border-sky-100/45 bg-sky-200/18 text-sm font-semibold uppercase tracking-[0.16em] text-sky-50 transition hover:bg-sky-200/28"
        >
          魔力を注入
        </button>
        <div className="min-h-4 text-center text-xs text-sky-100/75">
          {hasError ? "コードが違います。もう一度試してください" : " "}
        </div>
      </div>
    </div>
  );
}

function RewardCard() {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(GIFT_CODE);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-black/48 p-5 backdrop-blur-[2px]">
      <section className="reward-card game-reward w-full max-w-[330px] p-5 text-center text-amber-50">
        <div className="reward-crystal mx-auto" />
        <div className="mt-4 text-xs uppercase tracking-[0.22em] text-amber-100/75">
          PixVerse Gift Code
        </div>
        <div className="mt-2 text-lg font-semibold">報酬を獲得しました</div>
        <div className="mt-3 border border-amber-100/30 bg-amber-100/12 px-3 py-3 text-sm font-semibold tracking-[0.12em]">
          {GIFT_CODE}
        </div>
        <button
          type="button"
          onClick={copyCode}
          className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 border border-amber-100/45 bg-amber-200/20 text-sm font-semibold uppercase tracking-[0.14em] transition hover:bg-amber-200/30"
        >
          {copied ? <Check size={17} /> : <Copy size={17} />}
          {copied ? "コピーしました" : "コードをコピー"}
        </button>
      </section>
    </div>
  );
}
