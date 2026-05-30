"use client";

import { DndContext, DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { CSSProperties, useMemo, useState } from "react";
import { useGameState } from "@/store/gameStore";

const requiredGrass = ["grass_1", "grass_2", "grass_3"];

type AlchemyPuzzleProps = {
  onSynthesisSuccess: () => void;
};

export function AlchemyPuzzle({ onSynthesisSuccess }: AlchemyPuzzleProps) {
  const inventory = useGameState((state) => state.inventory);
  const removeItem = useGameState((state) => state.removeItem);
  const insertDragonEye = useGameState((state) => state.insertDragonEye);
  const [circleItems, setCircleItems] = useState<string[]>([]);

  const inventoryItems = useMemo(
    () => inventory.filter((itemId) => itemId.startsWith("grass_")),
    [inventory]
  );

  function handleDragEnd(event: DragEndEvent) {
    const itemId = String(event.active.id);

    if (event.over?.id !== "alchemy-circle" || circleItems.includes(itemId)) {
      return;
    }

    const nextCircleItems = [...circleItems, itemId];
    setCircleItems(nextCircleItems);
    removeItem(itemId);

    const isComplete = requiredGrass.every((requiredId) =>
      nextCircleItems.includes(requiredId)
    );

    if (isComplete) {
      insertDragonEye();
      onSynthesisSuccess();
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="pointer-events-auto fixed inset-x-0 bottom-0 z-20 grid max-h-[46dvh] gap-3 overflow-y-auto rounded-t-[8px] border-t border-white/15 bg-black/58 p-3 pb-[calc(env(safe-area-inset-bottom)+12px)] text-amber-50 backdrop-blur-md sm:left-1/2 sm:max-w-[430px] sm:-translate-x-1/2">
        <Inventory items={inventoryItems} />
        <AlchemyCircle items={circleItems} />
      </div>
    </DndContext>
  );
}

function Inventory({ items }: { items: string[] }) {
  return (
    <section className="border border-white/15 bg-black/20 p-3">
      <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-100/70">
        Inventory
      </h2>
      <div className="mt-3 flex min-h-14 flex-wrap gap-3">
        {items.length ? (
          items.map((itemId) => <InventoryItem key={itemId} id={itemId} />)
        ) : (
          <div className="grid h-14 place-items-center text-sm text-amber-50/55">
            Empty
          </div>
        )}
      </div>
    </section>
  );
}

function InventoryItem({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id
  });

  const style: CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      type="button"
      className={`h-12 min-w-20 touch-none border border-lime-200/40 bg-lime-300/15 px-3 text-sm font-medium text-lime-50 shadow-rune transition ${
        isDragging ? "scale-105 opacity-80" : "hover:bg-lime-300/25"
      }`}
      {...listeners}
      {...attributes}
    >
      {formatItemName(id)}
    </button>
  );
}

function AlchemyCircle({ items }: { items: string[] }) {
  const { isOver, setNodeRef } = useDroppable({
    id: "alchemy-circle"
  });

  return (
    <section className="border border-amber-200/30 bg-amber-300/10 p-3">
      <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-100/70">
        Alchemy
      </h2>
      <div
        ref={setNodeRef}
        className={`mt-3 grid min-h-20 place-items-center border border-dashed p-3 transition ${
          isOver
            ? "border-amber-100 bg-amber-200/20"
            : "border-amber-100/35 bg-black/20"
        }`}
      >
        <div className="flex flex-wrap justify-center gap-2 text-sm text-amber-50">
          {items.length ? items.map(formatItemName).join(" + ") : "Drop grasses here"}
        </div>
      </div>
    </section>
  );
}

function formatItemName(itemId: string) {
  return itemId.replace("_", " ");
}
