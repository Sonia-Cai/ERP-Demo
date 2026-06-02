/** 一级 key → 二三级 Demo 数据（不默认选中三级，由用户点击） */

export type NavThirdItem = { id: string; label: string }

export type NavSecondItem = {
  id: string
  label: string
  children: NavThirdItem[]
}

const genThird = (prefix: string, labels: string[]): NavThirdItem[] =>
  labels.map((label, i) => ({ id: `${prefix}-t${i}`, label }))

/** 运营：略贴近业务；其余一级用通用结构 */
const SPECIAL: Record<string, NavSecondItem[]> = {
  operations: [
    {
      id: 'op-s1',
      label: '销售管理',
      children: genThird('op-s1', [
        '备货总览',
        '备货看板',
        '备货指令',
        '到货需求',
        '销售计划',
        '采购需求',
        '销售型号',
        '安全天数',
        'ASIN',
      ]),
    },
    {
      id: 'op-s2',
      label: '基础数据',
      children: genThird('op-s2', [
        '考核Model',
        '平台费用',
        '物流成本',
        '汇率',
        '采购成本对比',
      ]),
    },
    {
      id: 'op-s3',
      label: '绩效目标管理',
      children: genThird('op-s3', [
        '目标版本',
        '目标制定',
        '分析看板',
        '市场份额',
        '总览看板',
      ]),
    },
  ],
}

function defaultTree(firstKey: string): NavSecondItem[] {
  return [
    {
      id: `${firstKey}-s1`,
      label: '功能分组一',
      children: genThird(`${firstKey}-s1`, ['子页面 A', '子页面 B', '子页面 C']),
    },
    {
      id: `${firstKey}-s2`,
      label: '功能分组二',
      children: genThird(`${firstKey}-s2`, ['子页面 D', '子页面 E']),
    },
    {
      id: `${firstKey}-s3`,
      label: '功能分组三',
      children: genThird(`${firstKey}-s3`, ['子页面 F', '子页面 G']),
    },
  ]
}

export function getNavSubTree(firstKey: string): NavSecondItem[] {
  return SPECIAL[firstKey] ?? defaultTree(firstKey)
}

const FIRST_KEYS = [
  'common',
  'order',
  'purchase',
  'delivery',
  'inventory',
  'product',
  'operations',
  'quality',
  'supplier',
  'logistics',
  'finance',
  'master',
] as const

/** 按三级 id 解析当前导航文案（顶栏页签与菜单改名后仍可对齐） */
export function findThirdNavLabel(thirdId: string): string | undefined {
  for (const key of FIRST_KEYS) {
    const tree = getNavSubTree(key)
    for (const second of tree) {
      const hit = second.children.find((c) => c.id === thirdId)
      if (hit) return hit.label
    }
  }
  return undefined
}
