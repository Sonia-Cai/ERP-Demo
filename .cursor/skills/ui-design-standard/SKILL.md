---
name: "Universal SaaS UI Design & Component Standard (Stitch Optimized) V6.1"
description: "深度融合 Material Design 3、B 端 SaaS（紫菜云风格）与 Google Stitch 语义化引擎。强制执行『工业美学回归』策略，旨在消除 AI 塑料感，实现高密度、高性能 B 端 UI 的自动化构建。是所有 Agent 在设计、出图及代码生成时的最高指令集。"
---

# 🎨 UI Design & Develop Standard Skill V6.1 (Industrial Refinement)

本规范作为 **Stitch 优化版** 核心能力外挂。在执行如 `generate_screen_from_text` 或 `batch_design` 时，必须作为底层"基因组"注入。

---

## 🛡️ 1. 审美防御与反平庸协议 (Aesthetic Shielding & Anti-Patterns)
> **强制执行：** 任何生成物必须通过下列指标，消除"AI 模版感"。

*   **字阶策略 (Typography Strategy)**：
    *   **禁选**：`Inter` (仅限高端/独特场景)。
    *   **强制组合**：标题 `Outfit` (或同级字重字体) + 正文 `Geist/Inter`。
    *   **样式**：标题必须缩紧字距 (**Track-tight**: -0.04em)。
*   **圆角克制 (Geometric Rigidity)**：
    *   **禁选**：在 SaaS 核心场景（如仪表盘、数据表格）严禁使用 >12px 的"软"圆角。
    *   **强制规定**：核心组件圆角设定为 **8px (radius-sm)**，强化工具感与专业度。
*   **布局效率 (Layout Efficiency)**：
    *   **禁选**：无意义的非对称性（仅为设计而设计）。
    *   **强制要求**：数据密集型场景必须使用 **对称为主、效率优先** 的 `symmetric-grid` (4列或3列布局)。
*   **语言策略 (Language Policy)**：
    *   **强制规定**：前端页面所显示的**所有文字内容（标题、按钮、模拟数据）必须全部使用中文**。杜绝任何英文占位符。
*   **色彩与对比 (Contrast)**：
    *   **禁选**：纯黑 (#000000)、典型 AI 霓虹发光。
    *   **强制规定**：使用 **Off-Black (#18181B)**，并通过 **Tonal Focus** (如紫色背景卡片) 建立核心视觉锚点。

---

## 🏗️ 2. 架构与语义化 Token 系统 (Architecture & Semantic Tokens)

### 2.1 结构原则 (Naming & Decoupling)
*   **完全解耦 (Decoupling)**: 除非动态生成，禁止使用 `style="..."`。统一使用 `class` 命名空间。
*   **BEM 命名**: `Block` (.zc-table) -> `Element` (.zc-table__row) -> `Modifier` (.zc-table--compact)。

### 2.2 Stitch 语义映射 (Stitch Translation)
| 技术 Token | Stitch 语义描述 (Prompt 注入) |
| :--- | :--- |
| `radius-sm` | "Sharp professional corners (8px), reinforcing a tool-like industrial precision." |
| `radius-lg` | "Slightly rounded (12px) for general cards; reserve 24px only for decorative visuals." |
| `surface-default` | "Zinc-50 precision gray, avoiding muddy tones while maintaining clinical clarity." |
| `symmetric-grid` | "Balanced 4-column data grid for cognitive efficiency in professional dashboards." |
| `tonal-focus` | "High-contrast fill (Primary Color) for hero metrics to establish absolute visual hierarchy." |
| `compact-mode` | "High-density cockpit layout with tight rhythmic spacing (8px/12px grid)." |

---

## 🎨 3. 交互系统与 M3 状态 (Interaction & State Layers)

### 3.1 状态响应层 (M3 5-States)
所有交互组件必须具备以下 5 种状态反馈：
1.  **Enabled**: 初始。
2.  **Hovered**: 叠加一层 `8%` 不透明度的内容色。
3.  **Focused**: **必须有 2px 外部轮廓环 (Focus Ring)**。
4.  **Pressed**: 叠加一层 `12%` 不透明度的内容色。
5.  **Disabled**: 彩度 0，不透明度 `38%`。

---

## 🏢 4. B 端 SaaS 业务实战规范 (SaaS Patterns - Zi Cai Cloud)

### 4.1 侧边控制台 (Sidebar Console)
*   **三段式结构**: Logo+切换器(Top) -> 导航树(Middle) -> 用户/设置(Bottom)。
*   **视觉规范**: 纯白底色，Active 项必须有 `4px` 宽的左侧 Emphasis Bar。

### 4.2 高密度数据表格 (Zi Cai Table)
*   **行结构**: `Leading`(Icon 12px) -> `Content`(Title 14px + Subtitle 12px) -> `Trailing`(Actions < 3)。

---

## 🚀 5. Stitch 自动化执行协议 (Execution Protocol)

### 5.1 Stitch 高保真 Prompt 架构
```markdown
**VIBE & ATMOSPHERE:** [描述情绪密度，如：Industrial Refinement / Clinical Curator.]
**STITCH DESIGN SYSTEM:**
- Platform: [Web/Mobile], [Desktop]-first
- Palette: [Primary Name] (#hex for role), [Canvas Color] (#hex)
- Geometry: [MANDATORY 8px corners paired with radius-sm]
**MODULAR PAGE STRUCTURE:** [Section-by-section breakdown with BEM logic]
```

---

## 🧪 6. 验证清单 (Checklist)
*   [ ] 是否强制使用了全中文显示？
*   [ ] 圆角是否控制在 8px-12px 以内（严禁 24px 软圆角）？
*   [ ] 仪表盘数据指标是否采用了对称等分布局？
*   [ ] 核心指标卡是否使用了 Tonal Focus（高对比填充色）？
*   [ ] 标题是否使用了 Outfit 配合 Track-tight 紧凑排版？

---
**演进记录**: V5.0 (SaaS 基因) -> V6.0 (Stitch 完全对齐) -> **V6.1 (工业美学回归 & 汉化规范)**
