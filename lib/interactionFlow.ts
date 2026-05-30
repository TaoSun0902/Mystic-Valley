export const CHECKPOINTS = {
  collect: 8,
  alchemy: 18,
  puzzle: 28,
  reward: 39
} as const;

export const GIFT_CODE = "PIXVERSE-DRAGON-2026";

export const collectHotspots = [
  {
    id: "grass_1",
    label: "荧光草一",
    x: 10,
    y: 62,
    width: 22,
    height: 15
  },
  {
    id: "grass_2",
    label: "荧光草二",
    x: 39,
    y: 67,
    width: 21,
    height: 14
  },
  {
    id: "grass_3",
    label: "荧光草三",
    x: 68,
    y: 60,
    width: 22,
    height: 16
  }
] as const;

export const dragonEyeSocket = {
  id: "dragon-eye-socket",
  label: "龙眼槽位",
  x: 39,
  y: 31,
  width: 22,
  height: 18
} as const;
