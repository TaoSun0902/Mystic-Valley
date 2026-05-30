"use client";

import {
  DndContext,
  DragEndEvent,
  useDraggable,
  useDroppable
} from "@dnd-kit/core";
import { Check, Copy, ExternalLink, Play, RotateCcw } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import {
  CHECKPOINTS,
  GIFT_CODE,
  collectHotspots,
  dragonEyeSocket
} from "@/lib/interactionFlow";
import { useGameState } from "@/store/gameStore";

const grassIds = ["grass_1", "grass_2", "grass_3"];
const lightPattern = [0, 2, 4, 1, 3];
const introCopy =
  "世界の果て、青き霧の谷。\n失われたルーンを解き、\n眠れる巨竜を呼び覚ませ。\n旅は、ここから始まる。";

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
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (showIntro) {
      video.pause();
      return;
    }

    const playPromise = video.play();
    if (playPromise) {
      void playPromise.catch(() => setNeedsStart(true));
    }
  }, [showIntro]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const handleTimeUpdate = () => {
      if (
        video.currentTime >= CHECKPOINTS.collect &&
        !completedCheckpoints.includes("collect")
      ) {
        video.pause();
        setPhase("COLLECT_PAUSED");
      }

      if (
        video.currentTime >= CHECKPOINTS.alchemy &&
        !completedCheckpoints.includes("alchemy")
      ) {
        video.pause();
        setPhase("ALCHEMY_PAUSED");
      }

      if (
        video.currentTime >= CHECKPOINTS.puzzle &&
        !completedCheckpoints.includes("puzzle")
      ) {
        video.pause();
        setPhase("PUZZLE_PAUSED");
      }

      if (
        video.currentTime >= CHECKPOINTS.reward &&
        !completedCheckpoints.includes("reward")
      ) {
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

    const nextInventory = inventory.includes(itemId) ? inventory : [...inventory, itemId];
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

  function handleLightSigilComplete() {
    completeCheckpoint("puzzle");
    playNext("CLIMAX_PLAYING");
  }

  function handleReset() {
    resetGame();
    setNeedsStart(false);
    setShowIntro(true);

    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.pause();
    }
  }

  function handleIntroStart() {
    setShowIntro(false);
    setNeedsStart(false);

    const video = videoRef.current;
    if (video) {
      void video.play().catch(() => setNeedsStart(true));
    }
  }

  return (
    <>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/main.mp4"
        autoPlay={!showIntro}
        muted
        playsInline
        preload="auto"
      />

      {phase === "COLLECT_PAUSED" ? (
        <CollectLayer inventory={inventory} onCollect={handleCollect} />
      ) : null}

      {phase === "ALCHEMY_PAUSED" ? (
        <AlchemyLayer onComplete={handleAlchemyComplete} />
      ) : null}

      {phase === "PUZZLE_PAUSED" ? (
        <LightSigilPuzzle onComplete={handleLightSigilComplete} />
      ) : null}

      {phase === "REWARD_SHOWN" ? <RewardCard onReplay={handleReset} /> : null}

      {showIntro ? <IntroOverlay onStart={handleIntroStart} /> : null}

      {needsStart ? (
        <button
          type="button"
          aria-label="play"
          title="play"
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

function IntroOverlay({ onStart }: { onStart: () => void }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const isComplete = visibleCount >= introCopy.length;

  useEffect(() => {
    if (isComplete) {
      return;
    }

    const timer = window.setInterval(() => {
      setVisibleCount((count) => Math.min(count + 1, introCopy.length));
    }, 42);

    return () => window.clearInterval(timer);
  }, [isComplete]);

  return (
    <div className="intro-overlay absolute inset-0 z-50 flex items-end">
      <div className="intro-copy w-full px-6 pb-[calc(env(safe-area-inset-bottom)+48px)] pt-24">
        <div className="intro-title">Mystic Valley</div>
        <p className="intro-typewriter" aria-live="polite">
          {introCopy.slice(0, visibleCount)}
          <span className="intro-caret" />
        </p>
        <button
          type="button"
          onClick={onStart}
          className={`intro-start ${isComplete ? "opacity-100" : "opacity-0"}`}
          disabled={!isComplete}
        >
          冒険を始める
        </button>
      </div>
    </div>
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
      <HintPill>光る草を集める</HintPill>
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
            </button>
          );
        })}
      </div>
      <InventoryDock items={collectedGrass} />
    </>
  );
}

function AlchemyLayer({ onComplete }: { onComplete: () => void }) {
  const inventory = useGameState((state) => state.inventory);
  const removeItem = useGameState((state) => state.removeItem);
  const insertDragonEye = useGameState((state) => state.insertDragonEye);
  const [offeredGrass, setOfferedGrass] = useState<string[]>([]);
  const [eyeGlowKey, setEyeGlowKey] = useState(0);

  const availableGrass = inventory.filter((id) => grassIds.includes(id));

  function handleDragEnd(event: DragEndEvent) {
    const itemId = String(event.active.id);

    if (event.over?.id !== dragonEyeSocket.id || !grassIds.includes(itemId)) {
      return;
    }

    if (offeredGrass.includes(itemId)) {
      return;
    }

    const nextItems = [...offeredGrass, itemId];
    setOfferedGrass(nextItems);
    removeItem(itemId);
    setEyeGlowKey((value) => value + 1);

    if (nextItems.length === 3) {
      insertDragonEye();
      window.setTimeout(onComplete, 520);
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <HintPill>草を瞳へ</HintPill>
      <HiddenDragonEyeDropZone glowKey={eyeGlowKey} />
      <InventoryDock items={availableGrass} draggable />
    </DndContext>
  );
}

function HiddenDragonEyeDropZone({ glowKey }: { glowKey: number }) {
  const { setNodeRef } = useDroppable({ id: dragonEyeSocket.id });

  return (
    <div
      ref={setNodeRef}
      className="dragon-eye-drop-zone absolute z-20"
      style={{
        left: `${dragonEyeSocket.x}%`,
        top: `${dragonEyeSocket.y}%`,
        width: `${dragonEyeSocket.width}%`,
        height: `${dragonEyeSocket.height}%`
      }}
      aria-label={dragonEyeSocket.label}
    >
      {glowKey > 0 ? (
        <span key={glowKey} className="dragon-eye-drop-burst" />
      ) : null}
    </div>
  );
}

function LightSigilPuzzle({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [litNodes, setLitNodes] = useState<number[]>([]);
  const [isSolved, setIsSolved] = useState(false);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [replayKey, setReplayKey] = useState(0);

  useEffect(() => {
    const timers = lightPattern.map((node, index) =>
      window.setTimeout(() => {
        setActiveNode(node);
        window.setTimeout(() => setActiveNode(null), 260);
      }, 420 + index * 360)
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [replayKey]);

  function resetPattern() {
    setStep(0);
    setLitNodes([]);
    setActiveNode(null);
  }

  function replayPattern() {
    resetPattern();
    setMistakeCount(0);
    setReplayKey((key) => key + 1);
  }

  function handleNodePress(node: number) {
    if (isSolved) {
      return;
    }

    if (node !== lightPattern[step]) {
      setActiveNode(node);
      const nextMistakeCount = mistakeCount + 1;
      setMistakeCount(nextMistakeCount);
      window.setTimeout(nextMistakeCount >= 3 ? replayPattern : resetPattern, 260);
      return;
    }

    const nextStep = step + 1;
    const nextLitNodes = [...litNodes, node];
    setStep(nextStep);
    setLitNodes(nextLitNodes);
    setActiveNode(node);
    window.setTimeout(() => setActiveNode(null), 220);

    if (nextStep === lightPattern.length) {
      setIsSolved(true);
      window.setTimeout(onComplete, 420);
    }
  }

  return (
    <div className="light-sigil-layer pointer-events-auto absolute inset-0 z-30 grid place-items-center">
      <HintPill>光の順をなぞる</HintPill>
      <div className={`hand-sigil ${isSolved ? "hand-sigil-solved" : ""}`}>
        <div className="hand-sigil-core" />
        <div className="hand-sigil-line hand-sigil-line-1" />
        <div className="hand-sigil-line hand-sigil-line-2" />
        <div className="hand-sigil-line hand-sigil-line-3" />
        {lightPattern.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`light node ${index + 1}`}
            onClick={() => handleNodePress(index)}
            className={`light-node light-node-${index + 1} ${
              activeNode === index || litNodes.includes(index) ? "light-node-lit" : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function HintPill({ children }: { children: string }) {
  return (
    <div className="hint-pill pointer-events-none absolute left-1/2 top-[calc(env(safe-area-inset-top)+18px)] z-30 -translate-x-1/2">
      {children}
    </div>
  );
}

function InventoryDock({
  items,
  draggable = false
}: {
  items: string[];
  draggable?: boolean;
}) {
  return (
    <div className="game-dock pointer-events-none absolute inset-x-3 bottom-3 z-30 p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
      <div className="grid grid-cols-3 gap-2">
        {grassIds.map((id) => (
          <div
            key={id}
            className={`game-slot ${items.includes(id) ? "game-slot-filled" : ""}`}
            aria-label={items.includes(id) ? "glowing grass" : "empty slot"}
          >
            {items.includes(id) ? (
              draggable ? (
                <DraggableGrass id={id} />
              ) : (
                <span className="game-icon game-icon-grass" />
              )
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function DraggableGrass({ id }: { id: string }) {
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
      aria-label="glowing grass"
      style={style}
      className={`game-grass-token ${isDragging ? "scale-110 opacity-80" : ""}`}
      {...listeners}
      {...attributes}
    >
      <span className="game-icon game-icon-grass" />
    </button>
  );
}

function RewardCard({ onReplay }: { onReplay: () => void }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(GIFT_CODE);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-black/65 p-5 backdrop-blur-[4px]">
      <section className="reward-card game-reward w-full max-w-[340px] p-6 text-center text-amber-50">
        {/* Decorative Elements */}
        <div className="reward-scanline" />
        <div className="reward-glitch-border" />

        <div className="reward-crystal mx-auto mb-6" />

        <div className="relative z-10">
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-sky-300/80">
            Protocol: Reward Unlocked
          </div>
          <div className="mt-2 text-xl font-bold tracking-tight text-white">
            眠れる守護者が目覚めた
          </div>
          <p className="mt-3 text-xs leading-relaxed text-sky-100/60">
            ルーンの謎を解き明かした探求者へ、<br />
            谷からの贈り物です。
          </p>

          <div className="reward-code-box mt-6 px-4 py-4">
            <div className="text-[9px] uppercase tracking-widest text-sky-400/50 mb-1 text-left">Access Code</div>
            <div className="text-lg font-mono font-bold tracking-[0.2em] text-sky-100">
              {GIFT_CODE}
            </div>
          </div>

          <button
            type="button"
            onClick={copyCode}
            className="reward-btn-primary mt-6 inline-flex h-12 w-full items-center justify-center gap-2 text-sm font-bold tracking-wider text-sky-50 transition active:scale-[0.98]"
          >
            {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
            {copied ? "SUCCESS" : "COPY CODE"}
          </button>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onReplay}
              className="reward-btn-secondary inline-flex h-11 items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/70 transition hover:text-white active:scale-[0.98]"
            >
              <RotateCcw size={14} />
              Replay
            </button>
            <a
              href="https://pixverse.ai/ja"
              target="_blank"
              rel="noreferrer"
              className="reward-btn-secondary inline-flex h-11 items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/70 transition hover:text-white active:scale-[0.98]"
            >
              <ExternalLink size={14} />
              Portal
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
