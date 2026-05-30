# 《巨龙遗迹：秘境幽谷》(Mystic Valley) 手机 H5 互动视频技术文档

本文档用于指导《巨龙遗迹：秘境幽谷》手机端 H5 互动视频项目的前端实现。当前版本以“一个完整竖屏主视频 + 时间轴互动点”为核心方案，后续只需要提供完整视频和互动点清单，即可在固定时间、固定画面位置叠加点击、道具、拖拽解谜等互动。

## 1. 项目目标

项目形态为手机竖屏 H5，用户打开页面后进入全屏沉浸式视频体验。视频作为主叙事载体持续播放，页面根据视频播放时间显示互动热区，用户点击或完成解谜后推进状态、获得道具、跳转到指定视频时间点，或播放可选反馈片段。

核心目标：

- 手机竖屏优先，桌面端仅作为手机预览容器。
- 支持一个完整主视频，不强制拆分视频。
- 支持按时间段显示互动热区。
- 支持按画面百分比坐标固定点击区域。
- 支持道具背包、场景状态、过渡锁定。
- 支持炼金拖拽解谜，并在成功后生成关键道具。
- 保留双轨视频能力，用于后续需要独立反馈短视频时扩展。

## 2. 技术选型

| 模块 | 技术 | 说明 |
| :-- | :-- | :-- |
| 前端框架 | Next.js App Router | 用于构建 H5 页面、静态资源管理和部署 |
| 开发语言 | TypeScript | 约束互动配置、状态和组件接口 |
| 样式系统 | Tailwind CSS | 快速实现手机端自适应布局 |
| 状态管理 | Zustand | 管理当前进度、背包、视频锁定、关键事件 |
| 拖拽交互 | @dnd-kit/core | 实现手机端拖拽解谜 |
| 图标 | lucide-react | HUD 操作按钮图标 |
| 部署建议 | Vercel 或静态部署平台 | 适合 H5 链接分发和 CDN 加速 |

## 3. 手机 H5 布局规范

当前页面采用移动端优先布局：

- 舞台最大宽度：430px。
- 高度：100dvh。
- 视频层：绝对定位，全屏覆盖，`object-cover`。
- 互动层：覆盖在视频上方，使用百分比坐标定位。
- HUD：顶部安全区内显示项目名、状态、重置按钮。
- 解谜/道具面板：底部抽屉式面板，适配拇指操作。
- 横屏提示：小高度横屏时显示“请竖屏体验”。

当前入口文件：

- `app/page.tsx`
- `app/globals.css`
- `components/DualTrackVideoPlayer.tsx`
- `components/HotspotLayer.tsx`
- `components/AlchemyPuzzle.tsx`
- `components/GameHud.tsx`

## 4. 视频方案

### 4.1 单主视频方案

推荐交付方式为一个完整竖屏主视频，例如：

```text
public/videos/main.mp4
```

前端通过监听主视频的 `currentTime` 来控制互动点出现和消失。互动点被点击后，可以执行以下动作：

- 暂停视频。
- 获得道具。
- 打开道具栏或解谜组件。
- 跳转到视频指定时间点继续播放。
- 标记某个剧情事件完成。
- 播放可选反馈短视频。

### 4.2 可选反馈短视频

如果某个互动点击后需要播放完全独立的动画反馈，可以额外提供短视频，例如：

```text
public/videos/alchemy-success.mp4
public/videos/insert-dragon-eye.mp4
```

当前框架已保留双轨播放器能力：

- 底层视频：主视频或当前循环视频。
- 顶层视频：可选反馈/过场视频。
- 白场遮罩：用于隐藏切换瞬间，减少黑屏感。

如果完整主视频已经包含所有反馈内容，则不需要额外拆分视频，前端直接跳转到对应时间点即可。

## 5. 互动点配置

互动点建议使用统一配置表维护。每个互动点至少包含：

| 字段 | 类型 | 说明 |
| :-- | :-- | :-- |
| id | string | 互动点唯一 ID |
| label | string | 内部标识或无障碍名称 |
| startTime | number | 出现时间，单位秒 |
| endTime | number | 消失时间，单位秒 |
| x | number | 热区左上角 X 百分比 |
| y | number | 热区左上角 Y 百分比 |
| width | number | 热区宽度百分比 |
| height | number | 热区高度百分比 |
| requiredItemId | string? | 需要持有某道具才可点击 |
| action | object | 点击后的行为 |

示例：

```ts
const timelineHotspots = [
  {
    id: "collect-grass-1",
    label: "发光草 1",
    startTime: 8,
    endTime: 14,
    x: 12,
    y: 66,
    width: 20,
    height: 14,
    action: {
      type: "collect-item",
      itemId: "grass_1"
    }
  },
  {
    id: "open-alchemy",
    label: "祭坛",
    startTime: 26,
    endTime: 40,
    x: 34,
    y: 42,
    width: 32,
    height: 20,
    action: {
      type: "open-puzzle",
      puzzleId: "alchemy"
    }
  }
];
```

## 6. 全局状态设计

当前 Zustand 状态模型：

| 状态 | 类型 | 初始值 | 说明 |
| :-- | :-- | :-- | :-- |
| currentScene | string | `SCENE_1_FOREST` | 当前剧情阶段或逻辑场景 |
| inventory | string[] | `[]` | 玩家已获得道具 ID |
| isVideoTransitioning | boolean | `false` | 视频切换或反馈播放锁 |
| dragonEyeInserted | boolean | `false` | 龙眼是否已嵌入 |

主要 actions：

- `addItem(id)`：添加道具。
- `removeItem(id)`：移除道具。
- `changeScene(sceneId)`：切换逻辑场景。
- `setVideoTransitioning(value)`：锁定或解锁交互。
- `insertDragonEye()`：生成并标记龙眼道具。
- `resetGame()`：重置体验。

后续切换为单主视频时间轴模式时，建议新增：

- `mainVideoTime`：当前主视频时间。
- `isPuzzleOpen`：是否打开解谜组件。
- `completedActions`：已完成互动点 ID。
- `seekTo(time)`：跳转到主视频指定时间。

## 7. 炼金拖拽解谜

当前炼金解谜使用 `@dnd-kit/core` 实现，逻辑如下：

1. 背包中存在 `grass_1`、`grass_2`、`grass_3`。
2. 玩家将三件物品拖入炼金阵区域。
3. 三件物品全部进入后触发 `onSynthesisSuccess`。
4. 系统生成 `dragon_eye`。
5. 后续点击龙眼槽位时，如果背包中存在 `dragon_eye`，即可触发最终事件。

当前组件：

```text
components/AlchemyPuzzle.tsx
```

## 8. 素材交付格式

### 8.1 推荐视频规格

- 尺寸：1080 x 1920。
- 比例：9:16。
- 编码：H.264。
- 格式：MP4。
- 音频：AAC。
- 文件名：英文或数字命名，避免空格和特殊符号。

推荐命名：

```text
public/videos/main.mp4
public/videos/alchemy-success.mp4
public/videos/ending.mp4
```

### 8.2 互动点清单格式

提供完整视频后，建议同时提供类似下面的清单：

```text
主视频：main.mp4

00:08-00:14 右下草丛，点击获得 grass_1
00:16-00:22 左侧石碑，点击获得 grass_2
00:24-00:30 中间水边，点击获得 grass_3
00:32-00:45 中央祭坛，点击打开炼金拖拽
炼金成功后获得 dragon_eye，并跳转到 00:58
01:02-01:12 中央龙眼槽，持有 dragon_eye 时可点击，跳转到 01:20
```

如果无法精确给坐标，也可以只描述画面位置，后续由前端根据画面截图调整百分比坐标。

## 9. 当前实现状态

已完成：

- Next.js + TypeScript + Tailwind 项目脚手架。
- 手机竖屏 H5 舞台。
- 双轨视频播放器基础能力。
- Hotspot 百分比坐标点击层。
- Zustand 全局状态。
- 道具背包和炼金拖拽解谜。
- 横屏提示和移动端安全区适配。

待视频提供后完成：

- 将完整主视频接入为 `main.mp4`。
- 根据视频时间轴配置互动点。
- 根据画面位置校准热区坐标。
- 根据实际剧情确认跳转时间点。
- 如有需要，接入反馈短视频。
- 做手机端真机测试，包括 iOS Safari 和微信内置浏览器。

## 10. 本地开发命令

安装依赖：

```bash
npm install
```

启动开发服务：

```bash
npm run dev
```

检查代码：

```bash
npm run lint
```

生产构建：

```bash
npm run build
```

