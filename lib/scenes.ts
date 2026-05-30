export type SceneId = "SCENE_1_FOREST" | "SCENE_2_ALTAR" | "SCENE_3_AWAKENING";

export type HotspotAction = {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  actionVideoSrc: string;
  nextSceneId: SceneId;
  requiredItemId?: string;
};

export type SceneConfig = {
  id: SceneId;
  title: string;
  loopVideoSrc: string;
  poster?: string;
  hotspots: HotspotAction[];
};

export const scenes: Record<SceneId, SceneConfig> = {
  SCENE_1_FOREST: {
    id: "SCENE_1_FOREST",
    title: "Whispering Forest",
    loopVideoSrc: "/videos/scene-1-forest-loop.mp4",
    hotspots: [
      {
        id: "collect-grass-1",
        label: "Grass I",
        x: 14,
        y: 62,
        width: 14,
        height: 16,
        actionVideoSrc: "/videos/collect-grass-1.mp4",
        nextSceneId: "SCENE_1_FOREST"
      },
      {
        id: "enter-altar",
        label: "Gate",
        x: 66,
        y: 36,
        width: 18,
        height: 24,
        actionVideoSrc: "/videos/forest-to-altar.mp4",
        nextSceneId: "SCENE_2_ALTAR"
      }
    ]
  },
  SCENE_2_ALTAR: {
    id: "SCENE_2_ALTAR",
    title: "Alchemy Altar",
    loopVideoSrc: "/videos/scene-2-altar-loop.mp4",
    hotspots: [
      {
        id: "insert-dragon-eye",
        label: "Socket",
        x: 43,
        y: 38,
        width: 14,
        height: 18,
        actionVideoSrc: "/videos/insert-dragon-eye.mp4",
        nextSceneId: "SCENE_3_AWAKENING",
        requiredItemId: "dragon_eye"
      }
    ]
  },
  SCENE_3_AWAKENING: {
    id: "SCENE_3_AWAKENING",
    title: "Dragon Awakening",
    loopVideoSrc: "/videos/scene-3-awakening-loop.mp4",
    hotspots: []
  }
};

export const getScene = (sceneId: SceneId) => scenes[sceneId];
