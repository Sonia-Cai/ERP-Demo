# ERP 全局导航壳（App Shell）

## 0 设计来源与适用范围

- **Figma**：文件 `EUNVfCK8meDTEw3LY8Mhmn` 画板「**ERP 导航**」[`node-id=11-20162`](https://www.figma.com/design/EUNVfCK8meDTEw3LY8Mhmn/Untitled?node-id=11-20162)（URL 中写作 `11-20162` 时，解析为节点 `11:20162`）。
- **适用范围**：所有 ERP 桌面端 Demo、静态原型、以及产品内「一级壳层」布局；与 `design-tokens.css`、`components.md` 配合使用。

**可行性说明：** 将壳层样式沉淀在 Skill 中，并在 Demo 中引用同一套 Token + 本文件结构约束，即可保证每次演示视觉一致；实现栈（React / Vue / 纯 HTML）可替换，**尺寸与状态语义**应与本规范一致。

---

## 1 整体信息架构

```
┌─────────────┬──────────────────────────────────────────────────────────┐
│ 一级侧栏     │  主工作区（Main）                                           │
│ (Primary)   │  ┌─────────────────────────────────────────────────────┐ │
│ 固定宽      │  │ 顶栏 Chrome：页签区（左） + 状态/用户区（右） 高 40px   │ │
│             │  └─────────────────────────────────────────────────────┘ │
│             │  ┌─ 可选：二级导航 176px ─┬─ 内容区（列表/表单等）─────────┐ │
│             │  │（展开时）              │                               │ │
└─────────────┴──┴──────────────────────┴───────────────────────────────┘
```

- **一级侧栏**：图标 + 双字/多字中文标签上下排布；浅灰底。
- **主区顶栏（Chrome）**：单行 **40px**（`--layout-chrome-header-height`）；**左侧**为多页签（`--layout-tab-bar-height` 内容区 **36px**）；**右侧**为助手/反馈入口、地区/时区、系统时间、用户头像与姓名菜单。
- **二级导航**（若业务需要）：宽度 **176px**（`--layout-nav-secondary-width`），与 Figma「一、二级导航」示例一致；无二级时主内容贴顶栏下缘铺满。

---

## 2 一级侧栏（Primary Rail）

| 属性 | 值 | Token |
| :--- | :--- | :--- |
| 宽度 | **74px** | `--layout-nav-rail-width` |
| 背景 | 浅灰页面底 | `--color-bg-page` |
| Logo 区高度 | **90px** | `--nav-logo-zone-height` |
| Logo 图形 | **32×32** | 使用品牌图形；圆角与品牌规范一致 |
| 品牌字「万物」等 | 置于 Logo 下，颜色一级标题色 | `--color-text-heading-1` |
| 一级菜单项外间距 | 水平 **6px**、垂直 **4px** | `--nav-rail-item-outer-padding-x` / `-y` |
| 项内可点热区 | 内边距 **6px**、图标与文案间距 **4px** | `--nav-rail-item-inner-padding`、`--nav-rail-icon-label-gap` |
| 项圆角 | **10px** | `--radius-large` |
| 图标尺寸 | **20×20** | `--icon-size-lg` |
| 标签字 | **10px** / 行高 **18px** | `--font-size-nav-rail-label`、`--line-height-nav-rail-label` |

### 2.1 状态

| 状态 | 背景 | 图标与文字 |
| :--- | :--- | :--- |
| 默认 | 透明 | `--color-text-secondary`（与 Figma Gray7 提示/辅助语义一致） |
| 选中 | **纯色**浅蓝底 `--color-primary-bg` | `--color-primary`，字重 **Semibold** |
| 悬停（未选中） | 可用 `--color-gray-2` 或极浅叠加，**不得**使用渐变 | 略提亮即可 |

> **与 NEVER 规则对齐**：Figma 源稿中选中态曾使用**纵向渐变**；在实现与 Demo 中一律改为 **纯色** `--color-primary-bg`（或等价 Token），**禁止**在侧栏使用渐变背景。

### 2.2 交互与无障碍

- 每项为整卡热区（图标 + 文案同一 `button` 或可聚焦容器）。
- `title` 与可见文案一致，避免仅图标无释义。

---

## 3 顶栏 Chrome（40px）与页签

### 3.1 顶栏容器

| 属性 | 值 | Token |
| :--- | :--- | :--- |
| 高度 | **40px** | `--layout-chrome-header-height` |
| 底部分割 | 1px | `--color-border-default` |
| 背景 | 与页签条统一浅灰 | `--color-bg-page`（与侧栏同系，具体以设计稿为准） |
| 内边距 | 左右 **24px**（或与内容区对齐 **16～24px** 取整栅格） | `--spacing-loose` / `--spacing-base-loose` |
| 布局 | 横向 `flex`，**左**页签组 **右**状态区，`align-items: center` | — |

### 3.2 页签（多文档标签）

| 属性 | 值 | Token |
| :--- | :--- | :--- |
| 单行内容高度 | **36px** | `--layout-tab-bar-height` |
| 页签水平间距 | **2px** | `--nav-tab-gap`（与 `--spacing-super-tight` 同为 2px 时二选一即可） |
| 内边距 | **12px** 左右、**8px** 上下 | 与 Figma `px-[12px] py-[8px]` 一致 |
| 上圆角 | **4px** | `--radius-small`（若 3px 与稿差 1px，Demo 可用 4px 与 Figma 对齐） |
| 文案 | **14px Regular**，正文色 | `--font-size-regular`、`--color-text-body` |
| 关闭图标 | **14×14**，与文案间距 **12px** | `--icon-size-md` 附近规格 |

| 状态 | 背景 | 其他 |
| :--- | :--- | :--- |
| 选中 | `--color-bg-container`（白） | 底部轻投影「抬起」：`--shadow-tab-lift` |
| 未选中 | 透明（透出顶栏灰底） | 无描边 |
| 悬停（未选中） | `--color-chrome-tab-hover-bg` | `rgba(19,23,31,0.06)` |

---

## 4 右上状态区（个人信息、时间等）

自左向右推荐顺序：**助手/智能入口（若有）** → **意见反馈** → **地区/时区（可下拉）** → **系统时间** → **用户（头像 + 姓名 + 下拉）**。

| 元素 | 规格 | Token |
| :--- | :--- | :--- |
| 区段内图标按钮 | **18×18** 可点区域 | `--nav-chrome-icon-size` |
| 图标组间距 | **18px** | `--nav-chrome-cluster-gap` |
| 地区、时间、姓名 | **14px**，正文色 | `--font-size-regular`、`--color-text-body` |
| 行高 | **22px**（与 Figma 中文标注一致） | 可用 `line-height: 22px` 或最接近 Token |
| 头像 | **22×22**，圆角 **4px** | `--nav-user-avatar-size`、`--nav-user-avatar-radius` |
| 头像与姓名间距 | **8px**（Figma 约 30-22=8） | `--spacing-tight` |
| 姓名与下拉箭头 | **4px** | `--spacing-super-tight` |
| 时间格式 | `YYYY/MM/DD HH:mm:ss` | 等宽数字可选 `font-variant-numeric: tabular-nums` |

---

## 5 二级导航（可选）

| 属性 | 值 | Token |
| :--- | :--- | :--- |
| 宽度 | **176px** | `--layout-nav-secondary-width` |
| 行高 | **44px** / 行 | 与列表行高区分，专用于导航行 |
| 左内边距文案 | **12px** | `--spacing-base` |
| 选中/展开语义 | 与 `components.md` 菜单项选中态一致 | 使用 `--color-primary-bg` / `--color-primary` |

---

## 6 Demo 与工程落地检查清单

- [ ] 侧栏宽 **74px**，背景 `--color-bg-page`，选中态**无渐变**。
- [ ] 顶栏总高 **40px**，页签内容高 **36px**，选中页签白底 + `--shadow-tab-lift`；页签条需**贴底对齐**（避免 40px 顶栏下出现空白带）。
- [ ] 右上集群图标 **18px**、间距 **18px**；头像 **22px**、姓名 **14px**。
- [ ] 颜色、字号、间距优先引用 **design-tokens.css**，避免魔法数（本文件已列明的除外）。
- [ ] **主栏（`erp-main`）顶栏以下的内容画布**背景为 **`--color-bg-page`（浅灰）**，与 **`page-list.md`** 一级 **`.list-page-card` 白底**区分，否则白卡外边距与画布同色、视觉上像「没有边距」。
- [ ] 与 `page-list.md` 一级白卡外边距、内边距衔接自然，无重复分割线或错位 1px。

---

## 7 附录：与全局 NEVER 的关系

- **禁止侧栏选中态使用 CSS 线性渐变**；用 `--color-primary-bg` 代替 Figma 渐变稿。
- 不在顶栏使用超过 **3 种字号**；本壳层固定 **14px**（页签与状态区）+ **10px**（侧栏标签）两档为主。

## 8 侧栏资源与「与设计稿一致」的落地方式

### 8.1 一级导航项顺序与文案（与 Figma「ERP 导航」一致）

自上而下共 **12** 项（Demo 脚本 `erp-nav-rail-figma.js` 与下表一致；第 10 项为**客服**，非第二处「交付」）：

1. 常用  
2. 订单  
3. 采购（画板默认**选中**态）  
4. 交付  
5. 库存  
6. 产品  
7. 运营  
8. 品质  
9. 供应商协同  
10. 客服  
11. 物流  
12. 财务  

### 8.2 Logo 与图标

- **万物**：设计稿为 **32×32** 图形 + **36×24**「万物」字标两张位图/矢量导出（Figma 节点 `11:20166` 区域）。
- **导航图标**：设计稿中每项为 **20×20** 视口内**多图层叠加**（与组件实例 `导航/常用/未选中` 等一致），Demo 中通过脚本按 Figma 的 `inset` 叠图还原。

### 8.3 本地资源与 Demo 脚本

- **Logo**：`ASSETS/navigation/logo.svg`
- **导航图标**：`ASSETS/navigation/icons/nav-{slug}-{default|hover|active}.svg`  
  - `default` = 设计导出「未选中」，`hover` = 「高亮」，`active` = 「选中」  
  - `slug` 与中文模块对照见 **`ASSETS/navigation/README.md`**
- 侧栏样式表：**`ASSETS/erp-nav-rail.css`**（`.page-shell`、`.erp-sidebar`、`.nav-rail-*`）；须在 **`design-tokens.css` 之后**引入，与脚本注入 DOM 配套。
- 挂载脚本：**`ASSETS/erp-nav-rail-figma.js`**，由 **`demos/channel-transfer.html`** 等页面引用；`DOMContentLoaded` 时执行 `mountErpNavRailFromFigma()` 写入 `#erpNavSidebar`（脚本末尾亦有兜底挂载），并按悬停切换 `default` / `hover` / `active` 图标。HTML 不在 **`demos/`** 时须在引入脚本前设置 **`window.ERP_NAV_ASSET_BASE`**（见脚本文件头与 **`ASSETS/navigation/README.md`**、**`case-studies/good-case.md`** 索引）。
- **工作台**（`nav-workbench-*`）已整理在 `icons/`，主序列暂未使用；**客服**（`nav-customer-service-*`）为侧栏第 **10** 项。
- 勿直接改脚本源码中的默认路径；通过 **`window.ERP_NAV_ASSET_BASE`** 覆盖即可。
- **业务 Demo 与侧栏选中一致**：在页面中于引入 `erp-nav-rail-figma.js` **之前**设置 `window.ERP_NAV_ACTIVE_KEY`（或 `ERP_NAV_ACTIVE_INDEX`）。标准需求话术见 **`META/SKILL.md` →「需求提交模板」**；`slug`/中文别名见 **`ASSETS/navigation/README.md`**。客服模块高亮使用 **`ERP_NAV_ACTIVE_KEY = 'customer-service'`** 或中文 **`客服`**。
