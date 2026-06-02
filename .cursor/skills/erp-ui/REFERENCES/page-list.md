# ERP 典型页面布局规范

窗口级壳层（一级侧栏、顶栏多页签、右上状态与个人信息）见 **navigation-shell.md**；本文件描述壳层**之内**的内容区版式。

## 1. 列表页（订单/库存/验货列表）
1. 顶部：页签（Chrome）下直接进入主内容白卡（默认**无面包屑**）
2. 中部：筛选/工具栏 + 数据表格（或看板内容）
3. 底部：分页控件居右（若有）
4. **一级页白底主卡片**（表格页/看板页底层）：用 **`.list-page-card`** 作为底层白卡。白卡圆角 **`--radius-card`（10px）**、**无投影**；白卡固定外边距：**左 0、右 16px、下 16px**（写死，不随内容长短变化）；白卡必须**占满主栏剩余高度**，页面滚动改为**白卡内部滚动**。白卡内容区内边距固定 **16px**（Token：`--card-page-padding`）。表格外壳仍用 **`.list-bg`** / **`.tbl-wrap`**，仅描边与裁剪，不承担整卡圆角。**重要**：主栏内容画布（`erp-main` 顶栏以下）背景须为 **`--color-bg-page`**（浅灰），否则白卡边距在视觉上消失（见 **navigation-shell.md §6**）。
5. **可选面包屑**：如页面确需面包屑，则将其放在白卡外、紧贴白卡上沿，并给主栏容器加 **`.list-content.has-breadcrumb`** 以获得顶部 **4px** 间距（Token：`--layout-primary-breadcrumb-top`）。

## 2. 表单页（新增/编辑/验货单）
1. 采用24栅格，优先双列布局
2. 标签统一对齐，必填标*
3. 底部固定按钮操作区
4. **页面式表单**（**`form-standard.md` §4.0** 顶表头 + 可滚动主表单 + 底栏操作按钮）：须由**同一张**一级白底主卡片 **`.list-page-card.pf-page-card`** 包住上述三块；白卡相对主栏外边距见 **§1 第 4 条**。白卡内版式以 **`form-standard.md` §4.2「白卡内版式」** 为准；**内滚动、下拉浮层、栅格 `overflow`、与底栏叠放** 等集成约束见 **`form-standard.md` §4.2.1**。Demo 见 **`rma-add-page.html`**。

## 3. 看板
1. 信息卡片分组展示
2. 基础信息、业务信息、流程记录分区
3. 排版间距全部沿用Token

## 4. 数据看板
1. 卡片式布局、网格均分
2. 字体层级不混乱，配色克制不花哨

## 5. 参考实现（静态 HTML Demo）

与本规范及 **navigation-shell.md**、**form-standard.md**、**view-form-standard.md**、**business-components.md** 对齐的壳层 + 列表 + 抽屉示例，**索引与说明**见 **`case-studies/good-case.md`**（含预览链接与「AI 可识别」结构描述）。

- 渠道调拨（列表 + **新增**编辑抽屉 + **查看**只读抽屉）Demo：**[channel-transfer.html](../demos/channel-transfer.html)**。  
- SKU 包装尺寸（**查看** + 二级卡片抽屉）Demo：**[sku-packaging-dimensions-detail-view.html](../demos/sku-packaging-dimensions-detail-view.html)**。  
- RMA 新增（**页面式编辑表单** + 「**关联订单**」右侧抽屉）Demo：**[rma-add-page.html](../demos/rma-add-page.html)**（对齐 Figma「RMA新增-页面表单 / RMA新增-抽屉表单」）。  