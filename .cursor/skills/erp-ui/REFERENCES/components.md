# 组件设计规范（components.md）
> 基于 `design-tokens.css` 设计令牌开发，所有样式取值均使用 CSS 变量，禁止硬编码数值

## 一、通用基础规范
### 1.1 颜色系统
| 语义分类 | 正常态 | 悬浮态 | 激活态 | 禁用态 | 焦点态 | 背景态 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 主品牌色 | `--color-primary` | `--color-primary-hover` | `--color-primary-active` | `--color-primary-disabled` | `--color-primary-focus` | `--color-primary-bg` |
| 成功色 | `--color-success` | `--color-success-hover` | `--color-success-active` | `--color-success-disabled` | `--color-success-focus` | `--color-success-bg` |
| 错误色 | `--color-error` | `--color-error-hover` | `--color-error-active` | `--color-error-disabled` | `--color-error-focus` | `--color-error-bg` |
| 警告色 | `--color-warning` | `--color-warning-hover` | `--color-warning-active` | `--color-warning-disabled` | `--color-warning-focus` | `--color-warning-bg` |

**中性色引用**
- 文字：`--color-text-heading-1`/`--color-text-heading-2`/`--color-text-body`/`--color-text-secondary`/`--color-text-disabled`
- 背景：`--color-bg-page`/`--color-bg-container`/`--color-bg-disabled`/`--color-bg-selected`
- 边框：`--color-border-default`/`--color-border-heavy`
- 图标：`--color-icon-primary`/`--color-icon-secondary`

### 1.2 排版系统
| 类型 | 字号 | 行高 | 字重 | 适用场景 |
| :--- | :--- | :--- | :--- | :--- |
| 小文字 | `--font-size-small` | `--line-height-small` | `--font-weight-regular` | 辅助说明、标签 |
| 常规文字 | `--font-size-regular` | `--line-height-regular` | `--font-weight-regular` | 输入框、按钮、正文 |
| 小标题 | `--font-size-h6` | `--line-height-h6` | `--font-weight-semibold` | 组件标题、卡片标题 |
| 中标题 | `--font-size-h5` | `--line-height-h5` | `--font-weight-semibold` | 模块标题 |
| 大标题 | `--font-size-h4` | `--line-height-h4` | `--font-weight-semibold` | 页面主标题 |

**字体**：`--font-family`

### 1.3 间距系统
| 令牌 | 取值 | 适用场景 |
| :--- | :--- | :--- |
| `--spacing-none` | 0px | 无间距 |
| `--spacing-super-tight` | 2px | 图标与文字紧凑间距 |
| `--spacing-extra-tight` | 4px | 组件内部微小内边距 |
| `--spacing-tight` | 8px | 元素紧凑间距 |
| `--spacing-base-tight` | 12px | 组件内部/控件间小间距 |
| `--spacing-base` | 16px | 通用基础间距 |
| `--spacing-base-loose` | 20px | 基础宽松间距 |
| `--spacing-loose` | 24px | 模块间间距 |
| `--spacing-extra-loose` | 32px | 大模块间距 |
| `--spacing-super-loose` | 40px | 页面区块间距 |

### 1.4 圆角/阴影/描边/图标/控件高度
- **圆角**：`--radius-extra-small`/`--radius-small`/`--radius-medium`/`--radius-large`/`--radius-full`
- **阴影**：`--shadow-0`/`--shadow-1`/`--shadow-2`/`--shadow-3`
- **描边**：`--border-width-none`/`--border-width`/`--border-width-focus`
- **图标尺寸**：`--icon-size-xs`/`--icon-size-sm`/`--icon-size-md`/`--icon-size-lg`/`--icon-size-xl`
- **控件高度**：`--control-height-sm`/`--control-height-md`/`--control-height-lg`

---

## 二、表单核心组件规范
### 2.1 按钮（Button）
#### 尺寸规范
**所有按钮高度统一 `--control-height-md`（32px），无任何例外，包括筛选栏、表格操作列、弹窗内按钮。**

| 属性 | 值 |
| :--- | :--- |
| 高度 | `--control-height-md`（32px）|
| 左右内边距 | `--spacing-base` |
| 字号 | `--font-size-regular` |
| 圆角 | `--radius-small` |

#### 样式规范
- **主按钮**：背景`--color-primary`，文字`--color-text-inverse`，禁用`--color-primary-disabled`
- **次要按钮**：背景透明，文字`--color-primary`，边框`--color-primary`
- **语义按钮**：成功/错误/警告分别引用对应颜色令牌

#### 间距规范
按钮组内间距：`--spacing-base-tight`

---

### 2.2 输入框（Input）
#### 基础规范
- 高度：`--control-height-md`（32px）**全局唯一高度，无论场景，包括表格内嵌输入框，不得使用 sm / lg 变体**
- 内边距：`--spacing-base`
- 圆角：`--radius-small`
- 字号：`--font-size-regular`

#### 宽度规范
| 类型 | 宽度 Token | 适用场景 |
| :--- | :--- | :--- |
| 数字输入框 | `--input-width-number`（96px）| 仅用于纯数字字段（数量、金额等）|
| 短字段 | `--input-width-short`（200px）| **仅用于表格内嵌**（行内数量、状态、货币单位）|
| 中字段 | `--input-width-medium`（240px）| 表单中绝大多数字段（SKU、渠道、日期、仓库名称等）|
| 长字段 | `--input-width-long`（400px）| 备注、描述、地址 |

> 禁止在表格外使用短字段（200px）；禁止使用以上四档以外的自定义宽度。

#### 状态样式
| 状态 | 边框 | 背景 | 文字 | 占位符 |
| :--- | :--- | :--- | :--- | :--- |
| 默认 | `--color-border-default` | `--color-bg-container` | `--color-text-body` | `--color-text-secondary` |
| 聚焦 | `--color-primary-focus` | `--color-bg-container` | `--color-text-body` | `--color-text-secondary` |
| 禁用 | `--color-border-default` | `--color-bg-disabled` | `--color-text-disabled` | `--color-text-disabled` |
| 错误 | `--color-error` | `--color-bg-container` | `--color-text-body` | `--color-text-secondary` |

---

### 2.3 下拉选择器（Select）
- 高度：`--control-height-md`（32px）**全局唯一高度，无论场景，不得使用 sm / lg 变体**
- 其余基础尺寸、状态样式同 **输入框（Input）**
- 选项高度：`--control-height-md`
- 选项间距：`--spacing-base-tight`
- 下拉面板圆角：`--radius-medium`
- **搜索框规则**：除以下两类外，所有下拉面板必须包含搜索框：
  - ① 日期选择类（调拨时间、年度、月份等）
  - ② 纯数字 / 固定少量枚举类（年度、页码等）
- 涉及业务维度（SKU / 渠道 / 仓库 / 人员）的下拉，须使用 `/REFERENCES/business-components.md` 中的专属组件，不得使用原生 `<select>`
- **页面式白卡 + 内滚动骨架**（`.list-page-card.pf-page-card`、`.pf-scroll`、底栏）：下拉浮层与页面 **`overflow` / 堆叠 / 滚轮链式** 须同时满足 **`form-standard.md` §4.2.1**；与 **`business-components.md` 零**、**`icon-standard.md` §9** 配套。

---

### 2.4 单选框/复选框（Radio/Checkbox）
- 组件尺寸：`--icon-size-md`
- 选项间距：`--spacing-base-tight`
- 选中色：`--color-primary`
- 禁用色：`--color-text-disabled`
- 文字字号：`--font-size-regular`

---

### 2.5 开关（Switch）
- 宽度：`--spacing-base-loose`
- 高度：`--spacing-tight`
- 开启色：`--color-primary`
- 关闭色：`--color-border-default`
- 禁用色：`--color-text-disabled`

---

### 2.6 日期选择器（DatePicker）
- 高度：`--control-height-md`（32px），同 **输入框（Input）**
- 基础尺寸、状态样式同 **输入框（Input）**
- 日期面板圆角：`--radius-medium`
- 日期项间距：`--spacing-tight`

---

### 2.7 文本域（Textarea）
- 最小高度：`--control-height-lg`
- 内边距：`--spacing-base`
- 圆角：`--radius-small`
- 状态样式同 **输入框（Input）**
- 仅允许垂直拉伸

---

### 2.8 附件上传（Upload）
- 上传按钮样式：同 **次要按钮**
- 上传区域圆角：`--radius-medium`
- 内边距：`--spacing-base`
- 文字字号：`--font-size-regular`

---

## 三、通用容器组件规范
### 3.1 卡片（Card）
- 背景：`--color-bg-container`
- 圆角：`--radius-medium`
- 内边距：`--spacing-base`
- 标题字号：`--font-size-h6`
- 标题与内容间距：`--spacing-tight`

### 3.2 弹窗（Modal）
- 背景：`--color-bg-container`
- 圆角：`--radius-large`
- 阴影：`--shadow-3`
- 内容内边距：`--spacing-base`
- 按钮区间距：`--spacing-base-tight`

---

### 3.3 标签（Tag）

#### 基础规范
- 内边距：`1px 8px`（固定，不可调整）
- 圆角：`--radius-tag`（30px，所有标签统一）
- 字号：`--font-size-small`
- 默认文字色：`--color-text-body`（#323B4B），语义标签除外（见下表 c）
- 描边：**中性灰标签无描边；扩展功能色标签无描边；语义标签无描边**

---

#### a. 中性灰标签
适用场景：常规 / 通用 / 无特殊业务指向的标签

| 属性 | 值 | Token |
| :--- | :--- | :--- |
| 背景色 | #F3F5F8 | `--color-bg-page` |
| 文字色 | #323B4B | `--color-text-body` |
| 描边 | 无 | — |

> 当扩展功能色标签种类超出 7 个时，超出部分统一改用中性灰标签（如销售颜色、销售国家、货源地等维度过多时）。

---

#### b. 扩展功能色标签
适用场景：超出 4 类核心语义状态的细分业务标签（如渠道、国家、货源地、销售颜色等）

文字色统一 `--color-text-body`（#323B4B），按以下顺序依次分配背景色：

| 优先级 | 背景色 | Token |
| :--- | :--- | :--- |
| 1 | #C8DAFE | `--color-brand-2` |
| 2 | #D4F0FF | `--color-turquoise-2` |
| 3 | #BCFFDC | `--color-cyan-2` |
| 4 | #B9EEB4 | `--color-green-2` |
| 5 | #FFF3DC | `--color-gold-2` |
| 6 | #FFE3D1 | `--color-orange-2` |
| 7 | #C7CAFE | `--color-purple-2` |

---

#### c. 语义状态标签
颜色与业务状态强绑定，无需额外解释可快速识别。

| 业务状态 | 背景色 | 文字色 | 背景 Token | 文字 Token |
| :--- | :--- | :--- | :--- | :--- |
| 成功 | #EDFFEB | #0DAA07 | `--color-success-bg` | `--color-success` |
| 失败 / 错误 | #FFE8E9 | #FF0E53 | `--color-error-bg` | `--color-error` |
| 告警 | #FFFBF4 | #FFC000 | `--color-warning-bg` | `--color-warning` |
| 进行中 | #EAF1FF | #346BFA | `--color-primary-bg` | `--color-primary` |

---

#### d. 可选择性标签
| 状态 | 背景色 | 文字色 | Token |
| :--- | :--- | :--- | :--- |
| 未选中 | #F3F5F8 | #323B4B | `--color-bg-page` / `--color-text-body` |
| 选中 | #346BFA | #FFFFFF | `--color-primary` / `--color-text-inverse` |

---

#### 禁止规则
- 禁止自定义非规范色值或私自混用体系
- 语义标签颜色不得挪作他用（如用成功绿表示非成功业务状态）
- 扩展功能色超出 7 个时必须改用中性灰，不得新增颜色
- 禁止中性灰标签加描边
- **中性灰标签与扩展功能色标签禁止在同一页面/同一字段内混用**；同一维度的标签必须全部使用中性灰体系，或全部使用扩展功能色体系，不得部分彩色、部分灰色交叉出现

---

## 四、筛选栏（Filter Bar）规范

筛选栏固定在表格/列表上方，布局、尺寸、文案全局统一。

| 属性 | 规范 | Token |
| :--- | :--- | :--- |
| 筛选项标题字号 | 14px | `--font-size-regular` |
| 筛选项标题颜色 | #323B4B（Gray11）| `--color-text-body` |
| 筛选项控件高度 | 32px | `--control-height-md` |
| 筛选按钮高度 | 32px | `--control-height-md` |
| 标题与控件间距 | 8px | `--spacing-tight` |
| 控件之间间距 | 12px | `--spacing-base-tight` |

---

## 五、规范约束
1. 所有组件**必须使用 design-tokens 变量**，禁止直接写色值/px数值
2. 组件内部、控件之间小间距统一使用 `--spacing-base-tight: 12px`
3. **输入框（Input）、下拉选择器（Select）、日期选择器（DatePicker）高度全局统一 `--control-height-md: 32px`，无任何例外，包括表格内嵌输入框、筛选栏控件，禁止使用 sm / lg 变体**
4. **所有按钮高度统一 `--control-height-md: 32px`，无任何例外**
5. 交互状态（默认/悬浮/聚焦/禁用/错误）必须严格匹配令牌定义
6. **页面式表单**内嵌 **Select / DatePicker / SearchSelect** 等带浮层控件时：**`overflow`、Portal、与底栏叠放、栅格滚动** 等集成约束见 **`form-standard.md` §4.2.1**（不得仅按本节控件尺寸实现而忽略白卡骨架）。

### 5.1 关联文件与规范索引
- 设计令牌：`design-tokens.css`
- 表单设计通用规范（含页面式 **§4.2.1 集成约束**）：`form-standard.md`
- 业务复合组件（SearchSelect / ChannelSelect 等）：`business-components.md`
- 图标与 iconfont 桥接：`icon-standard.md`（**§9** 主内容区）
- 典型页面布局（白卡与页面式索引）：`page-list.md`

## 六、表单标题与操作栏规范
### 6.1 表单标题规范
#### 适用场景
抽屉式表单、页面式表单、弹窗式表单顶部标题区

#### 样式规则（引用 design-tokens 变量）
- 字号：`--font-size-h6`（16px）
- 字重：`--font-weight-semibold`
- 文字颜色：`--color-text-heading-2`（#1E242F）
- 标题高度：56px
- 标题左右内边距：`--spacing-base`（16px）
- 标题底部边框：`--border-width` solid `--color-border-default`（1px/#E4E6EA）
- 标题与下方表单内容间距：`--spacing-loose`（24px）
- 返回/关闭图标尺寸：`--icon-size-lg`（20×20px）
- 返回/关闭图标颜色：`--color-text-body`（#323B4B）

#### 图标布局规则
- 抽屉式表单、页面式表单：图标在标题**左侧**，图标与标题间距 `--spacing-base`（16px）
- 弹窗式表单：图标在标题**右侧**，图标与标题均距弹窗容器 `--spacing-base`（16px）

#### 分载体适配
- 抽屉 / 页面表单标题：左对齐，顶部固定展示
- 弹窗表单标题：左对齐，与弹窗容器同宽

---

### 6.2 表单操作栏规范（表单底部按钮区）
#### 适用场景
所有表单底部「保存 / 提交 / 取消 / 重置」按钮容器

#### 布局规则
- 位置：表单底部固定，与内容区隔离
- 对齐方式：全部靠右排布
- 操作栏内边距：`--spacing-base`（16px）
- 操作栏顶部边框：`--border-width` solid `--color-border-default`（1px/#E4E6EA）
- 按钮之间间距：`--spacing-base`（16px）

#### 按钮排序规范
1. 主按钮（保存 / 提交）：右侧第一位
2. 线框按钮（新增下一条）：主按钮左侧
3. 次按钮（取消 / 重置 / 返回）：最后一位

#### 分载体适配
- 抽屉 / 页面表单操作栏：宽度 100%，底部固定
- 弹窗表单操作栏：与弹窗容器同宽，按钮靠右

---

