"use client";

import { useEffect, useRef, useState } from "react";
import type { HotspotAction, SceneConfig } from "@/lib/scenes";
import { useGameState } from "@/store/gameStore";

type DualTrackVideoPlayerProps = {
  scene: SceneConfig;
  pendingAction: HotspotAction | null;
  onActionSettled: () => void;
};

export function DualTrackVideoPlayer({
  scene,
  pendingAction,
  onActionSettled
}: DualTrackVideoPlayerProps) {
  const bottomVideoRef = useRef<HTMLVideoElement>(null);
  const topVideoRef = useRef<HTMLVideoElement>(null);
  const [topVisible, setTopVisible] = useState(false);
  const [whiteFlash, setWhiteFlash] = useState(false);
  const [bottomFailed, setBottomFailed] = useState(false);
  const changeScene = useGameState((state) => state.changeScene);
  const setVideoTransitioning = useGameState((state) => state.setVideoTransitioning);

  useEffect(() => {
    setBottomFailed(false);
    bottomVideoRef.current?.load();
  }, [scene.loopVideoSrc]);

  useEffect(() => {
    if (!pendingAction || !topVideoRef.current) {
      return;
    }

    const topVideo = topVideoRef.current;
    let flashTimer: ReturnType<typeof setTimeout>;

    setVideoTransitioning(true);
    setWhiteFlash(true);
    setTopVisible(false);

    topVideo.src = pendingAction.actionVideoSrc;
    topVideo.load();
    void topVideo.play().catch(() => {
      changeScene(pendingAction.nextSceneId);
      setWhiteFlash(false);
      setVideoTransitioning(false);
      onActionSettled();
    });

    flashTimer = setTimeout(() => {
      setTopVisible(true);
      setWhiteFlash(false);
    }, 300);

    topVideo.onended = () => {
      changeScene(pendingAction.nextSceneId);
      setTopVisible(false);
      setVideoTransitioning(false);
      onActionSettled();
    };

    topVideo.onerror = () => {
      changeScene(pendingAction.nextSceneId);
      setTopVisible(false);
      setWhiteFlash(false);
      setVideoTransitioning(false);
      onActionSettled();
    };

    return () => {
      clearTimeout(flashTimer);
      topVideo.onended = null;
      topVideo.onerror = null;
    };
  }, [changeScene, onActionSettled, pendingAction, setVideoTransitioning]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-obsidian">
      <video
        key={scene.loopVideoSrc}
        ref={bottomVideoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src={scene.loopVideoSrc}
        poster={scene.poster}
        autoPlay
        muted
        loop
        playsInline
        webkit-playsinline="true"
        preload="auto"
        onError={() => setBottomFailed(true)}
      />
      {bottomFailed ? <VideoFallback title={scene.title} /> : null}
      <video
        ref={topVideoRef}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${
          topVisible ? "opacity-100" : "opacity-0"
        }`}
        muted
        playsInline
        webkit-playsinline="true"
        preload="auto"
      />
      <div
        className={`pointer-events-none absolute inset-0 bg-white transition-opacity duration-150 ${
          whiteFlash ? "opacity-95" : "opacity-0"
        }`}
      />
    </div>
  );
}

function VideoFallback({ title }: { title: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_45%_40%,rgba(249,115,22,0.24),transparent_32%),linear-gradient(135deg,#080b0f,#17231b_48%,#101827)] px-5">
      <div className="w-full max-w-[280px] border border-amber-300/35 bg-black/25 px-5 py-4 text-center text-amber-100 shadow-rune backdrop-blur-sm">
        <p className="text-xs uppercase tracking-[0.22em] text-amber-200/70">Video placeholder</p>
        <h1 className="mt-2 text-xl font-semibold">{title}</h1>
      </div>
    </div>
  );
}
