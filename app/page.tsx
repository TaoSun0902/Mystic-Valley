import { InteractiveVideoExperience } from "@/components/InteractiveVideoExperience";

export default function Home() {
  return (
    <main className="grid min-h-dvh place-items-center overflow-hidden bg-black">
      <section className="mobile-stage relative h-dvh w-full overflow-hidden bg-obsidian text-amber-50">
        <InteractiveVideoExperience />
        <div className="landscape-hint pointer-events-none fixed inset-0 z-50 hidden place-items-center bg-black/90 px-8 text-center text-sm font-medium text-amber-50">
          请竖屏体验
        </div>
      </section>
    </main>
  );
}
