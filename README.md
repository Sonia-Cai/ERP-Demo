# ERP demo

本仓库是 **ERP 相关交互与视觉的演示 / 设计落地仓**：在统一技术栈与设计令牌下，沉淀壳层、导航、列表、看板、表单等 Demo，便于评审与复用到正式项目。

当前内置示例：**运营绩效分析看板**（`frontend/src/pages/OperationsDashboardPage.vue`），以及 `.cursor` 规则与技能（含 `erp-ui` 等）。

## 仓库定位

| 用途 | 说明 |
|------|------|
| **设计验证** | 新壳层、主内容区规范、组件组合先在本文档与页面里试跑 |
| **Demo 聚合** | 与 ERP 有关的 demo 优先在本仓库扩展（新路由、新页面、新 `components/`） |
| **模板能力** | Vue 3 + TypeScript + ant-design-vue + ERP 设计令牌；主题见 `src/theme/erpAntdTheme.ts`，令牌见 `src/styles/design-tokens.css` |

本地文件夹名可与 GitHub/GitLab 仓库名自行对齐为「ERP demo」；**远程仓库改名**在托管平台设置即可，本仓库内以 README 与 `package.json` 的 `name` 为准。

## 快速开始（前端）

```bash
cd frontend
npm install
npm run dev
```

浏览器访问终端提示的本地地址（默认 `http://localhost:5173/`）。生产构建：`npm run build`。

环境变量见 `frontend/.env`（如 `VITE_API_BASE_URL`）。

## 仓库结构（摘要）

| 路径 | 说明 |
|------|------|
| `frontend/` | Vite + Vue 3 + Pinia + Router + ant-design-vue；壳层见 `src/components/ErpAppShell.vue` |
| `.cursor/` | Cursor 规则、Skills、MCP、Commands |
| `pycore/` | Python 侧 PyCore 骨架（按需使用） |
| `.output/` | 产品设计产出目录（按项目流程维护） |

## ERP 主题与设计令牌（与 ant-design-vue）

把 **ERP 颜色 / 字体 / 间距**（见 `.cursor/skills/erp-ui/REFERENCES/components.md` 与同源 `design-tokens.css`）接到 **ant-design-vue** 上；做本仓库内的新 Demo 时优先用这套，而不是默认 Ant 蓝。

### 给 Agent / 人看的规范（离线副本）

| 路径 | 说明 |
|------|------|
| `.cursor/skills/erp-ui/SKILL.md` | 何时用 ERP 规范、与 `ui-design-standard` 的优先级 |
| `.cursor/skills/erp-ui/REFERENCES/components.md` | 语义色、排版、表单与控件尺寸等 |
| `.cursor/skills/erp-ui/ASSETS/design-tokens.css` | 令牌源文件（与下栏「前端运行态」应保持语义一致） |

### 前端运行态（真正进打包的）

| 路径 | 说明 |
|------|------|
| `frontend/src/styles/design-tokens.css` | 全局 CSS 变量，在 `main.ts` 已 `import` |
| `frontend/src/theme/erpAntdTheme.ts` | `erpColor` + `erpAntdTheme`（`ConfigProvider` 的 `theme`） |
| `frontend/src/App.vue` | `a-config-provider` 使用 `zhCN` + `erpAntdTheme` |

**写页面时的习惯**：Ant Design 组件用 `type="primary"` / `success` 等即可；**自定义区域或图表**优先用 **`var(--color-*)`**，或 `import { erpColor } from '@/theme/erpAntdTheme'`。

**改主题时**：`design-tokens.css` 与 `erpAntdTheme.ts` 里的 **`erpColor` / `token` 要一起改**。更新 ERP 源规范后，可复制 `.cursor/skills/erp-ui/ASSETS/design-tokens.css` 覆盖 `frontend/src/styles/design-tokens.css`，再同步修改 `erpAntdTheme.ts`。

---

## 若将本仓库复制到新目录 / 新 Git 仓库

### 1. 不要带过去的文件

- [ ] **未复制** `frontend/node_modules/`（或复制后删除，在新目录执行安装）
- [ ] **未复制** `frontend/dist/`
- [ ] **未复制** `.env.local` / `frontend/.env.local`
- [ ] 按需修改 **`frontend/.env`** 中的接口地址

### 2. 命名与身份

- [ ] 修改 **`frontend/package.json`** 的 `name`（及可选 `description`）
- [ ] 修改 **`frontend/index.html`** 的 `<title>`
- [ ] 路由、页面文案是否与「ERP demo」定位一致

### 3. Git

- [ ] 新项目 **重新 `git init`** 或修改 `remote`，避免误推
- [ ] 确认 **`.gitignore`** 已忽略 `node_modules`、`dist`、`.env.local` 等

### 4. 依赖与构建

- [ ] 在 **`frontend/`** 执行：`npm install`
- [ ] `npm run dev` 与 `npm run build` 通过

### 5. Cursor 资产

- [ ] **`.cursor/`** 是否随仓库保留
- [ ] 按需编辑 **`.cursor/mcp.json`**

### 6. 业务与演示

- [ ] **`frontend/src/pages/`**、**`frontend/src/router/index.ts`** 是否仍符合「本仓库只做 ERP demo」的约定

### 7. 产品与文档（`.output/`）

- [ ] 按 `.cursor/rules/core.mdc` 维护 PRD、api-contracts、Plan、prototypes 等

### 8. 后端（若使用 `pycore/`）

- [ ] 虚拟环境、环境变量、端口与前端 `VITE_API_BASE_URL` 一致

**最小必做（时间紧时）**：第 1 节 + 第 4 节 + 第 2 节 + 第 3 节（Git）。
