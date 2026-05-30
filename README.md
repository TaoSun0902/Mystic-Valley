# Mystic Valley H5

[English](#english) | [中文](#中文)

---

## English

Mystic Valley is a mobile-first interactive video H5 built with **Next.js 14**. The experience seamlessly blends a vertical narrative video with immersive game mechanics: collecting mystical items, environmental interactions, and ancient sigil puzzles.

**🔗 [Live Demo / 演示地址](https://mystic-valley-mocha.vercel.app/)**

### 🌟 Features

- **Immersive Narrative**: Vertical portrait video experience optimized for mobile devices.
- **Interactive Checkpoints**: Dynamic pauses at key story moments (`00:08`, `00:18`, `00:28`) for player interaction.
- **Haptic Feedback**: Integrated **Vibration API** for tactile responses during collection, errors, and success (requires HTTPS).
- **Advanced UI**: A mystic yet tech-savvy interface with scanlines, glitch effects, and floating crystal animations.
- **Puzzle Mechanics**:
  - **Discovery**: Click-to-collect glowing grass hotspots.
  - **Interaction**: Drag-and-drop inventory items into the environment (Dragon Eye).
  - **Logic**: Sequence-based light sigil puzzle on a hand-shaped matrix.
- **Reward System**: Automated gift code generation with one-click copy and redirection to PixVerse.

### 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **State Management**: Zustand
- **Drag & Drop**: `@dnd-kit/core`
- **Styling**: Tailwind CSS & Global CSS Animations
- **Icons**: Lucide React

---

## 中文

Mystic Valley 是一款基于 **Next.js 14** 开发的移动端优先互动视频 H5。该项目将竖屏叙事视频与沉浸式游戏机制完美融合：包括收集神秘道具、环境交互以及古老光阵解谜。

**🔗 [Live Demo / 演示地址](https://mystic-valley-mocha.vercel.app/)**

### 🌟 核心特性

- **沉浸式叙事**：针对移动端优化的 9:16 竖屏视频体验。
- **动态交互点**：在剧情关键时刻（`00:08`, `00:18`, `00:28`）自动暂停并触发互动。
- **触感反馈**：集成 **Vibration API**，在收集道具、操作错误或成功时提供不同节奏的手机震动（需 HTTPS 环境）。
- **高质感 UI**：融合神秘感与科技感的界面，包含扫描线、故障艺术（Glitch）以及悬浮晶体动画。
- **解谜机制**：
  - **探索**：点击收集画面中的荧光草热区。
  - **交互**：将背包道具拖拽至特定环境区域（龙眼）激活机关。
  - **逻辑**：在手形矩阵上完成特定顺序的光阵点亮解谜。
- **奖励系统**：完成体验后自动发放礼包码，支持一键复制及官网跳转。

### 🛠 技术栈

- **框架**：Next.js 14 (App Router)
- **状态管理**：Zustand
- **拖拽库**：`@dnd-kit/core`
- **样式系统**：Tailwind CSS & 全局 CSS 动画
- **图标**：Lucide React
