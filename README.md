# Mystic Valley H5

Mystic Valley is a mobile-first interactive video H5 built with Next.js. The experience combines a vertical story video with lightweight game interactions: collecting glowing grass, dragging it into a dragon eye, solving a light sigil puzzle, and receiving a PixVerse Gift Code at the end.

## Features

- Mobile portrait interactive video experience.
- Typewriter intro story before the video starts.
- Timeline-based checkpoints at `00:08`, `00:18`, `00:28`, and `00:39`.
- Click-to-collect glowing grass hotspots.
- Inventory dock with draggable glowing grass.
- Hidden dragon-eye drop zone with soft light feedback.
- Hand-shaped light sigil sequence puzzle.
- Reward card with gift code copy, replay, and PixVerse official site link.

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Zustand
- `@dnd-kit/core`
- `lucide-react`

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Play On A Phone

Make sure your computer and phone are on the same Wi-Fi network.

Start the dev server so it listens on the local network:

```bash
npm run dev -- -H 0.0.0.0
```

Find your computer's local IP address:

```powershell
ipconfig
```

Then open this URL on your phone:

```text
http://YOUR_COMPUTER_IP:3000
```

Example:

```text
http://192.168.1.23:3000
```

If it does not open, allow `node.exe` through Windows Firewall or check that both devices are on the same network.

## Gameplay Flow

1. Intro
   - A Japanese typewriter story introduces Mystic Valley.
   - The player taps `冒険を始める` to begin.

2. `00:08` Glowing Grass
   - The video pauses.
   - The player taps 3 glowing grass items.
   - Collected items appear in the bottom inventory.

3. `00:18` Dragon Eye
   - The video pauses on the dragon-eye scene.
   - The player drags glowing grass from the inventory into the hidden eye area.
   - Each successful drop triggers a soft blue-white light effect.

4. `00:28` Light Sigil
   - The video pauses.
   - A hand-shaped light sigil shows a node sequence.
   - The player repeats the sequence.
   - After 3 mistakes, the correct sequence is shown again.

5. `00:39` Reward
   - The reward card appears.
   - The player can copy the PixVerse Gift Code, replay, or open the PixVerse official site.

## Main Files

```text
app/page.tsx
app/globals.css
components/InteractiveVideoExperience.tsx
lib/interactionFlow.ts
store/gameStore.ts
public/videos/main.mp4
public/ui/glowing-grass.svg
public/ui/dragon-eye.svg
public/ui/reward-crystal.svg
```

## Timeline Configuration

Checkpoints are configured in `lib/interactionFlow.ts`:

```ts
export const CHECKPOINTS = {
  collect: 8,
  alchemy: 18,
  puzzle: 28,
  reward: 39
} as const;
```

Collect and dragon-eye positions are also percentage-based in the same file.

## Useful Commands

Lint:

```bash
npm run lint
```

Type check:

```bash
npx tsc --noEmit
```

Build:

```bash
npm run build
```

Start production server after build:

```bash
npm run start
```

## Documentation

Detailed design and technical documents:

- [Mystic Valley Interactive H5 Technical Document.md](Mystic%20Valley%20Interactive%20H5%20Technical%20Document.md)
- [interactive_video_flow_design_v2_integrated.md](interactive_video_flow_design_v2_integrated.md)

## Notes

- The project is optimized for portrait mobile screens.
- Keep visible in-game text minimal so the video remains immersive.
- `tsconfig.tsbuildinfo` is a temporary type-check file and should not be committed.
- If Next.js dev mode shows a white screen after large file rewrites, restart `npm run dev`.
