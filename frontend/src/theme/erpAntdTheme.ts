/**
 * 与 `.cursor/skills/erp-ui/ASSETS/design-tokens.css` 及 `REFERENCES/components.md` 语义色一致。
 * ant-design-vue 的 seed token 需实色值，故在此与 CSS 变量同源写死；改主题时请与 design-tokens 同步。
 */
import type { ThemeConfig } from 'ant-design-vue/es/config-provider/context'

/** 与 `design-tokens.css` 中品牌/语义色一致（components.md 1.1） */
export const erpColor = {
  primary: '#346BFA',
  primaryHover: '#5A8BFB',
  primaryActive: '#1E4CCF',
  success: '#0DAA07',
  warning: '#FFC000',
  error: '#FF0E53',
  textHeading1: '#13171F',
  textHeading2: '#1E242F',
  textBody: '#323B4B',
  textSecondary: '#858B97',
  textDisabled: '#A1A6B0',
  bgPage: '#F3F5F8',
  bgContainer: '#FFFFFF',
  borderDefault: '#E4E6EA',
  borderHeavy: '#CFD2D7',
} as const

/**
 * ConfigProvider `theme`：对齐 components.md + design-tokens（浅色、控件高 32、小圆角 3）。
 */
export const erpAntdTheme: ThemeConfig = {
  token: {
    colorPrimary: erpColor.primary,
    colorSuccess: erpColor.success,
    colorWarning: erpColor.warning,
    colorError: erpColor.error,
    colorInfo: erpColor.primary,
    colorLink: erpColor.primary,
    colorBgLayout: erpColor.bgPage,
    colorBgContainer: erpColor.bgContainer,
    colorText: erpColor.textBody,
    colorTextSecondary: erpColor.textSecondary,
    colorTextTertiary: '#717887',
    colorTextQuaternary: erpColor.textDisabled,
    colorBorder: erpColor.borderDefault,
    colorBorderSecondary: erpColor.borderHeavy,
    fontFamily: "'Inter', -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif",
    fontSize: 14,
    fontSizeSM: 12,
    fontSizeLG: 16,
    lineHeight: 1.5714285714285714,
    borderRadius: 6,
    borderRadiusSM: 3,
    borderRadiusLG: 10,
    controlHeight: 32,
    controlHeightSM: 24,
    controlHeightLG: 40,
    paddingSM: 8,
    padding: 16,
    paddingXS: 8,
    paddingXXS: 4,
    lineWidth: 1,
    wireframe: false,
  },
  components: {
    Layout: {
      /** 与方案 A 一致：壳内顶栏/主栏画布 Gray1，白卡由业务区卡片承担 */
      colorBgHeader: erpColor.bgPage,
      colorBgBody: erpColor.bgPage,
      colorBgTrigger: erpColor.borderDefault,
    },
  },
}
