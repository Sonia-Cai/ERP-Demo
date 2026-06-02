---
name: "ERP UI 令牌与组件规范"
description: "ERP 颜色、字体、间距、圆角及表单/列表等组件规范；基于 design-tokens.css 的 CSS 变量体系。编辑本仓库 frontend、全局样式、运营/ERP 类 B 端页面或与设计令牌对齐的 ant-design-vue 主题时，应优先遵循本 Skill 下的 REFERENCES 与 ASSETS。"
---

# ERP UI Skill（本仓库副本）

## 文件放在哪

| 路径 | 用途 |
|------|------|
| `REFERENCES/components.md` | 颜色/字体/间距与按钮、输入框等组件级规范 |
| `REFERENCES/form-standard.md` 等 | 表单、导航、业务组件等配套说明（与 components 内交叉引用一致） |
| `ASSETS/design-tokens.css` | 设计令牌实际取值；实现层应对应到 CSS 变量或映射到 `ConfigProvider` Token |

以上从 ERP 原技能包同步而来，便于本仓库**离线**与 Agent 引用；若 ERP 源有更新，可重新复制覆盖。

### 与 `frontend/` 运行态同步（ant-design-vue）

- **CSS 变量（单一视觉源）**：`frontend/src/styles/design-tokens.css`（与 `ASSETS/design-tokens.css` 内容一致，改令牌时请两处同步或只改 `.cursor` 后再 `cp` 到 frontend）。
- **Ant Design Vue Theme（实色 seed）**：`frontend/src/theme/erpAntdTheme.ts` 中 `erpColor` / `erpAntdTheme` 与 `components.md` §1.1 语义色一致，供 `ConfigProvider` 使用。
- **入口**：`frontend/src/main.ts` 已 `import '@/styles/design-tokens.css'`；`frontend/src/App.vue` 已使用 `defaultAlgorithm` + `erpAntdTheme`。

## 与现有规范的关系

- **`ui-design-standard`**：偏通用 B 端审美与反模版感。
- **`erp-ui`（本目录）**：偏 **ERP 已定稿的令牌与组件尺寸**（如全局 32px 控件高度等）。

二者冲突时，**以本 Skill（ERP 令牌与 components）为准**，除非产品明确要求采用通用 Skill。

## 前端落地建议

- 将 `ASSETS/design-tokens.css` 引入 `frontend`（例如在 `main.ts` 或全局样式中 import），再通过变量约束自定义样式。
- 使用 **ant-design-vue** 时，用 `ConfigProvider` 的 `theme.token` / `components` 与上述 CSS 变量对齐，避免与 `components.md` 中的高度、圆角规则打架。
