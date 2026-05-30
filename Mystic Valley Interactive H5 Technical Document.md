# Mystic Valley Interactive H5 技术文档

本文档描述《Mystic Valley》移动端 H5 互动视频项目的当前实现方案。项目以一段竖屏主视频为叙事载体，在指定时间点暂停并叠加轻量互动 UI，完成收集、拖拽、光阵解谜和最终奖励转化。

## 1. 项目目标

《Mystic Valley》是一个手机竖屏优先的互动视频 H5。用户进入页面后，先通过打字机效果阅读简短世界观，再点击开始游戏。视频播放过程中，页面根据主视频时间轴触发互动点；用户完成互动后，视频继续播放。最终展示 PixVerse Gift Code，并提供复制、再玩一次和跳转 PixVerse 官网的操作。

核心目标：

- 适配移动端竖屏体验，桌面端作为手机预览容器。
- 使用单个主视频 `public/videos/main.mp4` 承载完整剧情。
- 基于视频 `currentTime` 触发互动暂停点。
- 使用百分比坐标将互动热区绑定到画面位置。
- 通过 Zustand 管理阶段、背包、关键事件和奖励状态。
- 通过 `@dnd-kit/core` 实现移动端拖拽解谜。
- UI 尽量融入视频画面，只在必要节点给少量日语提示。

## 2. 技术选型

| 模块 | 技术 | 说明 |
| :-- | :-- | :-- |
| 前端框架 | Next.js App Router | 构建 H5 页面、静态资源管理和本地开发 |
| 开发语言 | TypeScript | 约束状态、配置和组件接口 |
| 样式系统 | Tailwind CSS + 全局 CSS | 处理布局、移动端舞台和互动视觉 |
| 状态管理 | Zustand | 管理阶段、背包、完成事件和重置 |
| 拖拽交互 | @dnd-kit/core | 实现背包草拖到龙眼区域 |
| 图标 | lucide-react | 播放、复制、重玩、外链等按钮图标 |

## 3. 当前体验流程

1. 开场背景介绍
   - 视频停在第一帧。
   - `IntroOverlay` 使用打字机效果显示简化日语世界观。
   - 文案打完后显示 `冒険を始める`，点击后开始播放视频。

2. 互动点 1：收集荧光草，`00:08`
   - 视频暂停。
   - 画面中显示 3 株可点击荧光草图标。
   - 用户点击后草进入底部背包。
   - 收集满 3 株后继续播放。
   - 短提示：`光る草を集める`。

3. 互动点 2：草拖入龙眼，`00:18`
   - 视频暂停在龙眼画面。
   - 底部背包中的荧光草变为可拖拽物。
   - 龙眼位置存在不可见投放区，避免明显 UI 暴露答案。
   - 用户将 3 株草拖到龙眼区域后继续播放。
   - 短提示：`草を瞳へ`。

4. 互动点 3：手光阵解谜，`00:28`
   - 视频暂停。
   - 显示手形光阵，不再使用龙语密码输入框。
   - 光阵先闪烁正确顺序，用户按同样顺序点击节点。
   - 点错会重置当前进度；全部点对后继续播放。
   - 短提示：`光の順をなぞる`。

5. 互动点 4：奖励卡，`00:39` 或视频结束
   - 视频暂停或结束。
   - 显示 PixVerse Gift Code 奖励卡。
   - 支持复制兑换码、再玩一次、跳转 PixVerse 官网。
   - 官网链接：`https://pixverse.ai/ja`

## 4. 时间轴配置

当前时间点集中在 [lib/interactionFlow.ts](lib/interactionFlow.ts)：

```ts
export const CHECKPOINTS = {
  collect: 8,
  alchemy: 18,
  puzzle: 28,
  reward: 39
} as const;
```

触发原则：

- 使用 `video.currentTime >= checkpoint`，不要使用严格等于。
- 每个 checkpoint 完成后写入 `completedCheckpoints`，避免重复触发。
- `ended` 事件也会进入 `REWARD_SHOWN`，保证视频自然结束时仍显示奖励。

## 5. 全局状态

当前状态定义在 [store/gameStore.ts](store/gameStore.ts)：

```ts
export type InteractionPhase =
  | "INTRO_PLAYING"
  | "COLLECT_PAUSED"
  | "DRAGON_REVEAL_PLAYING"
  | "ALCHEMY_PAUSED"
  | "MECHANISM_PLAYING"
  | "PUZZLE_PAUSED"
  | "CLIMAX_PLAYING"
  | "REWARD_SHOWN";
```

主要字段：

| 字段 | 类型 | 说明 |
| :-- | :-- | :-- |
| `phase` | `InteractionPhase` | 当前互动阶段 |
| `inventory` | `string[]` | 当前背包道具 ID |
| `completedCheckpoints` | `string[]` | 已完成时间点 |
| `dragonEyeInserted` | `boolean` | 是否已完成龙眼互动 |

主要 actions：

- `addItem(id)`：加入背包。
- `removeItem(id)`：移除背包道具。
- `setPhase(phase)`：切换互动阶段。
- `completeCheckpoint(id)`：标记某时间点完成。
- `insertDragonEye()`：标记龙眼互动完成。
- `resetGame()`：回到初始状态。

## 6. 核心组件

当前主实现集中在 [components/InteractiveVideoExperience.tsx](components/InteractiveVideoExperience.tsx)。

| 组件 | 用途 |
| :-- | :-- |
| `InteractiveVideoExperience` | 主视频、时间轴监听、阶段切换 |
| `IntroOverlay` | 开场打字机背景介绍 |
| `CollectLayer` | 3 株荧光草点击收集 |
| `AlchemyLayer` | 背包草拖入龙眼区域 |
| `HiddenDragonEyeDropZone` | 不可见龙眼投放区 |
| `LightSigilPuzzle` | 手形光阵顺序点击解谜 |
| `InventoryDock` | 底部背包槽位 |
| `DraggableGrass` | 可拖拽荧光草 |
| `HintPill` | 轻量日语提示 |
| `RewardCard` | Gift Code 奖励卡和转化按钮 |

## 7. UI 与文案

开场打字机建议文案：

```text
世界の果て、青き霧の谷。
失われたルーンを解き、
眠れる巨竜を呼び覚ませ。
旅は、ここから始まる。
```

交互提示：

| 场景 | 文案 |
| :-- | :-- |
| 开场按钮 | `冒険を始める` |
| 收集草 | `光る草を集める` |
| 龙眼拖拽 | `草を瞳へ` |
| 光阵解谜 | `光の順をなぞる` |
| 奖励标题 | `眠れる守護者が目覚めた` |
| 奖励说明 | `ルーンの謎を解き明かした探求者へ、谷からの贈り物です。` |
| 复制按钮 | `コードをコピー` / `コピーしました` |
| 重玩按钮 | `もう一度遊ぶ` |
| 官网按钮 | `公式サイトへ` |

## 8. 素材与路径

当前资源：

```text
public/videos/main.mp4
public/ui/glowing-grass.svg
public/ui/dragon-eye.svg
public/ui/reward-crystal.svg
public/ui/alchemy-sigil.svg
public/ui/rune-console.svg
```

推荐视频规格：

- 竖屏比例：`9:16`
- 推荐尺寸：`1080 x 1920`
- 编码：H.264
- 格式：MP4
- 音频：AAC
- 文件命名：英文或数字，避免空格和特殊符号。

## 9. 本地开发

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
npx tsc --noEmit
```

生产构建：

```bash
npm run build
```

## 10. 交互反馈 (Haptic Feedback)

为了增强移动端沉浸感，项目集成了浏览器 **Vibration API**。

| 交互动作 | 震动模式 | 说明 |
| :-- | :-- | :-- |
| 点击收集道具 | `15ms` | 轻微触感反馈 |
| 收集满 3 株草 | `[30, 50, 30]` | 阶段完成反馈 |
| 成功投放道具 | `20ms` | 投放成功反馈 |
| 龙眼机关激活 | `60ms` | 较强机械感震动 |
| 光阵点击正确 | `10ms` | 极短点击感 |
| 光阵点击错误 | `100ms` | 错误警告长震动 |
| 最终解谜成功 | `[40, 100, 40]` | 胜利节奏震动 |

*注：震动功能要求环境为 HTTPS，且需在用户产生至少一次交互（如点击开始按钮）后生效。*

## 11. 部署与发布

项目针对 **Vercel** 进行了深度优化。

### 生产发布流程

1. **执行部署**：
   ```bash
   vercel --prod
   ```
2. **访问控制**：
   在 Vercel 项目设置中关闭 **Deployment Protection -> Vercel Authentication**，以允许他人直接通过链接访问，无需登录 Vercel 账号。

### 静态导出 (Static Export)

项目已配置 `output: 'export'`，运行 `npm run build` 后会在 `out/` 目录生成完整的静态文件，可部署至任何静态托管平台（如 CDN、GitHub Pages 等）。

## 12. 维护备注

- **音频策略**：项目目前完全使用视频原声音效，已移除所有生成式 BGM 逻辑，以保证音质纯净。
- **自动播放**：受限于浏览器策略，视频在静音状态下可自动播放。本项目通过 `IntroOverlay` 的用户点击行为获取播放权限，从而实现带声音的自动播放。
- **布局适配**：使用 Tailwind 的 `h-dvh` 处理移动端工具栏高度问题，并利用 `env(safe-area-inset-bottom)` 避开手机底部操作条。
- 修改互动时间点时优先改 `lib/interactionFlow.ts`。
- 修改视频坐标时调整 `collectHotspots` 和 `dragonEyeSocket` 的百分比坐标。
- 如果开发服务在文件重写后白屏，先重启 `npm run dev`，必要时清理 `.next`。
- 游戏过程中的右上角重置按钮已移除，重玩入口放在最终奖励卡中。
