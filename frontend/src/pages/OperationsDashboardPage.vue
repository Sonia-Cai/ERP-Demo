<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import type { TableColumnsType } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import arrowUpSvg   from '@/assets/icons/arrow-up.svg?raw'
import arrowDownSvg from '@/assets/icons/arrow-down.svg?raw'
import tab1ActiveUrl from '@/assets/dashboard/tab1-active.png?url'
import tab1InactiveUrl from '@/assets/dashboard/tab1-inactive.png?url'
import tab2ActiveUrl from '@/assets/dashboard/tab2-active.png?url'
import tab2InactiveUrl from '@/assets/dashboard/tab2-inactive.png?url'
import {
  getKpiMetric,
  USD_RATE,
  COUNTRIES,
  CATEGORIES,
  COUNTRY_HEX,
  getCountryKpi,
  getCountryAdsMoney,
  getKpiByCategoryVersion,
  slugToTitleCase,
  applyCurrency,
} from '@/data/dashboardKpi'
import type { VersionKey } from '@/data/dashboardKpi'
import * as echarts from 'echarts/core'
import { BarChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([BarChart, PieChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])
import categoryHeaterUrl from '@/assets/category/heater.png?url'
import categoryTowerFanUrl from '@/assets/category/tower-fan.png?url'
import categoryStandingFanUrl from '@/assets/category/standing-fan.png?url'
import categoryHumidifierUrl from '@/assets/category/air-conditioner.png?url'
import categoryAirConditionerUrl from '@/assets/category/humidifier.png?url'
import categoryCeilingFanUrl from '@/assets/category/ceiling-fan.png?url'
import categoryCoolingFanUrl from '@/assets/category/cooling-fan.png?url'
import categoryAirCirculatorUrl from '@/assets/category/air-circulator.png?url'
import categoryMilkFrotherUrl from '@/assets/category/milk-frother.png?url'
import categoryAirPurifierUrl from '@/assets/category/air-purifier.png?url'
import categoryWaterPurifierUrl from '@/assets/category/water-purifier.png?url'
import categoryDehumidifierUrl from '@/assets/category/dehumidifier.png?url'
import categorySmartKitchenUrl from '@/assets/category/smart-kitchen.png?url'
import categoryKitchenAccessoryUrl from '@/assets/category/kitchen-accessory.png?url'
import ErpAppShell from '@/components/ErpAppShell.vue'
import { findThirdNavLabel } from '@/data/navSubTree'
import tabTitleLineupSvg from '@/assets/dashboard/tab-title-lineup.svg?raw'
import tabTitleOverviewSvg from '@/assets/dashboard/tab-title-overview.svg?raw'
import tabCloseUrl from '@/assets/nav/tab-close.svg?url'

const navActive = ref('operations')

type ChromeTab = { thirdId: string; label: string }

/** 与 `navSubTree.ts` 中运营 · 绩效目标管理 ·「分析看板」一致，用于首屏顶栏 Demo 页签 */
const DEFAULT_CHROME_TAB: ChromeTab = { thirdId: 'op-s3-t2', label: '分析看板' }

const chromeTabs = ref<ChromeTab[]>([{ ...DEFAULT_CHROME_TAB }])
const activeTabKey = ref(DEFAULT_CHROME_TAB.thirdId)

function resolveChromeTabLabel(thirdId: string, fallback: string) {
  return findThirdNavLabel(thirdId) ?? fallback
}

function chromeTabLabel(tab: ChromeTab) {
  return resolveChromeTabLabel(tab.thirdId, tab.label)
}

function syncChromeTabLabels() {
  chromeTabs.value = chromeTabs.value.map((t) => ({
    ...t,
    label: resolveChromeTabLabel(t.thirdId, t.label),
  }))
}

function onThirdNavClick(_firstKey: string, _secondId: string, thirdId: string, thirdLabel: string) {
  const label = resolveChromeTabLabel(thirdId, thirdLabel)
  const exists = chromeTabs.value.some((t) => t.thirdId === thirdId)
  if (exists) {
    chromeTabs.value = chromeTabs.value.map((t) =>
      t.thirdId === thirdId ? { ...t, label } : t,
    )
    activeTabKey.value = thirdId
    return
  }
  chromeTabs.value = [...chromeTabs.value, { thirdId, label }]
  activeTabKey.value = thirdId
}

function closeChromeTab(thirdId: string) {
  const list = chromeTabs.value
  const idx = list.findIndex((t) => t.thirdId === thirdId)
  if (idx === -1) return
  const next = list.filter((t) => t.thirdId !== thirdId)
  chromeTabs.value = next
  if (activeTabKey.value !== thirdId) return
  activeTabKey.value = next[idx - 1]?.thirdId ?? next[idx]?.thirdId ?? ''
}

const chromeNowText = ref('')
let chromeClockTimer: ReturnType<typeof setInterval> | null = null

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`
}

function formatChromeNow(d: Date) {
  return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
}

function tickChromeClock() {
  chromeNowText.value = formatChromeNow(new Date())
}

type ChromeTz = '美东' | '美西' | '北京'

const chromeTimezone = ref<ChromeTz>('美东')

function onChromeTzMenuClick(info: { key: string | number }) {
  const k = String(info.key)
  if (k === '美东' || k === '美西' || k === '北京') chromeTimezone.value = k as ChromeTz
}

function onChromeUserMenuClick(info: { key: string | number }) {
  const k = String(info.key)
  if (k === 'download-center') message.info('下载中心（演示）')
  if (k === 'logout') message.info('退出登录（演示）')
}

function onChromeFeedbackClick() {
  message.info('意见反馈（演示）')
}

type AnalysisTab = 'overview' | 'lineup'

const VERSION_OPTIONS = ['2026V3', '2026V2', '2026V1', '2025V2', '2025V1'] as const

const versionSelectOptions = VERSION_OPTIONS.map((v) => ({ label: v, value: v }))

const CURRENCY_OPTIONS = [
  { label: '原币种', value: 'origin' as const },
  { label: 'USD', value: 'usd' as const },
]

const CATEGORY_ICON_MAP: Record<string, string> = {
  'heater': categoryHeaterUrl,
  'tower-fan': categoryTowerFanUrl,
  'standing-fan': categoryStandingFanUrl,
  'humidifier': categoryHumidifierUrl,
  'air-conditioner': categoryAirConditionerUrl,
  'ceiling-fan': categoryCeilingFanUrl,
  'cooling-fan': categoryCoolingFanUrl,
  'air-circulator': categoryAirCirculatorUrl,
  'milk-frother': categoryMilkFrotherUrl,
  'air-purifier': categoryAirPurifierUrl,
  'water-purifier': categoryWaterPurifierUrl,
  'dehumidifier': categoryDehumidifierUrl,
  'smart-kitchen': categorySmartKitchenUrl,
  'kitchen-accessory': categoryKitchenAccessoryUrl,
}

const CATEGORY_CHIPS = [
  { slug: 'all', label: '全部' },
  { slug: 'heater', label: '取暖器' },
  { slug: 'tower-fan', label: '塔扇' },
  { slug: 'standing-fan', label: '落地扇' },
  { slug: 'humidifier', label: '加湿器' },
  { slug: 'air-conditioner', label: '空调' },
  { slug: 'ceiling-fan', label: '吊扇' },
  { slug: 'cooling-fan', label: '冷风扇' },
  { slug: 'air-circulator', label: '空气循环扇' },
  { slug: 'milk-frother', label: '奶泡机' },
  { slug: 'air-purifier', label: '空气净化器' },
  { slug: 'water-purifier', label: '净水器' },
  { slug: 'dehumidifier', label: '除湿机' },
  { slug: 'kitchen-accessory', label: '厨房配件' },
  { slug: 'smart-kitchen', label: '智能厨电' },
] as const

const KPI_CARDS = [
  { key: 'sales'      as const, label: 'Sales',   color: 'var(--color-brand-6)',     isMoney: true,  isPercent: false },
  { key: 'revenue'    as const, label: 'Revenue',  color: 'var(--color-turquoise-6)', isMoney: true,  isPercent: false },
  { key: 'profit'     as const, label: 'Profit',   color: 'var(--color-cyan-6)',      isMoney: true,  isPercent: false },
  { key: 'profitRate' as const, label: 'Profit%',  color: 'var(--color-gold-6)',      isMoney: false, isPercent: true  },
  { key: 'adsRate'    as const, label: 'Ads%',     color: 'var(--color-purple-6)',    isMoney: false, isPercent: true  },
]

const activeAnalysisTab = ref<AnalysisTab>('overview')
const versionA = ref<string>('2026V2')
const versionB = ref<string>('2026V1')
const currency = ref<'origin' | 'usd'>('origin')
const showH2Only = ref(false)
const activeCategories = ref<string[]>(['all'])

// 下半年数据约占全年 55%（取暖/风扇品类 H2 占比偏高）
const H2_FACTOR = 0.55
function applyH2<T extends { sales: number; revenue: number; profit: number; profitRate: number; adsRate: number }>(m: T): T {
  if (!showH2Only.value) return m
  return {
    ...m,
    sales:   Math.round(m.sales   * H2_FACTOR),
    revenue: Math.round(m.revenue * H2_FACTOR),
    profit:  Math.round(m.profit  * H2_FACTOR),
  }
}

function isCategoryActive(slug: string): boolean {
  return activeCategories.value.includes(slug)
}

function setAnalysisTab(tab: AnalysisTab) {
  activeAnalysisTab.value = tab
}

function onAnalysisTabKeydown(e: KeyboardEvent, tab: AnalysisTab) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    setAnalysisTab(tab)
    return
  }
  if (e.key === 'ArrowRight' && tab === 'overview') {
    e.preventDefault()
    setAnalysisTab('lineup')
  }
  if (e.key === 'ArrowLeft' && tab === 'lineup') {
    e.preventDefault()
    setAnalysisTab('overview')
  }
}

function selectCategory(slug: string) {
  if (slug === 'all') {
    activeCategories.value = ['all']
    return
  }
  const current = activeCategories.value.filter(s => s !== 'all')
  const idx = current.indexOf(slug)
  if (idx === -1) {
    current.push(slug)
  } else {
    current.splice(idx, 1)
  }
  activeCategories.value = current.length === 0 ? ['all'] : current
}

function onCategoryKeydown(e: KeyboardEvent, index: number) {
  const chips = CATEGORY_CHIPS
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    selectCategory(chips[index].slug)
    return
  }
  let nextIndex = index
  if (e.key === 'ArrowRight') nextIndex = Math.min(index + 1, chips.length - 1)
  else if (e.key === 'ArrowLeft') nextIndex = Math.max(index - 1, 0)
  else return
  e.preventDefault()
  document.getElementById(`category-chip-${chips[nextIndex].slug}`)?.focus()
}

function formatKpiValue(n: number, meta: { isMoney: boolean; isPercent: boolean }): string {
  if (meta.isPercent) return `${n.toFixed(2)}%`
  return n.toLocaleString('en-US')
}

function formatKpiDiff(pct: number): string {
  const rounded = Math.round(pct)
  return rounded >= 0 ? `+${rounded}%` : `${rounded}%`
}

function aggKpiMetrics(slugs: string[], version: VersionKey): ReturnType<typeof getKpiMetric> {
  if (slugs.length === 1) return getKpiMetric(slugs[0], version)
  const all = slugs.map(s => getKpiMetric(s, version))
  const totalRev = all.reduce((s, m) => s + m.revenue, 0)
  return {
    sales:      all.reduce((s, m) => s + m.sales, 0),
    revenue:    totalRev,
    profit:     all.reduce((s, m) => s + m.profit, 0),
    profitRate: totalRev > 0 ? +((all.reduce((s, m) => s + m.profitRate * m.revenue, 0) / totalRev).toFixed(2)) : 0,
    adsRate:    totalRev > 0 ? +((all.reduce((s, m) => s + m.adsRate    * m.revenue, 0) / totalRev).toFixed(2)) : 0,
  }
}

const kpiCards = computed(() => {
  const slugs = activeCategories.value.includes('all') ? ['all'] : activeCategories.value
  const vA = versionA.value as VersionKey
  const vB = versionB.value as VersionKey
  const applyRate = (m: ReturnType<typeof getKpiMetric>) => currency.value === 'usd'
    ? { ...m, sales: Math.round(m.sales * USD_RATE), revenue: Math.round(m.revenue * USD_RATE), profit: Math.round(m.profit * USD_RATE) }
    : m
  const v2 = applyRate(applyH2(aggKpiMetrics(slugs, vA)))
  const v1 = applyRate(applyH2(aggKpiMetrics(slugs, vB)))
  const sym = currency.value === 'usd' ? '$' : '¥'
  return KPI_CARDS.map((meta) => {
    const main = v2[meta.key]
    const base = v1[meta.key]
    const diffPct = base === 0 ? 0 : ((main - base) / base) * 100
    return {
      ...meta,
      currencySymbol: sym,
      mainText: formatKpiValue(main, meta),
      baseText: formatKpiValue(base, meta),
      diffText: formatKpiDiff(diffPct),
      diffPositive: diffPct >= 0,
    }
  })
})

// ---------------------------------------------------------------
// 国家经营指标表
// ---------------------------------------------------------------

const activeCategorySlug = computed(() =>
  activeCategories.value.includes('all') ? 'all' : activeCategories.value[0],
)

const countryColumns = computed<TableColumnsType>(() => [
  {
    title: 'Country', key: 'country', dataIndex: 'code', align: 'left',
    sorter: (a: CountryRow, b: CountryRow) => a.code.localeCompare(b.code),
    width: 100,
  },
  { title: 'Sales',   key: 'sales',      align: 'left', width: 160 },
  { title: 'Revenue', key: 'revenue',    align: 'left', width: 180 },
  { title: 'Profit',  key: 'profit',     align: 'left', width: 160 },
  { title: 'Profit%', key: 'profitRate', align: 'left', width: 110 },
  { title: 'Ads%',    key: 'adsRate',    align: 'left', width: 150 },
])

type CountryMetricCell = { main: number; base: number; diffPct: number }
type CountryPctCell    = { main: number; base: number }
type CountryAdsCell    = { main: number; base: number; adsMoney: number }
type CountryRow = {
  code: string
  flag: string
  sales: CountryMetricCell
  revenue: CountryMetricCell
  profit: CountryMetricCell
  profitRate: CountryPctCell
  adsRate: CountryAdsCell
}

function buildCountryRow(
  code: string,
  flag: string,
  catSlug: string,
  vA: VersionKey,
  vB: VersionKey,
): CountryRow {
  const v2 = applyH2(applyCurrency(getCountryKpi(code, catSlug, vA), currency.value))
  const v1 = applyH2(applyCurrency(getCountryKpi(code, catSlug, vB), currency.value))
  const diff = (a: number, b: number) => (b === 0 ? 0 : ((a - b) / b) * 100)
  let adsMoney = getCountryAdsMoney(code, catSlug, vA)
  if (currency.value === 'usd') adsMoney = Math.round(adsMoney * USD_RATE)
  if (showH2Only.value) adsMoney = Math.round(adsMoney * H2_FACTOR)
  return {
    code,
    flag,
    sales:      { main: v2.sales,      base: v1.sales,      diffPct: diff(v2.sales, v1.sales) },
    revenue:    { main: v2.revenue,    base: v1.revenue,    diffPct: diff(v2.revenue, v1.revenue) },
    profit:     { main: v2.profit,     base: v1.profit,     diffPct: diff(v2.profit, v1.profit) },
    profitRate: { main: v2.profitRate, base: v1.profitRate },
    adsRate:    { main: v2.adsRate,    base: v1.adsRate, adsMoney },
  }
}

const countryRows = computed<CountryRow[]>(() => {
  const vA = versionA.value as VersionKey
  const vB = versionB.value as VersionKey
  const slugs = activeCategories.value.includes('all') ? ['all'] : activeCategories.value
  if (slugs.length === 1) {
    return COUNTRIES.map(({ code, flag }) => buildCountryRow(code, flag, slugs[0], vA, vB))
  }
  const diff = (a: number, b: number) => (b === 0 ? 0 : ((a - b) / b) * 100)
  return COUNTRIES.map(({ code, flag }) => {
    const aggMetric = (version: VersionKey) => {
      const all = slugs.map(s => getCountryKpi(code, s, version))
      const totalRev = all.reduce((s, m) => s + m.revenue, 0)
      return applyCurrency({
        sales:      all.reduce((s, m) => s + m.sales, 0),
        revenue:    totalRev,
        profit:     all.reduce((s, m) => s + m.profit, 0),
        profitRate: totalRev > 0 ? +((all.reduce((s, m) => s + m.profitRate * m.revenue, 0) / totalRev).toFixed(2)) : 0,
        adsRate:    totalRev > 0 ? +((all.reduce((s, m) => s + m.adsRate    * m.revenue, 0) / totalRev).toFixed(2)) : 0,
      }, currency.value)
    }
    const v2 = applyH2(aggMetric(vA))
    const v1 = applyH2(aggMetric(vB))
    let adsMoney = slugs.reduce((s, slug) => {
      let m = getCountryAdsMoney(code, slug, vA)
      if (currency.value === 'usd') m = Math.round(m * USD_RATE)
      return s + m
    }, 0)
    if (showH2Only.value) adsMoney = Math.round(adsMoney * H2_FACTOR)
    return {
      code, flag,
      sales:      { main: v2.sales,      base: v1.sales,      diffPct: diff(v2.sales, v1.sales) },
      revenue:    { main: v2.revenue,    base: v1.revenue,    diffPct: diff(v2.revenue, v1.revenue) },
      profit:     { main: v2.profit,     base: v1.profit,     diffPct: diff(v2.profit, v1.profit) },
      profitRate: { main: v2.profitRate, base: v1.profitRate },
      adsRate:    { main: v2.adsRate,    base: v1.adsRate, adsMoney },
    }
  })
})

function formatMoney(n: number): string {
  return n.toLocaleString('en-US')
}

function formatRowDiff(pct: number): string {
  const r = Math.round(pct)
  return r >= 0 ? `+${r}%` : `${r}%`
}

// ---------------------------------------------------------------
// 品线经营指标表格（静态 Demo）
// ---------------------------------------------------------------

type LineupRow = {
  key: string
  nameEn: string
  targets: string[]
  ms: { v2: number | null; v1: number | null }
  sales: { v2: number; v1: number; diff: number }
  revenue: { v2: number; v1: number; diff: number }
  profit: { v2: number; v1: number; diff: number }
  profitPct: { v2: number; v1: number; diff: number }
  adsPct: { v2: number; v1: number; diff: number }
  promoPct: { v2: number; v1: number; diff: number }
  mc: { v2: number; v1: number }
  cogs: { v2: number; v1: number }
  freight: { v2: number; v1: number }
  tariff: { v2: number; v1: number }
  storage: { v2: number; v1: number }
  csa: number | null
  basicTariff: { v2: number; v1: number }
  s301: { v2: number; v1: number }
  equalTariff: { v2: number; v1: number }
  steelAluTariff: { v2: number; v1: number }
}

const LINEUP_ROWS: LineupRow[] = [
  {
    key: 'tower-fan', nameEn: 'Tower Fan', targets: ['节点BS', '价格第一'],
    ms: { v2: 43.01, v1: 44.80 },
    sales: { v2: 835034, v1: 847327, diff: -1.44 },
    revenue: { v2: 55147213, v1: 53020706, diff: 4.01 },
    profit: { v2: 6613777, v1: 5581562, diff: 18.49 },
    profitPct: { v2: 11.99, v1: 10.53, diff: 13.87 },
    adsPct: { v2: 15.30, v1: 15.00, diff: 2.00 },
    promoPct: { v2: 12.21, v1: 12.51, diff: -2.40 },
    mc: { v2: 39.94, v1: 39.37 }, cogs: { v2: 28.30, v1: 27.27 },
    freight: { v2: 4.21, v1: 4.35 }, tariff: { v2: 7.43, v1: 7.71 },
    storage: { v2: 3.60, v1: 3.78 }, csa: 1287650,
    basicTariff: { v2: 2.80, v1: 2.90 }, s301: { v2: 1.78, v1: 2.10 },
    equalTariff: { v2: 2.52, v1: 2.38 }, steelAluTariff: { v2: 0.33, v1: 0.33 },
  },
  {
    key: 'evap-air-cooler', nameEn: 'Evaporative Air Cooler', targets: [],
    ms: { v2: null, v1: null },
    sales: { v2: 46421, v1: 31278, diff: 48.41 },
    revenue: { v2: 5356688, v1: 4228670, diff: 26.68 },
    profit: { v2: 755416, v1: 644596, diff: 17.19 },
    profitPct: { v2: 14.10, v1: 15.24, diff: -7.48 },
    adsPct: { v2: 14.81, v1: 12.57, diff: 17.82 },
    promoPct: { v2: 12.75, v1: 11.69, diff: 9.07 },
    mc: { v2: 40.22, v1: 40.76 }, cogs: { v2: 28.93, v1: 28.28 },
    freight: { v2: 3.72, v1: 4.09 }, tariff: { v2: 7.57, v1: 8.38 },
    storage: { v2: 3.60, v1: 3.05 }, csa: 0,
    basicTariff: { v2: 2.90, v1: 3.00 }, s301: { v2: 2.00, v1: 2.50 },
    equalTariff: { v2: 2.34, v1: 2.55 }, steelAluTariff: { v2: 0.33, v1: 0.33 },
  },
  {
    key: 'space-heater', nameEn: 'Space Heater', targets: ['节点BS', '价格第一'],
    ms: { v2: 36.94, v1: 33.92 },
    sales: { v2: 1721510, v1: 1580825, diff: 8.90 },
    revenue: { v2: 82352241, v1: 82165423, diff: 0.24 },
    profit: { v2: 13755501, v1: 18965975, diff: -27.47 },
    profitPct: { v2: 16.70, v1: 23.09, diff: -27.67 },
    adsPct: { v2: 10.49, v1: 9.26, diff: 13.28 },
    promoPct: { v2: 9.53, v1: 5.20, diff: 83.27 },
    mc: { v2: 44.20, v1: 41.04 }, cogs: { v2: 33.12, v1: 32.21 },
    freight: { v2: 2.43, v1: 2.60 }, tariff: { v2: 8.66, v1: 6.24 },
    storage: { v2: 3.00, v1: 2.46 }, csa: 0,
    basicTariff: { v2: 3.10, v1: 2.80 }, s301: { v2: 2.60, v1: 1.80 },
    equalTariff: { v2: 2.63, v1: 1.31 }, steelAluTariff: { v2: 0.33, v1: 0.33 },
  },
  {
    key: 'humidifier', nameEn: 'Humidifier', targets: ['节点BS', '价格第一'],
    ms: { v2: 25.99, v1: 19.92 },
    sales: { v2: 1318019, v1: 1010193, diff: 30.47 },
    revenue: { v2: 47243779, v1: 40528321, diff: 16.57 },
    profit: { v2: 583931, v1: 425142, diff: 37.35 },
    profitPct: { v2: 1.24, v1: 1.05, diff: 18.10 },
    adsPct: { v2: 21.94, v1: 22.21, diff: -1.22 },
    promoPct: { v2: 16.78, v1: 12.17, diff: 37.88 },
    mc: { v2: 42.83, v1: 43.84 }, cogs: { v2: 31.25, v1: 32.78 },
    freight: { v2: 3.49, v1: 3.57 }, tariff: { v2: 8.09, v1: 7.07 },
    storage: { v2: 3.59, v1: 3.18 }, csa: 271804,
    basicTariff: { v2: 2.70, v1: 2.70 }, s301: { v2: 2.50, v1: 2.20 },
    equalTariff: { v2: 2.56, v1: 1.84 }, steelAluTariff: { v2: 0.33, v1: 0.33 },
  },
  {
    key: 'poly-pedestal-fan', nameEn: 'Poly Pedestal Fan', targets: ['节点BS', '价格第一'],
    ms: { v2: 26.20, v1: 22.89 },
    sales: { v2: 451853, v1: 376016, diff: 20.17 },
    revenue: { v2: 35000962, v1: 29688566, diff: 17.89 },
    profit: { v2: 3067298, v1: 2591289, diff: 18.37 },
    profitPct: { v2: 8.76, v1: 8.73, diff: 0.34 },
    adsPct: { v2: 15.94, v1: 13.67, diff: 16.61 },
    promoPct: { v2: 11.52, v1: 10.82, diff: 6.47 },
    mc: { v2: 44.23, v1: 44.90 }, cogs: { v2: 31.07, v1: 31.57 },
    freight: { v2: 5.10, v1: 5.45 }, tariff: { v2: 8.06, v1: 7.87 },
    storage: { v2: 3.60, v1: 3.78 }, csa: 148494,
    basicTariff: { v2: 2.80, v1: 2.80 }, s301: { v2: 2.30, v1: 2.20 },
    equalTariff: { v2: 2.63, v1: 2.54 }, steelAluTariff: { v2: 0.33, v1: 0.33 },
  },
  {
    key: 'table-aircirculator', nameEn: 'Table Aircirculator Fan', targets: ['价格第三'],
    ms: { v2: 9.16, v1: 8.97 },
    sales: { v2: 314342, v1: 307573, diff: 2.20 },
    revenue: { v2: 12790516, v1: 11807196, diff: 8.33 },
    profit: { v2: 95597, v1: -302584, diff: -131.59 },
    profitPct: { v2: 0.75, v1: -2.56, diff: -129.30 },
    adsPct: { v2: 21.91, v1: 20.33, diff: 7.77 },
    promoPct: { v2: 15.25, v1: 12.76, diff: 19.51 },
    mc: { v2: 41.38, v1: 43.71 }, cogs: { v2: 29.66, v1: 30.91 },
    freight: { v2: 3.93, v1: 4.22 }, tariff: { v2: 7.79, v1: 8.58 },
    storage: { v2: 3.60, v1: 4.06 }, csa: 423120,
    basicTariff: { v2: 2.60, v1: 2.70 }, s301: { v2: 2.20, v1: 2.50 },
    equalTariff: { v2: 2.66, v1: 3.05 }, steelAluTariff: { v2: 0.33, v1: 0.33 },
  },
  {
    key: 'ceiling-fan', nameEn: 'Ceiling Fan', targets: [],
    ms: { v2: 3.21, v1: 2.82 },
    sales: { v2: 42995, v1: 40078, diff: 7.28 },
    revenue: { v2: 5243783, v1: 4849559, diff: 8.13 },
    profit: { v2: 660171, v1: 641780, diff: 2.87 },
    profitPct: { v2: 12.59, v1: 13.23, diff: -4.84 },
    adsPct: { v2: 14.59, v1: 13.55, diff: 7.68 },
    promoPct: { v2: 8.58, v1: 8.10, diff: 5.93 },
    mc: { v2: 44.68, v1: 43.95 }, cogs: { v2: 32.45, v1: 32.89 },
    freight: { v2: 3.65, v1: 3.78 }, tariff: { v2: 8.58, v1: 7.29 },
    storage: { v2: 3.00, v1: 2.96 }, csa: 0,
    basicTariff: { v2: 2.80, v1: 2.80 }, s301: { v2: 2.50, v1: 2.30 },
    equalTariff: { v2: 2.95, v1: 1.86 }, steelAluTariff: { v2: 0.33, v1: 0.33 },
  },
  {
    key: 'portable-ac', nameEn: 'Portable Air Conditio...', targets: ['价格第二'],
    ms: { v2: 5.98, v1: 4.53 },
    sales: { v2: 72802, v1: 55190, diff: 31.92 },
    revenue: { v2: 22212919, v1: 20061498, diff: 10.72 },
    profit: { v2: 1492845, v1: 805139, diff: 85.41 },
    profitPct: { v2: 5.49, v1: 4.01, diff: 36.91 },
    adsPct: { v2: 9.64, v1: 6.64, diff: 45.18 },
    promoPct: { v2: 9.96, v1: 11.20, diff: -11.07 },
    mc: { v2: 54.68, v1: 56.92 }, cogs: { v2: 41.85, v1: 38.32 },
    freight: { v2: 2.94, v1: 3.10 }, tariff: { v2: 9.89, v1: 15.49 },
    storage: { v2: 3.00, v1: 2.50 }, csa: 0,
    basicTariff: { v2: 3.50, v1: 3.80 }, s301: { v2: 3.30, v1: 5.80 },
    equalTariff: { v2: 2.76, v1: 5.56 }, steelAluTariff: { v2: 0.33, v1: 0.33 },
  },
  {
    key: 'oil-heater', nameEn: 'Oil Heater', targets: [],
    ms: { v2: null, v1: null },
    sales: { v2: 51497, v1: 0, diff: 0 },
    revenue: { v2: 4172490, v1: 0, diff: 0 },
    profit: { v2: 478975, v1: 0, diff: 0 },
    profitPct: { v2: 11.48, v1: 0, diff: 0 },
    adsPct: { v2: 10.52, v1: 0, diff: 0 },
    promoPct: { v2: 8.14, v1: 0, diff: 0 },
    mc: { v2: 49.29, v1: 30.01 }, cogs: { v2: 30.01, v1: 0 },
    freight: { v2: 4.95, v1: 0 }, tariff: { v2: 14.33, v1: 0 },
    storage: { v2: 3.50, v1: 0 }, csa: 0,
    basicTariff: { v2: 3.20, v1: 0 }, s301: { v2: 5.90, v1: 0 },
    equalTariff: { v2: 4.90, v1: 0 }, steelAluTariff: { v2: 0.33, v1: 0 },
  },
  {
    key: 'milk-frother', nameEn: 'Milk Frother', targets: [],
    ms: { v2: null, v1: null },
    sales: { v2: 148769, v1: 37763, diff: 293.75 },
    revenue: { v2: 5800367, v1: 2257933, diff: 156.89 },
    profit: { v2: -106958, v1: -66871, diff: 55.30 },
    profitPct: { v2: -1.84, v1: -3.05, diff: -39.67 },
    adsPct: { v2: 30.25, v1: 28.01, diff: 7.99 },
    promoPct: { v2: 11.41, v1: 16.23, diff: -29.70 },
    mc: { v2: 42.10, v1: 40.96 }, cogs: { v2: 32.74, v1: 31.47 },
    freight: { v2: 0.93, v1: 1.20 }, tariff: { v2: 8.43, v1: 8.26 },
    storage: { v2: 3.00, v1: 2.82 }, csa: 0,
    basicTariff: { v2: 2.80, v1: 2.80 }, s301: { v2: 2.60, v1: 2.60 },
    equalTariff: { v2: 2.70, v1: 2.53 }, steelAluTariff: { v2: 0.33, v1: 0.33 },
  },
  {
    key: 'air-purifier', nameEn: 'Air Purifier', targets: [],
    ms: { v2: null, v1: null },
    sales: { v2: 151068, v1: 595, diff: 25280.34 },
    revenue: { v2: 11484156, v1: 108176, diff: 10516.00 },
    profit: { v2: -2697293, v1: 44101, diff: -6213.59 },
    profitPct: { v2: -23.49, v1: 40.77, diff: -157.62 },
    adsPct: { v2: 49.70, v1: 0.87, diff: 5610.34 },
    promoPct: { v2: 17.97, v1: 1.95, diff: 821.54 },
    mc: { v2: 40.39, v1: 33.44 }, cogs: { v2: 30.85, v1: 23.95 },
    freight: { v2: 3.06, v1: 1.07 }, tariff: { v2: 6.48, v1: 1.86 },
    storage: { v2: 3.05, v1: 3.05 }, csa: 0,
    basicTariff: { v2: 2.00, v1: 1.40 }, s301: { v2: 2.15, v1: 0.13 },
    equalTariff: { v2: 2.00, v1: 0.00 }, steelAluTariff: { v2: 0.33, v1: 0.33 },
  },
  {
    key: 'dehumidifier', nameEn: 'Dehumidifier', targets: [],
    ms: { v2: 1.04, v1: 0.09 },
    sales: { v2: 42766, v1: 3612, diff: 1084.00 },
    revenue: { v2: 8940612, v1: 896447, diff: 897.34 },
    profit: { v2: 107347, v1: -11928, diff: -999.95 },
    profitPct: { v2: 1.20, v1: -1.33, diff: -190.23 },
    adsPct: { v2: 18.75, v1: 12.23, diff: 53.31 },
    promoPct: { v2: 15.57, v1: 21.80, diff: -28.58 },
    mc: { v2: 46.91, v1: 49.27 }, cogs: { v2: 35.37, v1: 35.75 },
    freight: { v2: 2.39, v1: 2.06 }, tariff: { v2: 9.16, v1: 11.45 },
    storage: { v2: 3.00, v1: 3.00 }, csa: 0,
    basicTariff: { v2: 2.90, v1: 3.00 }, s301: { v2: 3.30, v1: 4.80 },
    equalTariff: { v2: 2.63, v1: 3.32 }, steelAluTariff: { v2: 0.33, v1: 0.33 },
  },
  {
    key: 'water-filter', nameEn: 'Water Filter', targets: ['价格第二'],
    ms: { v2: 20.45, v1: 3.91 },
    sales: { v2: 34855, v1: 6655, diff: 423.80 },
    revenue: { v2: 4348236, v1: 889505, diff: 388.84 },
    profit: { v2: 243435, v1: 20582, diff: 1082.78 },
    profitPct: { v2: 5.60, v1: 2.31, diff: 142.42 },
    adsPct: { v2: 20.83, v1: 15.95, diff: 30.59 },
    promoPct: { v2: 15.34, v1: 34.05, diff: -54.96 },
    mc: { v2: 41.66, v1: 37.13 }, cogs: { v2: 30.30, v1: 26.37 },
    freight: { v2: 1.84, v1: 2.47 }, tariff: { v2: 9.53, v1: 7.97 },
    storage: { v2: 3.00, v1: 3.08 }, csa: 0,
    basicTariff: { v2: 2.60, v1: 2.60 }, s301: { v2: 3.70, v1: 3.00 },
    equalTariff: { v2: 2.90, v1: 2.04 }, steelAluTariff: { v2: 0.33, v1: 0.33 },
  },
]

// ── Per-geo scale table ──────────────────────────────────────────────────────
// amt: fraction of global amount; rates: additive offset (pp) on top of global %
const GEO_SCALES: Record<string, { amt: number; rates: Partial<Record<'profitPct'|'adsPct'|'promoPct'|'mc'|'cogs'|'freight'|'tariff'|'storage', number>> }> = {
  'north-america': { amt: 0.58, rates: { profitPct: -0.4, adsPct:  0.3, promoPct:  0.2 } },
  'europe':        { amt: 0.32, rates: { profitPct:  1.1, adsPct: -0.8, promoPct: -0.4, mc:  0.5, freight: -0.1 } },
  'asia':          { amt: 0.06, rates: { profitPct:  0.6, adsPct: -0.3, promoPct: -0.2, freight:  0.3 } },
  'US':            { amt: 0.52, rates: { profitPct: -0.3, adsPct:  0.5, promoPct:  0.3 } },
  'CA':            { amt: 0.06, rates: { profitPct:  0.4, adsPct:  0.2, promoPct:  0.1 } },
  'GB':            { amt: 0.07, rates: { profitPct:  0.9, adsPct: -0.6, promoPct: -0.3, mc:  0.3 } },
  'DE':            { amt: 0.09, rates: { profitPct:  1.4, adsPct: -1.0, promoPct: -0.5, mc:  0.6, freight: -0.2 } },
  'FR':            { amt: 0.05, rates: { profitPct:  0.7, adsPct: -0.5, promoPct: -0.2 } },
  'IT':            { amt: 0.04, rates: { profitPct:  0.5, adsPct: -0.4, promoPct: -0.1 } },
  'ES':            { amt: 0.04, rates: { profitPct:  0.6, adsPct: -0.3, promoPct: -0.2 } },
  'JP':            { amt: 0.06, rates: { profitPct:  0.8, adsPct: -0.2, promoPct: -0.3, mc:  0.4, freight:  0.2 } },
}

function scaleLineupRow(row: LineupRow, geo: string): LineupRow {
  const scale = GEO_SCALES[geo]
  if (!scale) return row
  const a = scale.amt
  const r = scale.rates
  const adj = (v: number, k: keyof typeof r) => parseFloat(((v) + (r[k] ?? 0)).toFixed(2))
  const scaleAmt = (v: number) => Math.round(v * a)
  const rediff = (v2: number, v1: number) => v1 !== 0 ? parseFloat(((v2 - v1) / Math.abs(v1) * 100).toFixed(2)) : 0
  const sv2 = scaleAmt(row.sales.v2), sv1 = scaleAmt(row.sales.v1)
  const rv2 = scaleAmt(row.revenue.v2), rv1 = scaleAmt(row.revenue.v1)
  const pv2 = scaleAmt(row.profit.v2), pv1 = scaleAmt(row.profit.v1)
  return {
    ...row,
    sales:     { v2: sv2, v1: sv1, diff: rediff(sv2, sv1) },
    revenue:   { v2: rv2, v1: rv1, diff: rediff(rv2, rv1) },
    profit:    { v2: pv2, v1: pv1, diff: rediff(pv2, pv1) },
    profitPct: { v2: adj(row.profitPct.v2, 'profitPct'), v1: adj(row.profitPct.v1, 'profitPct'), diff: row.profitPct.diff },
    adsPct:    { v2: adj(row.adsPct.v2, 'adsPct'),    v1: adj(row.adsPct.v1, 'adsPct'),    diff: row.adsPct.diff },
    promoPct:  { v2: adj(row.promoPct.v2, 'promoPct'),  v1: adj(row.promoPct.v1, 'promoPct'),  diff: row.promoPct.diff },
    mc:        { v2: adj(row.mc.v2, 'mc'),        v1: adj(row.mc.v1, 'mc') },
    cogs:      { v2: adj(row.cogs.v2, 'cogs'),      v1: adj(row.cogs.v1, 'cogs') },
    freight:   { v2: adj(row.freight.v2, 'freight'),   v1: adj(row.freight.v1, 'freight') },
    tariff:    { v2: adj(row.tariff.v2, 'tariff'),    v1: adj(row.tariff.v1, 'tariff') },
    storage:   { v2: adj(row.storage.v2, 'storage'),   v1: adj(row.storage.v1, 'storage') },
    csa: row.csa != null ? Math.round(row.csa * a) : null,
    basicTariff:    { v2: row.basicTariff.v2,    v1: row.basicTariff.v1    },
    s301:           { v2: row.s301.v2,           v1: row.s301.v1           },
    equalTariff:    { v2: row.equalTariff.v2,    v1: row.equalTariff.v1    },
    steelAluTariff: { v2: row.steelAluTariff.v2, v1: row.steelAluTariff.v1 },
  }
}

function aggregateLineupRows(rowSets: LineupRow[][]): LineupRow[] {
  if (rowSets.length === 1) return rowSets[0]
  return LINEUP_ROWS.map((_, i) => {
    const rows = rowSets.map(s => s[i])
    const totalRevV2 = rows.reduce((s, r) => s + r.revenue.v2, 0)
    const totalRevV1 = rows.reduce((s, r) => s + r.revenue.v1, 0)
    const sumAmt = (k: 'sales' | 'revenue' | 'profit') => {
      const v2 = rows.reduce((s, r) => s + r[k].v2, 0)
      const v1 = rows.reduce((s, r) => s + r[k].v1, 0)
      return { v2, v1, diff: v1 !== 0 ? parseFloat(((v2 - v1) / Math.abs(v1) * 100).toFixed(2)) : 0 }
    }
    const wavgRate = (k: 'profitPct' | 'adsPct' | 'promoPct') => {
      const v2 = totalRevV2 > 0 ? rows.reduce((s, r) => s + r[k].v2 * r.revenue.v2, 0) / totalRevV2 : rows[0][k].v2
      const v1 = totalRevV1 > 0 ? rows.reduce((s, r) => s + r[k].v1 * r.revenue.v1, 0) / totalRevV1 : rows[0][k].v1
      return { v2: parseFloat(v2.toFixed(2)), v1: parseFloat(v1.toFixed(2)), diff: v1 !== 0 ? parseFloat(((v2 - v1) / Math.abs(v1) * 100).toFixed(2)) : 0 }
    }
    const wavgSimple = (k: 'mc' | 'cogs' | 'freight' | 'tariff' | 'storage' | 'basicTariff' | 's301' | 'equalTariff' | 'steelAluTariff') => {
      const v2 = totalRevV2 > 0 ? rows.reduce((s, r) => s + r[k].v2 * r.revenue.v2, 0) / totalRevV2 : rows[0][k].v2
      const v1 = totalRevV1 > 0 ? rows.reduce((s, r) => s + r[k].v1 * r.revenue.v1, 0) / totalRevV1 : rows[0][k].v1
      return { v2: parseFloat(v2.toFixed(2)), v1: parseFloat(v1.toFixed(2)) }
    }
    return {
      ...rows[0],
      sales: sumAmt('sales'), revenue: sumAmt('revenue'), profit: sumAmt('profit'),
      profitPct: wavgRate('profitPct'), adsPct: wavgRate('adsPct'), promoPct: wavgRate('promoPct'),
      mc: wavgSimple('mc'), cogs: wavgSimple('cogs'), freight: wavgSimple('freight'),
      tariff: wavgSimple('tariff'), storage: wavgSimple('storage'),
      csa: rows.reduce((s, r) => s + (r.csa ?? 0), 0) || null,
      basicTariff:    wavgSimple('basicTariff'),
      s301:           wavgSimple('s301'),
      equalTariff:    wavgSimple('equalTariff'),
      steelAluTariff: wavgSimple('steelAluTariff'),
    }
  })
}

const isUSOnly = computed(() =>
  activeLineupCountries.value.length === 1 &&
  activeLineupCountries.value[0] === 'US' &&
  activeLineupRegions.value.includes('all')
)

const usOffset = computed(() => isUSOnly.value ? 4 : 0)

const lineupTableColumns = computed(() => {
  const cols = [
    { title: '品线', key: 'nameEn', align: 'left' as const, width: 120, fixed: 'left' as const },
    { title: '战略目标', key: 'targets', align: 'left' as const, width: 110 },
    { title: 'Market Share', key: 'ms', align: 'left' as const, width: 100 },
    { title: 'Sales', key: 'sales', align: 'left' as const, width: 130 },
    { title: 'Revenue', key: 'revenue', align: 'left' as const, width: 140 },
    { title: 'Profit', key: 'profit', align: 'left' as const, width: 140 },
    { title: 'Profit %', key: 'profitPct', align: 'left' as const, width: 100 },
    { title: 'Ads %', key: 'adsPct', align: 'left' as const, width: 100 },
    { title: 'Promo %', key: 'promoPct', align: 'left' as const, width: 100 },
    { title: 'MC%(毛收)', key: 'mc', align: 'left' as const, width: 95 },
    { title: '采购%(毛收)', key: 'cogs', align: 'left' as const, width: 100 },
    { title: '头程%(毛收)', key: 'freight', align: 'left' as const, width: 100 },
    { title: '关税%(毛收)', key: 'tariff', align: 'left' as const, width: 100 },
  ]
  if (isUSOnly.value) {
    cols.push(
      { title: '基础关税+附加费%(毛收)', key: 'basicTariff', align: 'left' as const, width: 180 },
      { title: '301%(毛收)', key: 's301', align: 'left' as const, width: 105 },
      { title: '对等关税%(毛收)', key: 'equalTariff', align: 'left' as const, width: 130 },
      { title: '钢铁铝加征关税%(毛收)', key: 'steelAluTariff', align: 'left' as const, width: 175 },
    )
  }
  cols.push(
    { title: '仓促费%(毛收)', key: 'storage', align: 'left' as const, width: 110 },
    { title: 'CSA', key: 'csa', align: 'left' as const, width: 100 },
  )
  return cols
})

/** flagcdn.com 使用 ISO 3166-1 alpha-2，部分内部代码需映射 */
const CODE_TO_ISO: Record<string, string> = { UK: 'GB' }
function flagUrl(code: string): string {
  return `https://flagcdn.com/16x12/${(CODE_TO_ISO[code] || code).toLowerCase()}.png`
}

const TARGET_TAG_STYLE: Record<string, string> = {
  '节点BS': 'background:#FFE3D1;',
  '价格第一': 'background:#B9EEB4;',
  '价格第二': 'background:#C8E6FF;',
  '价格第三': 'background:#E9D8FD;',
}

// ---------------------------------------------------------------
// 利润贡献与拆解
// ---------------------------------------------------------------

type BreakdownMetric = 'net-revenue' | 'net-profit'
const breakdownMetric = ref<BreakdownMetric>('net-revenue')

const profitBreakdown = computed(() => {
  const metricKey = breakdownMetric.value === 'net-revenue' ? 'revenue' : 'profit'
  const cat = activeCategorySlug.value
  const vA = versionA.value as VersionKey
  const vB = versionB.value as VersionKey
  const rowsV2 = COUNTRIES.map(({ code, flag }) => ({
    code,
    flag,
    val: getCountryKpi(code, cat, vA)[metricKey],
  }))
  const rowsV1Map = Object.fromEntries(
    COUNTRIES.map(({ code }) => [code, getCountryKpi(code, cat, vB)[metricKey]]),
  ) as Record<string, number>
  const sumV2 = rowsV2.reduce((s, r) => s + r.val, 0)
  const sumV1 = Object.values(rowsV1Map).reduce((s, v) => s + v, 0)
  return rowsV2
    .map(({ code, flag, val }) => {
      const pctV2 = sumV2 === 0 ? 0 : (val / sumV2) * 100
      const pctV1 = sumV1 === 0 ? 0 : ((rowsV1Map[code] ?? 0) / sumV1) * 100
      return {
        code,
        flag,
        pctV2,
        pctV1,
        trend: (pctV2 >= pctV1 ? 'up' : 'down') as 'up' | 'down',
      }
    })
    .sort((a, b) => b.pctV2 - a.pctV2)
})

const breakdownPieRef = ref<HTMLDivElement | null>(null)
const profitBreakdownBodyRef = ref<HTMLDivElement | null>(null)
let breakdownPie: ReturnType<typeof echarts.init> | null = null
let breakdownResizeObs: ResizeObserver | null = null

function renderBreakdownPie() {
  if (!breakdownPieRef.value) return
  if (!breakdownPie) {
    breakdownPie = echarts.init(breakdownPieRef.value, undefined, { renderer: 'canvas' })
  }
  breakdownPie.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
    legend: {
      top: 0,
      right: 0,
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { fontSize: 12 },
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '70%'],
        center: ['50%', '55%'],
        avoidLabelOverlap: true,
        label: {
          formatter: '{b}({d}%)',
          fontSize: 12,
        },
        labelLine: { length: 12, length2: 8 },
        data: profitBreakdown.value.map((it) => ({
          name: it.code,
          value: it.pctV2,
          itemStyle: { color: COUNTRY_HEX[it.code] },
        })),
      },
    ],
  })
  breakdownPie.resize()
}

watch(profitBreakdown, () => renderBreakdownPie(), { deep: true })
watch(breakdownMetric, () => renderBreakdownPie())

function handleBreakdownResize() {
  breakdownPie?.resize()
}

// ---------------------------------------------------------------
// 维度分析
// ---------------------------------------------------------------

type DimensionKpiKey = 'profit' | 'revenue' | 'sales' | 'profitRate'
type DimensionAxis = 'by-country' | 'by-lineup'

const dimensionMetric = ref<DimensionKpiKey>('profit')
const dimensionAxis = ref<DimensionAxis>('by-country')

const METRIC_LABEL: Record<DimensionKpiKey, string> = {
  profit:     '净利润',
  revenue:    '净收入',
  sales:      '销售额',
  profitRate: '利润率',
}
const currentMetricLabel = computed(() => METRIC_LABEL[dimensionMetric.value])

const dimensionLeftCards = computed(() => {
  const catSlug = activeCategorySlug.value
  const vA = versionA.value as VersionKey
  const vB = versionB.value as VersionKey
  const v2 = applyH2(applyCurrency(getKpiByCategoryVersion(catSlug, vA), currency.value))
  const v1 = applyH2(applyCurrency(getKpiByCategoryVersion(catSlug, vB), currency.value))
  const symbol = currency.value === 'usd' ? '$' : '¥'

  const buildCard = (key: DimensionKpiKey, label: string) => {
    const main = v2[key]
    const target = v1[key]
    const rate = target === 0 ? 0 : (main / target) * 100
    const dotEmoji =
      rate >= 100 ? '🟢' :
      rate >= 90  ? '🟠' :
                    '🔴'
    const isMoney = key !== 'profitRate'
    const format = (n: number) =>
      isMoney
        ? `${symbol}${Math.round(n).toLocaleString('en-US')}`
        : `${n.toFixed(2)}%`
    const diffPct = target === 0 ? 0 : ((main - target) / Math.abs(target)) * 100
    return {
      key,
      label,
      mainText:    format(main),
      targetText:  isMoney ? Math.round(target).toLocaleString('en-US') : `${target.toFixed(2)}%`,
      dotEmoji,
      diffPct,
      diffPositive: diffPct >= 0,
      diffText: (diffPct >= 0 ? '+' : '') + diffPct.toFixed(0) + '%',
    }
  }

  return [
    buildCard('profit',     '净利润'),
    buildCard('revenue',    '净收入'),
    buildCard('sales',      '销售额'),
    buildCard('profitRate', '利润率'),
  ]
})

const dimensionChartData = computed(() => {
  const vA = versionA.value as VersionKey
  const vB = versionB.value as VersionKey
  if (dimensionAxis.value === 'by-lineup') {
    const activeSlugs = activeCategories.value.includes('all')
      ? null
      : new Set(activeCategories.value)
    return CATEGORIES
      .filter((c) => c.slug !== 'all' && (!activeSlugs || activeSlugs.has(c.slug)))
      .map(({ slug }) => {
        const v2 = applyCurrency(getKpiByCategoryVersion(slug, vA), currency.value)
        const v1 = applyCurrency(getKpiByCategoryVersion(slug, vB), currency.value)
        return {
          key:     slug,
          labelEn: slugToTitleCase(slug),
          v2:      v2[dimensionMetric.value],
          v1:      v1[dimensionMetric.value],
        }
      })
  } else {
    const cat = activeCategorySlug.value
    return COUNTRIES.map(({ code }) => {
      const v2 = applyCurrency(getCountryKpi(code, cat, vA), currency.value)
      const v1 = applyCurrency(getCountryKpi(code, cat, vB), currency.value)
      return {
        key:     code,
        labelEn: code,
        v2:      v2[dimensionMetric.value],
        v1:      v1[dimensionMetric.value],
      }
    })
  }
})

const dimensionChartRef = ref<HTMLDivElement | null>(null)
let dimensionChart: ReturnType<typeof echarts.init> | null = null

function renderDimensionChart() {
  if (!dimensionChartRef.value) return
  if (!dimensionChart) {
    dimensionChart = echarts.init(dimensionChartRef.value, undefined, { renderer: 'canvas' })
  }
  const items    = dimensionChartData.value
  const labels   = items.map((it) => it.labelEn)
  const v2Vals   = items.map((it) => it.v2)
  const v1Vals   = items.map((it) => it.v1)
  const labelV2  = `${versionA.value} ${currentMetricLabel.value}`
  const labelV1  = `${versionB.value} ${currentMetricLabel.value}`

  const growthMid:  Array<{ value: [number, number]; itemStyle: { color: string } }> = []
  const growthHigh: Array<{ value: [number, number]; itemStyle: { color: string } }> = []
  items.forEach((it, idx) => {
    if (!it.v1) return
    const growth = ((it.v2 - it.v1) / it.v1) * 100
    const yTop = Math.max(it.v2, it.v1)
    if (growth > 100) {
      growthHigh.push({ value: [idx, yTop], itemStyle: { color: '#FF0E53' } })
    } else if (growth >= 0) {
      growthMid.push({ value: [idx, yTop], itemStyle: { color: '#FF840E' } })
    }
  })

  const gray3  = '#E4E6EA'
  const gray7  = '#858B97'
  const gray11 = '#323B4B'

  dimensionChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter(params: any[]) {
        const bars = (params as any[]).filter((p: any) => p.seriesType === 'bar')
        if (!bars.length) return ''
        const v2 = bars[0]?.value ?? 0
        const v1 = bars[1]?.value ?? 0
        const growth = v1 === 0 ? 0 : ((v2 - v1) / v1) * 100
        const pillBg = growth >= 0 ? '#B9EEB4' : '#FFBDBF'
        const pillText = growth >= 0 ? `+${growth.toFixed(0)}%` : `${growth.toFixed(0)}%`
        const pill = `<span style="display:inline-block;background:${pillBg};border-radius:30px;padding:1px 8px;font-size:11px;color:#323B4B;margin-left:6px;vertical-align:middle;">${pillText}</span>`
        let html = `<div style="font-weight:500;margin-bottom:6px;">${bars[0].axisValue}${pill}</div>`
        bars.forEach((p: any) => {
          const dot = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:5px;"></span>`
          html += `<div style="line-height:20px;">${dot}${p.seriesName}&nbsp;&nbsp;${typeof p.value === 'number' ? p.value.toLocaleString('en-US') : p.value}</div>`
        })
        return html
      },
    },
    legend: {
      top: 0, right: 0, icon: 'circle',
      itemWidth: 8, itemHeight: 8,
      data: [labelV2, labelV1, '0%~100% 增幅', '> 100% 增幅'],
      textStyle: { fontSize: 12, color: gray7 },
    },
    grid: { left: 8, right: 16, top: 48, bottom: 8, containLabel: true },
    dataZoom: [
      { type: 'inside', orient: 'horizontal', startValue: 0, endValue: Math.min(7, labels.length - 1) },
    ],
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: {
        interval: 0,
        fontSize: 11,
        color: gray11,
        rotate: dimensionAxis.value === 'by-lineup' ? 30 : 0,
      },
      axisLine: { lineStyle: { color: gray3 } },
      axisTick: { lineStyle: { color: gray3 } },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: gray3 } },
      axisLabel: { fontSize: 11, color: gray11 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      { name: labelV2, type: 'bar', data: v2Vals, itemStyle: { color: '#346BFA' }, barGap: '20%', barMaxWidth: 20, barCategoryGap: '50%' },
      { name: labelV1, type: 'bar', data: v1Vals, itemStyle: { color: '#00C2FF' }, barMaxWidth: 20, barCategoryGap: '50%' },
      { name: '0%~100% 增幅', type: 'scatter', symbolSize: 8, data: growthMid,  z: 10 },
      { name: '> 100% 增幅',  type: 'scatter', symbolSize: 8, data: growthHigh, z: 10 },
    ],
  }, true)
  dimensionChart.resize()
}

watch(
  [dimensionChartData, dimensionMetric, dimensionAxis],
  () => renderDimensionChart(),
  { deep: true },
)

function handleDimensionResize() {
  dimensionChart?.resize()
}

onMounted(() => {
  syncChromeTabLabels()
  tickChromeClock()
  chromeClockTimer = setInterval(tickChromeClock, 1000)
  renderBreakdownPie()
  window.addEventListener('resize', handleBreakdownResize)
  if (profitBreakdownBodyRef.value) {
    breakdownResizeObs = new ResizeObserver(() => {
      breakdownPie?.resize()
    })
    breakdownResizeObs.observe(profitBreakdownBodyRef.value)
  }
  renderDimensionChart()
  if (dimensionChartRef.value) {
    const dimObs = new ResizeObserver(() => dimensionChart?.resize())
    dimObs.observe(dimensionChartRef.value)
  }
  window.addEventListener('resize', handleDimensionResize)
})

onBeforeUnmount(() => {
  if (chromeClockTimer != null) {
    clearInterval(chromeClockTimer)
    chromeClockTimer = null
  }
  window.removeEventListener('resize', handleBreakdownResize)
  breakdownResizeObs?.disconnect()
  breakdownResizeObs = null
  breakdownPie?.dispose()
  breakdownPie = null
  window.removeEventListener('resize', handleDimensionResize)
  dimensionChart?.dispose()
  dimensionChart = null
})

// ---------------------------------------------------------------
// 总结卡片（静态 demo）
// ---------------------------------------------------------------
// ---------------------------------------------------------------
// 品线经营 tab — 地区 / 国家选择器（静态 demo）
// ---------------------------------------------------------------
const LINEUP_REGIONS = [
  { code: 'all',           label: '全部' },
  { code: 'north-america', label: '北美' },
  { code: 'europe',        label: '欧洲' },
  { code: 'asia',          label: '亚洲' },
]

const LINEUP_COUNTRIES = [
  { code: 'all', flag: '',   label: '全部' },
  { code: 'US',  flag: '🇺🇸', label: '美国' },
  { code: 'CA',  flag: '🇨🇦', label: '加拿大' },
  { code: 'GB',  flag: '🇬🇧', label: '英国' },
  { code: 'DE',  flag: '🇩🇪', label: '德国' },
  { code: 'FR',  flag: '🇫🇷', label: '法国' },
  { code: 'IT',  flag: '🇮🇹', label: '意大利' },
  { code: 'ES',  flag: '🇪🇸', label: '西班牙' },
  { code: 'JP',  flag: '🇯🇵', label: '日本' },
]

const activeLineupRegions   = ref<string[]>(['all'])
const activeLineupCountries = ref<string[]>(['all'])

function _toggleGeo(list: Ref<string[]>, code: string, total: number) {
  if (code === 'all') { list.value = ['all']; return }
  const next = list.value.includes(code)
    ? list.value.filter(c => c !== code)
    : list.value.filter(c => c !== 'all').concat(code)
  list.value = next.length === 0 || next.length === total - 1 ? ['all'] : next
}

function toggleRegion(code: string) {
  _toggleGeo(activeLineupRegions, code, LINEUP_REGIONS.length)
  if (!activeLineupRegions.value.includes('all')) activeLineupCountries.value = ['all']
}

function toggleCountry(code: string) {
  _toggleGeo(activeLineupCountries, code, LINEUP_COUNTRIES.length)
  if (!activeLineupCountries.value.includes('all')) activeLineupRegions.value = ['all']
}

const showTargets = computed(() =>
  activeLineupRegions.value.includes('all') &&
  activeLineupCountries.value.length === 1 &&
  !activeLineupCountries.value.includes('all'),
)

function buildLineupTotal(rows: LineupRow[]): LineupRow {
  const sum   = (fn: (r: LineupRow) => number) => rows.reduce((s, r) => s + fn(r), 0)
  const totalRevV2 = sum(r => r.revenue.v2)
  const totalRevV1 = sum(r => r.revenue.v1)
  const wavg = (fn: (r: LineupRow) => { v2: number; v1: number; diff: number }) => {
    const v2 = totalRevV2 > 0 ? rows.reduce((s, r) => s + fn(r).v2 * r.revenue.v2, 0) / totalRevV2 : 0
    const v1 = totalRevV1 > 0 ? rows.reduce((s, r) => s + fn(r).v1 * r.revenue.v1, 0) / totalRevV1 : 0
    const diff = v1 !== 0 ? parseFloat(((v2 - v1) / Math.abs(v1) * 100).toFixed(2)) : 0
    return { v2: parseFloat(v2.toFixed(2)), v1: parseFloat(v1.toFixed(2)), diff }
  }
  const wavgSimple = (fn: (r: LineupRow) => { v2: number; v1: number }) => {
    const v2 = totalRevV2 > 0 ? rows.reduce((s, r) => s + fn(r).v2 * r.revenue.v2, 0) / totalRevV2 : 0
    const v1 = totalRevV1 > 0 ? rows.reduce((s, r) => s + fn(r).v1 * r.revenue.v1, 0) / totalRevV1 : 0
    return { v2: parseFloat(v2.toFixed(2)), v1: parseFloat(v1.toFixed(2)) }
  }
  const rediff = (v2: number, v1: number) => v1 !== 0 ? parseFloat(((v2 - v1) / Math.abs(v1) * 100).toFixed(2)) : 0
  const sv2 = sum(r => r.sales.v2),   sv1 = sum(r => r.sales.v1)
  const rv2 = totalRevV2,             rv1 = totalRevV1
  const pv2 = sum(r => r.profit.v2),  pv1 = sum(r => r.profit.v1)
  return {
    key: '__total__', nameEn: 'Total', targets: [],
    ms: { v2: null, v1: null },
    sales:     { v2: sv2, v1: sv1, diff: rediff(sv2, sv1) },
    revenue:   { v2: rv2, v1: rv1, diff: rediff(rv2, rv1) },
    profit:    { v2: pv2, v1: pv1, diff: rediff(pv2, pv1) },
    profitPct: wavg(r => r.profitPct),
    adsPct:    wavg(r => r.adsPct),
    promoPct:  wavg(r => r.promoPct),
    mc:        wavgSimple(r => r.mc),
    cogs:      wavgSimple(r => r.cogs),
    freight:   wavgSimple(r => r.freight),
    tariff:    wavgSimple(r => r.tariff),
    storage:   wavgSimple(r => r.storage),
    csa: rows.reduce((s, r) => s + (r.csa ?? 0), 0) || null,
    basicTariff:    wavgSimple(r => r.basicTariff),
    s301:           wavgSimple(r => r.s301),
    equalTariff:    wavgSimple(r => r.equalTariff),
    steelAluTariff: wavgSimple(r => r.steelAluTariff),
  }
}

const lineupRows = computed<LineupRow[]>(() => {
  const activeGeos = [
    ...activeLineupRegions.value.filter(r => r !== 'all'),
    ...activeLineupCountries.value.filter(c => c !== 'all'),
  ]
  const baseRows = (() => {
    if (activeGeos.length === 0) return LINEUP_ROWS
    const knownGeos = activeGeos.filter(g => g in GEO_SCALES)
    if (knownGeos.length === 0) return LINEUP_ROWS
    const rowSets = knownGeos.map(geo => LINEUP_ROWS.map(row => scaleLineupRow(row, geo)))
    return aggregateLineupRows(rowSets)
  })()
  const usd = currency.value === 'usd'
  const h2  = showH2Only.value
  if (!usd && !h2) return baseRows
  const cvt = (v: number) => {
    let r = v
    if (usd) r = Math.round(r * USD_RATE)
    if (h2)  r = Math.round(r * H2_FACTOR)
    return r
  }
  return baseRows.map(row => ({
    ...row,
    sales:   { v2: cvt(row.sales.v2),   v1: cvt(row.sales.v1),   diff: row.sales.diff   },
    revenue: { v2: cvt(row.revenue.v2), v1: cvt(row.revenue.v1), diff: row.revenue.diff },
    profit:  { v2: cvt(row.profit.v2),  v1: cvt(row.profit.v1),  diff: row.profit.diff  },
    csa:     row.csa != null ? cvt(row.csa) : null,
  }))
})

const lineupRowsTotal = computed(() => buildLineupTotal(lineupRows.value))

const SUMMARY_TEXT = '本期销量、收入均超额完成目标，但利润未达考核指标，呈现「增收不增利」特征。核心受采购成本上涨、关税及 CSA 合规费用增加影响，叠加广告成本上升，利润率同比下滑 21%。'

const riskSummary = ref({
  lines: [SUMMARY_TEXT, SUMMARY_TEXT],
  author: '运营一部',
  date: '2026/05/27',
})

const goodSummary = ref({
  lines: [SUMMARY_TEXT, SUMMARY_TEXT],
  author: '运营一部',
  date: '2026/05/27',
})


</script>

<template>
  <ErpAppShell
    :nav-active-key="navActive"
    :chrome-timezone="chromeTimezone"
    :chrome-now-text="chromeNowText"
    @nav-click="(k) => (navActive = k)"
    @third-nav-click="onThirdNavClick"
    @chrome-tz-menu-click="onChromeTzMenuClick"
    @chrome-user-menu-click="onChromeUserMenuClick"
    @chrome-feedback-click="onChromeFeedbackClick"
  >
    <template #chrome-tabs>
      <div
        v-for="tab in chromeTabs"
        :key="tab.thirdId"
        class="erp-chrome-tab"
        :class="{ 'erp-chrome-tab--active': activeTabKey === tab.thirdId }"
        role="tab"
        :aria-selected="activeTabKey === tab.thirdId"
        :tabindex="activeTabKey === tab.thirdId ? 0 : -1"
        @click="activeTabKey = tab.thirdId"
        @keydown.enter.prevent="activeTabKey = tab.thirdId"
        @keydown.space.prevent="activeTabKey = tab.thirdId"
      >
        <span class="erp-chrome-tab__label">{{ chromeTabLabel(tab) }}</span>
        <button
          type="button"
          class="erp-chrome-tab__close"
          aria-label="关闭页签"
          @click.stop="closeChromeTab(tab.thirdId)"
        >
          <img class="erp-chrome-tab__close-icon" :src="tabCloseUrl" width="14" height="14" alt="" />
        </button>
      </div>
    </template>

    <div class="erp-dashboard__scroll">
      <section
        class="analysis-panel"
        :class="{ 'analysis-panel--lineup': activeAnalysisTab === 'lineup' }"      >
        <div class="analysis-panel__content">
          <div class="analysis-panel__bg-wrap" aria-hidden="true">
            <!-- 蓝色渐变 SVG Tab 形状，切换时水平翻转 -->
            <div
              class="analysis-panel__bg-tab"
              :class="{ 'analysis-panel__bg-tab--flipped': activeAnalysisTab === 'lineup' }"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                height="100%"
                viewBox="0 0 1350 202"
                fill="none"
                preserveAspectRatio="none"
              >
                <!-- 白色底 path（Tab 形状） -->
                <path
                  d="M0 10C0 4.47715 4.47715 0 10 0H650.551C653.948 0 657.112 1.72432 658.954 4.57863L693.049 57.4238C694.889 60.2759 698.05 61.9999 701.444 62.0025L1340.01 62.4906C1345.53 62.4949 1350 66.9708 1350 72.4906V192C1350 197.523 1345.52 202 1340 202H10C4.47718 202 0 197.523 0 192L0 10Z"
                  fill="#ffffff"
                />
                <!-- 蓝色渐变叠层（同形） -->
                <path
                  d="M0 10C0 4.47715 4.47715 0 10 0H650.551C653.948 0 657.112 1.72432 658.954 4.57863L693.049 57.4238C694.889 60.2759 698.05 61.9999 701.444 62.0025L1340.01 62.4906C1345.53 62.4949 1350 66.9708 1350 72.4906V192C1350 197.523 1345.52 202 1340 202H10C4.47718 202 0 197.523 0 192L0 10Z"
                  fill="url(#panel-tab-grad)"
                />
                <defs>
                  <linearGradient
                    id="panel-tab-grad"
                    x1="703.5"
                    y1="0"
                    x2="703.5"
                    y2="202"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%"   stop-color="#346BFA" stop-opacity="0.10" />
                    <stop offset="25%"  stop-color="#346BFA" stop-opacity="0.068" />
                    <stop offset="50%"  stop-color="#346BFA" stop-opacity="0.038" />
                    <stop offset="75%"  stop-color="#346BFA" stop-opacity="0.013" />
                    <stop offset="100%" stop-color="#346BFA" stop-opacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          <div class="analysis-panel__body">
            <div class="analysis-panel__tabs" role="tablist">
            <button
              type="button"
              class="analysis-panel__tab"
              :class="{ 'analysis-panel__tab--active': activeAnalysisTab === 'overview' }"
              role="tab"
              :aria-selected="activeAnalysisTab === 'overview'"
              :tabindex="activeAnalysisTab === 'overview' ? 0 : -1"
              @click="setAnalysisTab('overview')"
              @keydown="onAnalysisTabKeydown($event, 'overview')"
            >
              <span
                class="analysis-panel__tab-title"
                aria-hidden="true"
                v-html="tabTitleOverviewSvg"
              />
              <span class="analysis-panel__tab-suffix" aria-hidden="true">
                <img
                  :src="activeAnalysisTab === 'overview' ? tab2ActiveUrl : tab2InactiveUrl"
                  class="analysis-panel__tab-suffix-img"
                  width="30"
                  height="30"
                  alt=""
                />
              </span>
            </button>
            <button
              type="button"
              class="analysis-panel__tab"
              :class="{ 'analysis-panel__tab--active': activeAnalysisTab === 'lineup' }"
              role="tab"
              :aria-selected="activeAnalysisTab === 'lineup'"
              :tabindex="activeAnalysisTab === 'lineup' ? 0 : -1"
              @click="setAnalysisTab('lineup')"
              @keydown="onAnalysisTabKeydown($event, 'lineup')"
            >
              <span
                class="analysis-panel__tab-title"
                aria-hidden="true"
                v-html="tabTitleLineupSvg"
              />
              <span class="analysis-panel__tab-suffix" aria-hidden="true">
                <img
                  :src="activeAnalysisTab === 'lineup' ? tab1ActiveUrl : tab1InactiveUrl"
                  class="analysis-panel__tab-suffix-img"
                  width="30"
                  height="30"
                  alt=""
                />
              </span>
            </button>
            </div>

            <div class="analysis-panel__sheet">
              <div class="analysis-panel__filters">
                <div class="analysis-panel__version-row">
                  <a-select
                    v-model:value="versionA"
                    class="analysis-panel__version-select"
                    :options="versionSelectOptions"
                  />
                  <span class="analysis-panel__vs" aria-hidden="true">VS</span>
                  <a-select
                    v-model:value="versionB"
                    class="analysis-panel__version-select"
                    :options="versionSelectOptions"
                  />
                  <a-checkbox v-model:checked="showH2Only" class="analysis-panel__h2-checkbox">
                    仅查看下半年数据
                  </a-checkbox>
                </div>
                <a-segmented
                  v-model:value="currency"
                  class="analysis-panel__currency"
                  :options="CURRENCY_OPTIONS"
                />
              </div>

              <!-- 总览经营：品类选择器 -->
              <div
                v-if="activeAnalysisTab === 'overview'"
                class="analysis-panel__categories"
                role="group"
                aria-label="一级品类"
              >
                <button
                  v-for="(chip, index) in CATEGORY_CHIPS"
                  :id="`category-chip-${chip.slug}`"
                  :key="chip.slug"
                  type="button"
                  class="analysis-panel__category-chip"
                  :class="{
                    'analysis-panel__category-chip--active': isCategoryActive(chip.slug),
                    'analysis-panel__category-chip--text-only': chip.slug === 'all',
                  }"
                  :role="chip.slug === 'all' ? 'button' : 'checkbox'"
                  :aria-checked="chip.slug !== 'all' ? isCategoryActive(chip.slug) : undefined"
                  :tabindex="index === 0 || isCategoryActive(chip.slug) ? 0 : -1"
                  @click="selectCategory(chip.slug)"
                  @keydown="onCategoryKeydown($event, index)"
                >
                  <span v-if="chip.slug !== 'all'" class="analysis-panel__category-icon" aria-hidden="true">
                    <img
                      v-if="CATEGORY_ICON_MAP[chip.slug]"
                      :src="CATEGORY_ICON_MAP[chip.slug]"
                      class="analysis-panel__category-icon-inner"
                      width="36"
                      height="36"
                      alt=""
                    />
                    <AppstoreOutlined v-else class="analysis-panel__category-icon-inner" />
                  </span>
                  <span class="analysis-panel__category-label">{{ chip.label }}</span>
                </button>
              </div>

              <!-- 品线经营：地区 + 国家选择器 -->
              <div v-else class="analysis-panel__geo" role="group" aria-label="地区与国家">
                <div class="analysis-panel__geo-row">
                  <span class="analysis-panel__geo-label">地区</span>
                  <div class="analysis-panel__geo-chips">
                    <button
                      v-for="r in LINEUP_REGIONS"
                      :key="r.code"
                      type="button"
                      class="analysis-panel__geo-chip"
                      :class="{ 'analysis-panel__geo-chip--active': activeLineupRegions.includes(r.code) }"
                      @click="toggleRegion(r.code)"
                    >{{ r.label }}</button>
                  </div>
                </div>
                <div class="analysis-panel__geo-row">
                  <span class="analysis-panel__geo-label">国家</span>
                  <div class="analysis-panel__geo-chips">
                    <button
                      v-for="c in LINEUP_COUNTRIES"
                      :key="c.code"
                      type="button"
                      class="analysis-panel__geo-chip"
                      :class="{ 'analysis-panel__geo-chip--active': activeLineupCountries.includes(c.code) }"
                      @click="toggleCountry(c.code)"
                    >
                      <img v-if="c.code && c.code !== 'all'" class="analysis-panel__geo-flag" :src="flagUrl(c.code)" :alt="c.label" />
                      {{ c.label }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div v-show="activeAnalysisTab === 'overview'" class="kpi-cards-grid">
        <div
          v-for="card in kpiCards"
          :key="card.key"
          class="kpi-card"
          :style="{ '--kpi-color': card.color }"
        >
          <div class="kpi-card__head">
            <span class="kpi-card__label">{{ card.label }}</span>
          </div>
          <div class="kpi-card__main-row">
            <span class="kpi-card__main" :style="{ color: card.color }">
              <template v-if="card.isMoney">{{ card.currencySymbol }}</template>{{ card.mainText }}
            </span>
            <span
              class="kpi-card__diff"
              :class="card.diffPositive ? 'kpi-card__diff--up' : 'kpi-card__diff--down'"
            >{{ card.diffText }}</span>
          </div>
          <div class="kpi-card__base">
            <template v-if="card.isMoney">{{ card.currencySymbol }}</template>{{ card.baseText }}
          </div>
        </div>
      </div>

      <div class="country-kpi-table">
        <div
          class="country-kpi-table__title"
          :style="activeAnalysisTab === 'lineup' ? { marginBottom: '0px' } : {}"
        >
          {{ activeAnalysisTab === 'lineup' ? '品线经营指标' : '各国2026 - 经营指标' }}
        </div>

        <!-- 总览 tab：各国经营指标 -->
        <a-table
          v-if="activeAnalysisTab !== 'lineup'"
          :columns="countryColumns"
          :data-source="countryRows"
          :pagination="false"
          :sticky="{ offsetHeader: 0 }"
          row-key="code"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'country'">
              <div class="data-cell">
                <span class="country-cell">
                  <img class="country-cell__flag" :src="flagUrl(record.code)" :alt="record.code" />
                  <span class="country-cell__code">{{ record.code }}</span>
                </span>
                <span class="data-cell__spacer" aria-hidden="true" />
                <span class="data-cell__spacer" aria-hidden="true" />
              </div>
            </template>

            <template v-else-if="['sales', 'revenue', 'profit'].includes(String(column.key))">
              <div class="money-cell">
                <div class="money-cell__main">{{ formatMoney(record[column.key].main) }}</div>
                <div class="money-cell__base">{{ formatMoney(record[column.key].base) }}</div>
                <span
                  class="diff-pill"
                  :class="record[column.key].diffPct >= 0 ? 'diff-pill--up' : 'diff-pill--down'"
                >{{ formatRowDiff(record[column.key].diffPct) }}</span>
              </div>
            </template>

            <template v-else-if="column.key === 'profitRate'">
              <div class="pct-cell">
                <div class="pct-cell__main">{{ record.profitRate.main.toFixed(2) }}%</div>
                <div class="pct-cell__base">{{ record.profitRate.base.toFixed(2) }}%</div>
                <span class="data-cell__spacer" aria-hidden="true" />
              </div>
            </template>

            <template v-else-if="column.key === 'adsRate'">
              <div class="pct-cell">
                <div class="pct-cell__main">{{ record.adsRate.main.toFixed(2) }}%</div>
                <div class="pct-cell__base">{{ record.adsRate.base.toFixed(2) }}%</div>
                <div class="pct-cell__money">{{ formatMoney(record.adsRate.adsMoney) }}</div>
              </div>
            </template>
          </template>
        </a-table>

        <!-- 品线经营 tab：品线经营指标 -->
        <div v-else class="lineup-table-wrap">
        <a-table
          class="lineup-table"
          :columns="lineupTableColumns"
          :data-source="lineupRows"
          :pagination="false"
          :scroll="{ x: 'max-content' }"
          :sticky="{ offsetHeader: 0 }"
          row-key="key"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <!-- 品线名称 -->
            <template v-if="column.key === 'nameEn'">
              <div class="lineup-name-cell">
                <span class="lineup-name-cell__name">{{ record.nameEn }}</span>
              </div>
            </template>

            <!-- 战略目标 tags -->
            <template v-else-if="column.key === 'targets'">
              <div class="lineup-targets-cell">
                <template v-if="showTargets && record.targets.length > 0">
                  <span
                    v-for="tag in record.targets"
                    :key="tag"
                    class="lineup-target-tag"
                    :style="TARGET_TAG_STYLE[tag] || ''"
                  >{{ tag }}</span>
                </template>
                <span v-else class="lineup-targets-cell__dash">—</span>
              </div>
            </template>

            <!-- Market Share -->
            <template v-else-if="column.key === 'ms'">
              <div class="pct-cell">
                <div class="pct-cell__main">{{ record.ms.v2 != null ? record.ms.v2.toFixed(2) + '%' : '—' }}</div>
                <div class="pct-cell__base">{{ record.ms.v1 != null ? record.ms.v1.toFixed(2) + '%' : '—' }}</div>
                <span class="data-cell__spacer" aria-hidden="true" />
              </div>
            </template>

            <!-- Sales / Revenue / Profit（金额 + diff pill）-->
            <template v-else-if="['sales', 'revenue', 'profit'].includes(String(column.key))">
              <div class="money-cell">
                <div class="money-cell__main">{{ formatMoney(record[column.key].v2) }}</div>
                <div class="money-cell__base">{{ record[column.key].v1 === 0 ? '—' : formatMoney(record[column.key].v1) }}</div>
                <span
                  v-if="record[column.key].v1 !== 0"
                  class="diff-pill"
                  :class="record[column.key].diff >= 0 ? 'diff-pill--up' : 'diff-pill--down'"
                >{{ formatRowDiff(record[column.key].diff) }}</span>
                <span v-else class="data-cell__spacer" aria-hidden="true" />
              </div>
            </template>

            <!-- Profit % / Ads % / Promo %（百分比 + diff pill）-->
            <template v-else-if="['profitPct', 'adsPct', 'promoPct'].includes(String(column.key))">
              <div class="pct-cell">
                <div class="pct-cell__main">{{ record[column.key].v2.toFixed(2) }}%</div>
                <div class="pct-cell__base">{{ record[column.key].v1 === 0 ? '—' : record[column.key].v1.toFixed(2) + '%' }}</div>
                <span
                  v-if="record[column.key].v1 !== 0"
                  class="diff-pill"
                  :class="record[column.key].diff >= 0 ? 'diff-pill--up' : 'diff-pill--down'"
                >{{ formatRowDiff(record[column.key].diff) }}</span>
                <span v-else class="data-cell__spacer" aria-hidden="true" />
              </div>
            </template>

            <!-- MC% / 采购% / 头程% / 关税% / 仓促费% / US关税分解（双行，无 diff）-->
            <template v-else-if="['mc', 'cogs', 'freight', 'tariff', 'storage', 'basicTariff', 's301', 'equalTariff', 'steelAluTariff'].includes(String(column.key))">
              <div class="pct-cell">
                <div class="pct-cell__main">{{ record[column.key].v2.toFixed(2) }}%</div>
                <div class="pct-cell__base">{{ record[column.key].v1 === 0 ? '—' : record[column.key].v1.toFixed(2) + '%' }}</div>
                <span class="data-cell__spacer" aria-hidden="true" />
              </div>
            </template>

            <!-- CSA -->
            <template v-else-if="column.key === 'csa'">
              <div class="money-cell">
                <div class="money-cell__main">{{ record.csa != null && record.csa !== 0 ? formatMoney(record.csa) : '0' }}</div>
                <span class="data-cell__spacer" aria-hidden="true" />
                <span class="data-cell__spacer" aria-hidden="true" />
              </div>
            </template>
          </template>

          <template #summary>
            <a-table-summary fixed="top">
              <a-table-summary-row class="lineup-total-row">
                <a-table-summary-cell :index="0" fixed="left">
                  <div class="lineup-name-cell"><span class="lineup-name-cell__name">Total</span></div>
                </a-table-summary-cell>
                <a-table-summary-cell :index="1"><span class="lineup-targets-cell__dash">—</span></a-table-summary-cell>
                <a-table-summary-cell :index="2">
                  <div class="pct-cell">
                    <div class="pct-cell__main">—</div>
                    <div class="pct-cell__base">—</div>
                  </div>
                </a-table-summary-cell>
                <a-table-summary-cell v-for="(key, i) in (['sales','revenue','profit'] as const)" :key="key" :index="3+i">
                  <div class="money-cell">
                    <div class="money-cell__main">{{ formatMoney(lineupRowsTotal[key].v2) }}</div>
                    <div class="money-cell__base">{{ formatMoney(lineupRowsTotal[key].v1) }}</div>
                    <span class="diff-pill" :class="lineupRowsTotal[key].diff >= 0 ? 'diff-pill--up' : 'diff-pill--down'">{{ formatRowDiff(lineupRowsTotal[key].diff) }}</span>
                  </div>
                </a-table-summary-cell>
                <a-table-summary-cell v-for="(key, i) in (['profitPct','adsPct','promoPct'] as const)" :key="key" :index="6+i">
                  <div class="pct-cell">
                    <div class="pct-cell__main">{{ lineupRowsTotal[key].v2.toFixed(2) }}%</div>
                    <div class="pct-cell__base">{{ lineupRowsTotal[key].v1.toFixed(2) }}%</div>
                    <span class="diff-pill" :class="lineupRowsTotal[key].diff >= 0 ? 'diff-pill--up' : 'diff-pill--down'">{{ formatRowDiff(lineupRowsTotal[key].diff) }}</span>
                  </div>
                </a-table-summary-cell>
                <a-table-summary-cell v-for="(key, i) in (['mc','cogs','freight','tariff'] as const)" :key="key" :index="9+i">
                  <div class="pct-cell">
                    <div class="pct-cell__main">{{ lineupRowsTotal[key].v2.toFixed(2) }}%</div>
                    <div class="pct-cell__base">{{ lineupRowsTotal[key].v1.toFixed(2) }}%</div>
                  </div>
                </a-table-summary-cell>
                <template v-if="isUSOnly">
                  <a-table-summary-cell v-for="(key, i) in (['basicTariff', 's301', 'equalTariff', 'steelAluTariff'] as const)" :key="key" :index="13 + i">
                    <div class="pct-cell">
                      <div class="pct-cell__main">{{ lineupRowsTotal[key].v2.toFixed(2) }}%</div>
                      <div class="pct-cell__base">{{ lineupRowsTotal[key].v1 === 0 ? '—' : lineupRowsTotal[key].v1.toFixed(2) + '%' }}</div>
                    </div>
                  </a-table-summary-cell>
                </template>
                <a-table-summary-cell :index="13 + usOffset">
                  <div class="pct-cell">
                    <div class="pct-cell__main">{{ lineupRowsTotal.storage.v2.toFixed(2) }}%</div>
                    <div class="pct-cell__base">{{ lineupRowsTotal.storage.v1.toFixed(2) }}%</div>
                  </div>
                </a-table-summary-cell>
                <a-table-summary-cell :index="14 + usOffset">
                  <div class="money-cell">
                    <div class="money-cell__main">{{ lineupRowsTotal.csa ? formatMoney(lineupRowsTotal.csa) : '0' }}</div>
                  </div>
                </a-table-summary-cell>
              </a-table-summary-row>
            </a-table-summary>
          </template>

        </a-table>
        </div>
      </div>

      <div v-show="activeAnalysisTab === 'overview'" class="profit-breakdown">
        <div class="profit-breakdown__head">
          <div class="profit-breakdown__title">
            利润贡献与拆解（净利润增量 vs {{ versionB }}）
          </div>
          <a-segmented
            v-model:value="breakdownMetric"
            :options="[
              { label: '净收入', value: 'net-revenue' },
              { label: '净毛利', value: 'net-profit' },
            ]"
          />
        </div>

        <div ref="profitBreakdownBodyRef" class="profit-breakdown__body">
          <ol class="bar-list">
            <li v-for="(it, idx) in profitBreakdown" :key="it.code" class="bar-list__item">
              <span class="bar-list__index">{{ idx + 1 }}.</span>
              <span class="bar-list__country">
                <img class="bar-list__flag" :src="flagUrl(it.code)" :alt="it.code" />
                <span class="bar-list__code">{{ it.code }}</span>
              </span>
              <div class="bar-list__track">
                <div class="bar-list__fill" :style="{ width: `${it.pctV2}%` }" />
              </div>
              <span class="bar-list__pct">{{ it.pctV2.toFixed(2) }}%</span>
              <span class="bar-list__delta">
                ({{ versionB }}: {{ it.pctV1.toFixed(2) }}%
                <span v-if="it.trend === 'up'" v-html="arrowUpSvg" class="bar-list__arrow" />
                <span v-else v-html="arrowDownSvg" class="bar-list__arrow" />)
              </span>
            </li>
          </ol>

          <div ref="breakdownPieRef" class="profit-breakdown__pie" />
        </div>
      </div>

      <div v-show="activeAnalysisTab === 'overview'" class="dimension-analysis">
        <div class="dimension-analysis__head">
          <div class="dimension-analysis__title">维度分析</div>
          <a-segmented
            v-model:value="dimensionAxis"
            :options="[
              { label: 'BY 国家', value: 'by-country' },
              { label: 'BY 品线', value: 'by-lineup' },
            ]"
          />
        </div>

        <div class="dimension-analysis__body">
          <div class="dimension-cards">
            <button
              v-for="card in dimensionLeftCards"
              :key="card.key"
              type="button"
              class="dimension-card"
              :class="{ 'dimension-card--active': dimensionMetric === card.key }"
              :aria-pressed="dimensionMetric === card.key"
              @click="dimensionMetric = card.key"
            >
              <div class="dimension-card__head">
                <span class="dimension-card__label">{{ versionA }} {{ card.label }}</span>
                <span class="dimension-card__dot">{{ card.dotEmoji }}</span>
              </div>
              <div class="dimension-card__main-row">
                <span class="dimension-card__main">{{ card.mainText }}</span>
                <span
                  class="dimension-card__diff"
                  :class="card.diffPositive ? 'dimension-card__diff--up' : 'dimension-card__diff--down'"
                >{{ card.diffText }}</span>
              </div>
              <div class="dimension-card__target">
                <span class="dimension-card__target-label">{{ versionB }}</span>
                <span class="dimension-card__target-value">{{ card.targetText }}</span>
              </div>
            </button>
          </div>

          <div ref="dimensionChartRef" class="dimension-analysis__chart" />
        </div>
      </div>

      <!-- 总结卡片 -->
      <a-row v-show="activeAnalysisTab === 'overview'" :gutter="[16, 16]" class="summary-row">
        <a-col :xs="24" :lg="12">
          <div class="summary-card summary-card--risk">
            <div class="summary-card__head">
              <div class="summary-card__title">风险总结</div>
            </div>
            <div class="summary-card__inner summary-card__inner--risk">
              <div class="summary-card__body">
                <svg class="summary-card__icon" xmlns="http://www.w3.org/2000/svg" width="32" height="30" viewBox="0 0 32 30" fill="none" aria-hidden="true">
                  <path opacity="0.2" d="M31.6202 24.3255L19.7275 2.12796C18.13 -0.709318 13.87 -0.709318 12.45 2.12796L0.379815 24.3255C-0.8627 26.9958 1.08982 30 4.10736 30H27.8926C30.9102 30 32.8627 26.9958 31.6202 24.3255ZM17.2425 24.4924C16.8875 24.8261 16.5325 24.993 16 24.993C15.4675 24.993 15.1125 24.8261 14.7575 24.4924C14.4025 24.1586 14.225 23.8248 14.225 23.3241C14.225 22.8234 14.4025 22.4896 14.7575 22.1558C15.1125 21.822 15.4675 21.6551 16 21.6551C16.5325 21.6551 16.8875 21.822 17.2425 22.1558C17.5975 22.4896 17.775 22.8234 17.775 23.3241C17.775 23.8248 17.5975 24.1586 17.2425 24.4924ZM17.775 19.9861H14.225V8.3032H17.775V19.9861Z" fill="#FF840E"/>
                </svg>
                <div class="summary-card__paragraphs">
                  <p v-for="(line, idx) in riskSummary.lines" :key="idx">{{ line }}</p>
                </div>
              </div>
              <div class="summary-card__meta">
                <span>{{ riskSummary.author }}</span>
                <span>{{ riskSummary.date }}</span>
              </div>
            </div>
          </div>
        </a-col>

        <a-col :xs="24" :lg="12">
          <div class="summary-card summary-card--good">
            <div class="summary-card__head">
              <div class="summary-card__title-row">
                <span class="summary-card__title">经营指标总结</span>
                <a-tag color="success">已达标</a-tag>
              </div>
            </div>
            <div class="summary-card__inner summary-card__inner--good">
              <div class="summary-card__body">
                <svg class="summary-card__quote" width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path opacity="0.2" d="M30 0.305498L29.3195 6.0588C27.656 5.93508 26.3705 6.26502 25.4631 7.04862C24.5558 7.83223 23.9509 8.92515 23.6484 10.3274C23.3459 11.7296 23.2892 13.3175 23.4783 15.0909H30V30H17.4669V13.8536C17.4669 8.98701 18.5255 5.31644 20.6427 2.8419C22.7977 0.326121 25.9168 -0.519348 30 0.305498ZM12.5331 0.305498L11.8526 6.0588C10.189 5.93508 8.90359 6.26502 7.99622 7.04862C7.08885 7.83223 6.48393 8.92515 6.18148 10.3274C5.87902 11.7296 5.82231 13.3175 6.01134 15.0909H12.5331V30H0V13.8536C0 8.98701 1.0586 5.31644 3.1758 2.8419C5.33081 0.326121 8.44991 -0.519348 12.5331 0.305498Z" fill="#346BFA"/>
                </svg>
                <div class="summary-card__paragraphs">
                  <p v-for="(line, idx) in goodSummary.lines" :key="idx">{{ line }}</p>
                </div>
              </div>
              <div class="summary-card__meta">
                <span>{{ goodSummary.author }}</span>
                <span>{{ goodSummary.date }}</span>
              </div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>
  </ErpAppShell>
</template>

<style scoped>
.analysis-panel {
  position: relative;
  flex-shrink: 0;
  width: 100%;
  min-width: 0;
  margin: 0;
  overflow: visible;
  background: transparent;
  box-sizing: border-box;
}

.analysis-panel__content {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
  overflow: hidden;
  border-radius: var(--radius-card);
  background: transparent;
}

/* bg-wrap 跟随内容高度自动拉伸 */
.analysis-panel__bg-wrap {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

/* Layer 2: 蓝色渐变 SVG Tab 形，宽高均撑满父级 */
.analysis-panel__bg-tab {
  position: absolute;
  inset: 0;
  transform-origin: center top;
  transition: transform 240ms cubic-bezier(0.4, 0, 0.2, 1);
}

.analysis-panel__bg-tab svg {
  display: block;
  width: 100%;
  height: 100%;
}

.analysis-panel__bg-tab--flipped {
  transform: scaleX(-1);
}

.analysis-panel__body {
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base);
  min-width: 0;
  padding: 0 var(--spacing-base) var(--spacing-base);
}

.analysis-panel__sheet {
  box-sizing: border-box;
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base);
  min-width: 0;
}.analysis-panel__tabs {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  min-height: 62px;
  box-sizing: border-box;
  flex-shrink: 0;
  margin: 0;
}

.analysis-panel__tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-tight);
  flex: 0 1 auto;
  min-width: 0;
  max-width: 50%;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  color: var(--color-text-secondary);
}

.analysis-panel__tab--active {
  color: var(--color-text-heading-1);
}

.analysis-panel__tab:not(.analysis-panel__tab--active):hover {
  color: var(--color-text-body);
}

.analysis-panel__tab:focus-visible {
  outline: 2px solid var(--color-primary-focus);
  outline-offset: 2px;
}

.analysis-panel__tab-title {
  flex-shrink: 0;
  line-height: 0;
}

.analysis-panel__tab-title :deep(svg) {
  width: 205px;
  height: 15px;
  display: block;
}

.analysis-panel__tab-suffix {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-small);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.analysis-panel__tab-suffix-img {
  display: block;
  width: 30px;
  height: 30px;
  object-fit: contain;
  transition: filter 200ms, opacity 200ms;
}

.analysis-panel__tab:not(.analysis-panel__tab--active) .analysis-panel__tab-suffix-img {
  filter: grayscale(100%);
  opacity: 0.45;
}

.analysis-panel__filters {
  display: flex;
  align-items: center;
  gap: var(--spacing-loose);
  flex-wrap: wrap;
}

.analysis-panel__version-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.analysis-panel__version-select {
  width: 152px;
  min-width: 152px;
  max-width: 152px;
  flex: 0 0 152px;
}

.analysis-panel__version-select :deep(.ant-select-selector) {
  width: 100%;
  height: var(--control-height-md);
  align-items: center;
}

.analysis-panel__vs {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-semibold);
  line-height: 1;
}

.analysis-panel__h2-checkbox {
  margin-left: 12px;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
}

.analysis-panel__currency {
  flex-shrink: 0;
}

.analysis-panel__categories {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
  overflow-x: auto;
  flex-wrap: nowrap;
  scrollbar-width: none;
}

/* 品线经营 — 地区/国家选择器 */
.analysis-panel__geo {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-tight);
}

.analysis-panel__geo-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-base-tight);
}

.analysis-panel__geo-label {
  font-size: var(--font-size-small);
  line-height: var(--line-height-small);
  color: var(--color-text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
  width: 28px;
}

.analysis-panel__geo-chips {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  flex-wrap: nowrap;
  scrollbar-width: none;
}

.analysis-panel__geo-chips::-webkit-scrollbar { display: none; }

.analysis-panel__geo-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 26px;
  padding: 0 10px;
  border-radius: 30px;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.12);
  font-size: var(--font-size-small);
  line-height: 1;
  color: var(--color-text-body);
  cursor: pointer;
  white-space: nowrap;
  transition: background 140ms, border-color 140ms, color 140ms;
}

.analysis-panel__geo-chip:hover {
  background: rgba(255, 255, 255, 0.2);
}

.analysis-panel__geo-chip--active {
  background: transparent;
  border-color: transparent;
  color: var(--color-brand-6);
  font-weight: var(--font-weight-semibold);
}

.analysis-panel__geo-flag {
  width: 16px;
  height: 12px;
  object-fit: cover;
  border-radius: 1px;
  flex-shrink: 0;
}

.analysis-panel__categories::-webkit-scrollbar {
  display: none;
}

.analysis-panel__category-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-extra-tight);
  padding: 0;
  border-radius: var(--radius-medium);
  cursor: pointer;
  flex-shrink: 0;
  width: 60px;
  border: none;
  background: transparent;
}

.analysis-panel__category-chip--text-only {
  min-height: 60px;
  width: auto;
  justify-content: center;
}

.analysis-panel__category-chip--text-only .analysis-panel__category-label {
  width: auto;
}

.analysis-panel__category-chip:focus-visible {
  outline: 2px solid var(--color-primary-focus);
  outline-offset: 2px;
}

.analysis-panel__category-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gray-6);
}

.analysis-panel__category-icon-inner {
  font-size: 20px;
}

.analysis-panel__category-label {
  width: 60px;
  font-size: var(--font-size-small);
  line-height: var(--line-height-small);
  color: var(--color-gray-7);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.analysis-panel__category-chip--active .analysis-panel__category-label {
  color: var(--color-brand-6);
  font-weight: var(--font-weight-semibold);
}

/* ===================== KPI Cards ===================== */

/* ===================== Country KPI Table ===================== */

.country-kpi-table {
  background: var(--color-white);
  border-radius: var(--radius-card);
  padding: var(--spacing-base);
  display: flex;
  flex-direction: column;
}

.country-kpi-table__title {
  font-size: var(--font-size-h6);
  line-height: var(--line-height-h6);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-heading-1);
  margin-bottom: 16px;
  padding-bottom: 0;
}

.country-kpi-table__title--lineup {
  position: sticky;
  top: 0;
  z-index: 4;
  background: var(--color-white);
  /* 把 card 的 padding-top 纳入 sticky 区域，防止滚动时顶部露白 */
  margin-top: calc(-1 * var(--spacing-base));
  padding-top: var(--spacing-base);
  margin-bottom: 0;
}

/* Total 行主值加粗，次要值（灰色）不加粗 */
.country-kpi-table :deep(.lineup-total-row > td) {
  font-weight: var(--font-weight-semibold);
  background: var(--color-white);
}

.country-kpi-table :deep(.ant-table-summary .money-cell__base),
.country-kpi-table :deep(.ant-table-summary .pct-cell__base) {
  font-weight: var(--font-weight-regular);
}

/* summary 容器与 tbody 之间的分割线统一为 gray-3 */
.country-kpi-table :deep(.ant-table-summary) {
  border-top: none !important;
  box-shadow: none !important;
}
.country-kpi-table :deep(.ant-table-summary table) {
  border-top: none !important;
}
.country-kpi-table :deep(.ant-table-summary tr td) {
  border-bottom: 1px solid var(--color-gray-3) !important;
  vertical-align: top;
  padding: var(--spacing-base);
}

.country-kpi-table :deep(.ant-table) {
  border: none;
}

.lineup-table-wrap {
  padding-top: 8px;
}

.lineup-table :deep(.ant-table-thead > tr > th) {
  white-space: nowrap;
}

.country-kpi-table :deep(.ant-table-header) {
  border-bottom: none !important;
  box-shadow: none !important;
  margin-bottom: 0 !important;
}

.country-kpi-table :deep(.ant-table-thead > tr > th) {
  background: var(--color-white) !important;
  border-bottom: 1px solid var(--color-gray-3) !important;
  height: auto;
  padding: 11px var(--spacing-base) 3px;
  font-size: var(--font-size-regular);
  line-height: var(--line-height-regular);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-heading-2);
  text-align: left;
}

.country-kpi-table :deep(.ant-table-thead > tr > th:last-child::before) {
  display: none;
}

.country-kpi-table :deep(.ant-table-thead > tr > th .ant-table-column-title),
.country-kpi-table :deep(.ant-table-thead > tr > th .ant-table-column-sorters) {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
}

/* ant-design 非 bordered 表格用 border-top 画行分割线，需覆盖默认 token 色 */
.country-kpi-table :deep(.ant-table-tbody > tr > td) {
  vertical-align: top;
  padding: var(--spacing-base);
  border-top: 1px solid var(--color-gray-3) !important;
  border-bottom: transparent !important;
}

.country-kpi-table :deep(.ant-table-tbody > tr:first-child > td) {
  border-top: none !important;
}

/* scroll.x 时 AntD 插入 measure-row 作为 first-child，真实第一行需单独清除 */
.country-kpi-table :deep(.ant-table-tbody > tr.ant-table-measure-row + tr > td) {
  border-top: none !important;
}

.country-kpi-table :deep(.ant-table-tbody > tr:last-child > td) {
  border-bottom: none !important;
}

.country-kpi-table :deep(.ant-table-thead > tr > th:not(:last-child)::before) {
  position: absolute !important;
  top: 50% !important;
  inset-inline-end: 0 !important;
  width: 1px !important;
  height: 1.6em !important;
  background-color: var(--color-gray-3) !important;
  transform: translateY(-50%) !important;
  display: block !important;
}

.data-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.money-cell,
.pct-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.data-cell__spacer {
  display: block;
  height: 22px;
  flex-shrink: 0;
}

.country-cell {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-extra-tight);
  padding: 1px var(--spacing-tight);
  border-radius: 30px;
  background: var(--color-gray-1);
  min-height: 22px;
  font-size: var(--font-size-regular);
  line-height: var(--line-height-regular);
  color: var(--color-text-body);
}

.country-cell__flag {
  width: 16px;
  height: 12px;
  flex-shrink: 0;
  object-fit: cover;
  border-radius: 1px;
}

.country-cell__code {
  font-weight: var(--font-weight-regular);
  color: var(--color-text-body);
}

/* ---------- 品线表格专用样式 ---------- */
.lineup-name-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.lineup-name-cell__name {
  font-size: var(--font-size-regular);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-11);
  line-height: var(--line-height-regular);
}

.lineup-targets-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
}

.lineup-targets-cell__dash {
  color: var(--color-text-quaternary);
  font-size: var(--font-size-regular);
}

.lineup-target-tag {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 1px 8px;
  border-radius: 30px;
  border: none;
  font-size: var(--font-size-small);
  line-height: 1;
  font-weight: var(--font-weight-regular);
  color: var(--color-gray-11);
  flex-shrink: 0;
  white-space: nowrap;
}

/* ---------- 通用 cell 样式 ---------- */
.money-cell__main,
.pct-cell__main {
  font-size: var(--font-size-regular);
  line-height: var(--line-height-regular);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-11);
}

.money-cell__base,
.pct-cell__base,
.pct-cell__money {
  font-size: var(--font-size-regular);
  line-height: var(--line-height-regular);
  color: var(--color-text-secondary);
}

.diff-pill {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 1px 8px;
  border-radius: 30px;
  font-size: var(--font-size-small);
  line-height: 1;
  font-weight: var(--font-weight-regular);
  color: var(--color-gray-11);
  flex-shrink: 0;
}

.diff-pill--up {
  background: #B9EEB4;
}

.diff-pill--down {
  background: var(--color-error-bg);
}

.kpi-cards-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--spacing-base);
  margin: 0;
}

.kpi-card {
  height: 118px;
  padding: var(--spacing-base);
  border-radius: 10px;
  border: 1px solid #E4E6EA;
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--kpi-color) 5%, transparent) 0%,
      transparent 66.85%
    ),
    #fff;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

@media (max-width: 1250px) {
  .kpi-card {
    height: auto;
    min-height: 118px;
    overflow: visible;
  }

  .kpi-card__main {
    width: 100%;
  }
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 4%,
    var(--kpi-color) 51%,
    transparent 96%
  );
}

.kpi-card__head {
  display: flex;
  align-items: center;
}

.kpi-card__label {
  font-size: var(--font-size-regular);
  line-height: var(--line-height-regular);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-11);
}

.kpi-card__main-row {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-tight);
  margin-top: 4px;
  flex-wrap: wrap;
}

.kpi-card__diff {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 1px 8px;
  border-radius: 30px;
  font-size: var(--font-size-small);
  line-height: 1;
  font-weight: var(--font-weight-regular);
  color: var(--color-gray-11);
  flex-shrink: 0;
}

.kpi-card__diff--up {
  background: #B9EEB4;
}

.kpi-card__diff--down {
  background: var(--color-error-bg);
}

.kpi-card__main {
  font-size: 20px;
  line-height: 30px;
  font-weight: var(--font-weight-semibold);
}

.kpi-card__base {
  margin-top: 8px;
  font-size: var(--font-size-regular);
  line-height: var(--line-height-regular);
  color: var(--color-text-secondary);
}

/* ===================== Profit Breakdown ===================== */

.profit-breakdown {
  background: var(--color-white);
  border-radius: var(--radius-card);
  padding: var(--spacing-base);
}

.profit-breakdown__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-base);
}

.profit-breakdown__title {
  font-size: var(--font-size-h6);
  line-height: var(--line-height-h6);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-heading-1);
}

.profit-breakdown__body {
  display: grid;
  grid-template-columns: 6fr 4fr;
  gap: var(--spacing-loose);
  align-items: stretch;
}

.profit-breakdown__pie {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.bar-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base);
}

.bar-list__item {
  display: grid;
  grid-template-columns: 24px auto minmax(0, 1fr) 60px auto;
  align-items: center;
  gap: var(--spacing-tight);
  font-size: var(--font-size-regular);
  line-height: var(--line-height-regular);
  color: var(--color-text-body);
}

.bar-list__index {
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}

.bar-list__country {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 60px;
}

.bar-list__flag {
  width: 16px;
  height: 12px;
  object-fit: cover;
  border-radius: 1px;
  flex-shrink: 0;
}

.bar-list__code {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-heading-2);
}

.bar-list__track {
  height: 8px;
  background: var(--color-bg-page);
  border-radius: var(--radius-tag);
  overflow: hidden;
}

.bar-list__fill {
  height: 100%;
  background: var(--color-brand-6);
  border-radius: var(--radius-tag);
  transition: width 240ms ease-out;
}

.bar-list__pct {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-heading-1);
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.bar-list__delta {
  color: var(--color-text-secondary);
  font-size: var(--font-size-small);
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.bar-list__arrow {
  display: inline-flex;
  align-items: center;
  line-height: 1;
}

/* ===================== Dimension Analysis ===================== */

.dimension-analysis {
  background: var(--color-white);
  border-radius: var(--radius-card);
  padding: var(--spacing-base);
}

.dimension-analysis__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-base);
}

.dimension-analysis__title {
  font-size: var(--font-size-h6);
  line-height: var(--line-height-h6);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-heading-1);
}

.dimension-analysis__body {
  display: grid;
  grid-template-columns: 236px minmax(0, 1fr);
  gap: 16px;
  align-items: stretch;
}

.dimension-cards {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base-tight);
}

.dimension-card {
  text-align: left;
  width: 236px;
  height: 110px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--color-gray-3);
  border-radius: 5px;
  padding: 5px 1px;
  cursor: pointer;
  transition: border-color 160ms, background 160ms;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.dimension-card:hover {
  border-color: var(--color-brand-6);
  background: rgba(52, 107, 250, 0.04);
}

.dimension-card--active {
  border-color: var(--color-brand-6);
  background: rgba(52, 107, 250, 0.06);
}

.dimension-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-base);
}

.dimension-card__label {
  font-size: var(--font-size-regular);
  line-height: var(--line-height-regular);
  font-weight: var(--font-weight-regular);
  color: var(--color-text-secondary);
}

.dimension-card--active .dimension-card__label {
  color: var(--color-brand-6);
}

.dimension-card--active .dimension-card__main {
  color: var(--color-brand-6);
}

.dimension-card__dot {
  font-size: 10px;
  line-height: 1;
  flex-shrink: 0;
}

.dimension-card__main-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: var(--spacing-tight);
  padding: 0 var(--spacing-base);
}

.dimension-card__main {
  font-size: 20px;
  line-height: 30px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-11);
}

.dimension-card__diff {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 1px 8px;
  border-radius: 30px;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-regular);
  color: var(--color-gray-11);
  flex-shrink: 0;
}

.dimension-card__diff--up {
  background: #B9EEB4;
}

.dimension-card__diff--down {
  background: #FFBDBF;
}

.dimension-card__target {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-top: var(--spacing-extra-tight);
  padding: 0 var(--spacing-base);
}

.dimension-card__target-label {
  font-size: var(--font-size-small);
  line-height: 20px;
  font-weight: var(--font-weight-regular);
  color: var(--color-gray-7);
  flex-shrink: 0;
}

.dimension-card__target-value {
  font-size: var(--font-size-regular);
  line-height: var(--line-height-regular);
  font-weight: 400;
  color: var(--color-gray-11);
}

.dimension-analysis__chart {
  width: 100%;
  height: 100%;
  min-height: 360px;
}

.erp-dashboard__scroll {
  flex: 1;
  width: 100%;
  min-width: 0;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base, 16px);
  background: var(--color-bg-page);
}

.erp-dashboard__scroll :deep(.ant-card) {
  background: var(--color-white, #fff);
  border-radius: var(--radius-card, 10px);
  box-shadow: none;
  border: none;
}

.erp-dashboard__scroll :deep(.ant-card .ant-card-head) {
  border-bottom: none;
}

.erp-dashboard__scroll :deep(.ant-card .ant-card-body) {
  border-radius: inherit;
}

/* 总结卡片 */
.summary-row {
  width: 100%;
}

.summary-card {
  position: relative;
  border-radius: var(--radius-card);
  padding: var(--spacing-base);
  border: none;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-tight);
}

.summary-card__inner {
  flex: 1;
  border-radius: 5px;
  padding: var(--spacing-tight) 16px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-tight);
}

.summary-card__inner--risk {
  background: var(--color-orange-1);
  border: 1px solid var(--color-orange-2);
}

.summary-card__inner--good {
  background: rgba(52, 107, 250, 0.06);
  border: 1px solid rgba(52, 107, 250, 0.10);
  border-radius: 10px;
}

.summary-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.summary-card__title-row {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-tight);
}

.summary-card__title {
  font-size: var(--font-size-h6);
  line-height: var(--line-height-h6);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-heading-1);
}

.summary-card__title-row :deep(.ant-tag) {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 1px 8px;
  margin: 0;
  border-radius: 30px;
  font-size: var(--font-size-small);
  line-height: 1;
  font-weight: var(--font-weight-regular);
  color: var(--color-gray-11);
  background: #B9EEB4;
  border: none;
}

.summary-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-tight);
}

.summary-card__icon {
  flex-shrink: 0;
  display: block;
}

.summary-card__quote {
  flex-shrink: 0;
  display: block;
}

.summary-card__paragraphs {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base-tight);
  font-size: var(--font-size-regular);
  line-height: var(--line-height-regular);
  color: var(--color-text-body);
}

.summary-card__paragraphs p {
  margin: 0;
}

.summary-card__meta {
  align-self: flex-end;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}
</style>
