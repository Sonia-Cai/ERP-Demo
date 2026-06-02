export type CurrencyKey = 'origin' | 'usd'
export type VersionKey = '2026V3' | '2026V2' | '2026V1' | '2025V2' | '2025V1'

export type KpiMetric = {
  sales: number
  revenue: number
  profit: number
  profitRate: number
  adsRate: number
}

export const USD_RATE = 0.14

// ---------------------------------------------------------------
// 显式数据（'all' × 2026V2 / 2026V1，以及 5 个代表性品类）
// ---------------------------------------------------------------

type ExplicitData = Partial<Record<string, Partial<Record<VersionKey, KpiMetric>>>>

const EXPLICIT: ExplicitData = {
  all: {
    '2026V2': { sales: 7097102, revenue: 420969461, profit: 49266567, profitRate: 11.70, adsRate: 15.70 },
    '2026V1': { sales: 5388745, revenue: 325136261, profit: 48129216, profitRate: 14.80, adsRate: 12.31 },
  },
  heater: {
    '2026V2': { sales: 1820000,  revenue: 95000000,  profit: 11400000, profitRate: 12.00, adsRate: 14.20 },
    '2026V1': { sales: 2100000,  revenue: 106000000, profit: 14800000, profitRate: 13.96, adsRate: 11.80 },
  },
  'tower-fan': {
    '2026V2': { sales: 1050000,  revenue: 68000000,  profit: 6800000,  profitRate: 10.00, adsRate: 18.50 },
    '2026V1': { sales:  890000,  revenue: 57000000,  profit: 5980000,  profitRate: 10.49, adsRate: 15.30 },
  },
  'standing-fan': {
    '2026V2': { sales:  740000,  revenue: 44200000,  profit: 5310000,  profitRate: 12.01, adsRate: 17.20 },
    '2026V1': { sales:  690000,  revenue: 40500000,  profit: 4900000,  profitRate: 12.10, adsRate: 16.40 },
  },
  humidifier: {
    '2026V2': { sales:  620000,  revenue: 39800000,  profit: 3980000,  profitRate: 10.00, adsRate: 19.80 },
    '2026V1': { sales:  530000,  revenue: 32600000,  profit: 3910000,  profitRate: 11.99, adsRate: 16.50 },
  },
  'air-conditioner': {
    '2026V2': { sales:  480000,  revenue: 76000000,  profit: 5700000,  profitRate: 7.50,  adsRate: 22.10 },
    '2026V1': { sales:  420000,  revenue: 62500000,  profit: 6250000,  profitRate: 10.00, adsRate: 18.90 },
  },
}

// ---------------------------------------------------------------
// 'all' × 2026V2 作为派生基线
// ---------------------------------------------------------------

const ALL_BASELINE = EXPLICIT['all']!['2026V2']!

/**
 * 确定性扰动派生（同输入同输出，不用 Math.random）
 * factor ∈ [0.92, 1.08]
 */
function deriveMetric(slug: string, version: VersionKey): KpiMetric {
  const seed = slug.length * 31 + version.charCodeAt(0)
  const factor = 1 + ((seed % 17) - 8) / 100
  return {
    sales:      Math.round(ALL_BASELINE.sales      * factor),
    revenue:    Math.round(ALL_BASELINE.revenue    * factor),
    profit:     Math.round(ALL_BASELINE.profit     * factor),
    profitRate: parseFloat((ALL_BASELINE.profitRate * factor).toFixed(2)),
    adsRate:    parseFloat((ALL_BASELINE.adsRate    * factor).toFixed(2)),
  }
}

// ---------------------------------------------------------------
// 对外接口：getKpiMetric(slug, version) → KpiMetric
// ---------------------------------------------------------------

export function getKpiMetric(slug: string, version: VersionKey): KpiMetric {
  const byCat = EXPLICIT[slug]
  if (byCat) {
    const hit = byCat[version]
    if (hit) return hit
  }
  const allData = EXPLICIT['all']![version]
  if (allData) return allData
  return deriveMetric(slug, version)
}

// ---------------------------------------------------------------
// 别名，供 countryRows computed 使用
// ---------------------------------------------------------------

export function getKpiByCategoryVersion(slug: string, version: VersionKey): KpiMetric {
  return getKpiMetric(slug, version)
}

export function applyCurrency(m: KpiMetric, currency: 'origin' | 'usd'): KpiMetric {
  if (currency === 'origin') return m
  return {
    ...m,
    sales:   Math.round(m.sales   * USD_RATE),
    revenue: Math.round(m.revenue * USD_RATE),
    profit:  Math.round(m.profit  * USD_RATE),
  }
}

// ---------------------------------------------------------------
// 国家数据
// ---------------------------------------------------------------

export const COUNTRIES = [
  { code: 'US', flag: '🇺🇸' },
  { code: 'UK', flag: '🇬🇧' },
  { code: 'DE', flag: '🇩🇪' },
  { code: 'FR', flag: '🇫🇷' },
  { code: 'IT', flag: '🇮🇹' },
  { code: 'ES', flag: '🇪🇸' },
  { code: 'CA', flag: '🇨🇦' },
  { code: 'JP', flag: '🇯🇵' },
] as const

/** 各国真实经营数据（2026V2 / 2026V1，品类=all 基准） */
type CountryKpiPair = {
  v2: KpiMetric
  v1: KpiMetric
  adsMoneyV2: number
  adsMoneyV1: number
}

const COUNTRY_KPI_REAL: Record<string, CountryKpiPair> = {
  TOTAL: {
    v2: { sales: 7097102, revenue: 420969461, profit: 49266567, profitRate: 11.70, adsRate: 15.70 },
    v1: { sales: 5388745, revenue: 325136261, profit: 48129216, profitRate: 14.80, adsRate: 12.31 },
    adsMoneyV2: 66112226,
    adsMoneyV1: 40024273,
  },
  US: {
    v2: { sales: 5231931, revenue: 305093963, profit: 25050042, profitRate: 8.21, adsRate: 16.55 },
    v1: { sales: 4306024, revenue: 251350482, profit: 29492386, profitRate: 11.73, adsRate: 13.71 },
    adsMoneyV2: 50486707,
    adsMoneyV1: 34460151,
  },
  UK: {
    v2: { sales: 571083, revenue: 38601017, profit: 8534149, profitRate: 22.11, adsRate: 12.12 },
    v1: { sales: 364065, revenue: 26120422, profit: 7325920, profitRate: 28.05, adsRate: 6.71 },
    adsMoneyV2: 4678114,
    adsMoneyV1: 1752680,
  },
  DE: {
    v2: { sales: 484696, revenue: 32000857, profit: 5861669, profitRate: 18.32, adsRate: 13.47 },
    v1: { sales: 316030, revenue: 20821099, profit: 4853757, profitRate: 23.31, adsRate: 7.50 },
    adsMoneyV2: 4310880,
    adsMoneyV1: 1561582,
  },
  FR: {
    v2: { sales: 154162, revenue: 9950445, profit: 2013713, profitRate: 20.24, adsRate: 12.11 },
    v1: { sales: 80397, revenue: 6094937, profit: 1850763, profitRate: 30.37, adsRate: 4.13 },
    adsMoneyV2: 1205106,
    adsMoneyV1: 251721,
  },
  IT: {
    v2: { sales: 122233, revenue: 7361898, profit: 1398922, profitRate: 19.00, adsRate: 13.21 },
    v1: { sales: 46031, revenue: 3234414, profit: 802812, profitRate: 24.82, adsRate: 7.52 },
    adsMoneyV2: 972384,
    adsMoneyV1: 243228,
  },
  ES: {
    v2: { sales: 123446, revenue: 7660610, profit: 1417789, profitRate: 18.51, adsRate: 13.63 },
    v1: { sales: 47292, revenue: 3311539, profit: 886418, profitRate: 26.77, adsRate: 6.88 },
    adsMoneyV2: 1044480,
    adsMoneyV1: 227834,
  },
  CA: {
    v2: { sales: 374869, revenue: 18749153, profit: 4940859, profitRate: 26.35, adsRate: 17.17 },
    v1: { sales: 191203, revenue: 12394631, profit: 2783318, profitRate: 22.46, adsRate: 10.31 },
    adsMoneyV2: 3219280,
    adsMoneyV1: 1277886,
  },
  JP: {
    v2: { sales: 34682, revenue: 1551518, profit: 49424, profitRate: 3.19, adsRate: 12.59 },
    v1: { sales: 37703, revenue: 1808738, profit: 133842, profitRate: 7.40, adsRate: 13.50 },
    adsMoneyV2: 195275,
    adsMoneyV1: 244180,
  },
}

function scaleCountryMetric(base: KpiMetric, category: string, version: VersionKey): KpiMetric {
  if (category === 'all') return base
  const allM = getKpiByCategoryVersion('all', version)
  const catM = getKpiByCategoryVersion(category, version)
  const ratio = (a: number, b: number) => (b === 0 ? 1 : a / b)
  return {
    sales:      Math.round(base.sales      * ratio(catM.sales, allM.sales)),
    revenue:    Math.round(base.revenue    * ratio(catM.revenue, allM.revenue)),
    profit:     Math.round(base.profit     * ratio(catM.profit, allM.profit)),
    profitRate: +(base.profitRate * ratio(catM.profitRate, allM.profitRate)).toFixed(2),
    adsRate:    +(base.adsRate    * ratio(catM.adsRate, allM.adsRate)).toFixed(2),
  }
}

function resolveCountryPairMetric(
  pair: CountryKpiPair,
  category: string,
  version: VersionKey,
): KpiMetric {
  let raw: KpiMetric
  if (version === '2026V2') raw = pair.v2
  else if (version === '2026V1') raw = pair.v1
  else {
    const allV2 = getKpiByCategoryVersion('all', '2026V2')
    const allVx = getKpiByCategoryVersion('all', version)
    const base = scaleCountryMetric(pair.v2, category, '2026V2')
    const r = (a: number, b: number) => (b === 0 ? 1 : a / b)
    raw = {
      sales:      Math.round(base.sales      * r(allVx.sales, allV2.sales)),
      revenue:    Math.round(base.revenue    * r(allVx.revenue, allV2.revenue)),
      profit:     Math.round(base.profit     * r(allVx.profit, allV2.profit)),
      profitRate: +(base.profitRate * r(allVx.profitRate, allV2.profitRate)).toFixed(2),
      adsRate:    +(base.adsRate    * r(allVx.adsRate, allV2.adsRate)).toFixed(2),
    }
  }
  return scaleCountryMetric(raw, category, version)
}

export function getCountryKpi(
  country: string,
  category: string,
  version: VersionKey,
): KpiMetric {
  const pair = COUNTRY_KPI_REAL[country]
  if (!pair) return getKpiByCategoryVersion(category, version)
  return resolveCountryPairMetric(pair, category, version)
}

export function getCountryAdsMoney(
  country: string,
  category: string,
  version: VersionKey,
): number {
  const pair = COUNTRY_KPI_REAL[country]
  if (!pair) {
    const m = getCountryKpi(country, category, version)
    return Math.round((m.revenue * m.adsRate) / 100)
  }
  let rawMoney: number
  if (version === '2026V2') rawMoney = pair.adsMoneyV2
  else if (version === '2026V1') rawMoney = pair.adsMoneyV1
  else {
    const allV2 = getKpiByCategoryVersion('all', '2026V2')
    const allVx = getKpiByCategoryVersion('all', version)
    const ratio = allV2.revenue === 0 ? 1 : allVx.revenue / allV2.revenue
    rawMoney = Math.round(pair.adsMoneyV2 * ratio)
  }
  if (category === 'all') return rawMoney
  const allM = getKpiByCategoryVersion('all', version)
  const catM = getKpiByCategoryVersion(category, version)
  const ratio = allM.revenue === 0 ? 1 : catM.revenue / allM.revenue
  return Math.round(rawMoney * ratio)
}

export const CATEGORIES = [
  { slug: 'all',                 label: '全部' },
  { slug: 'heater',              label: '取暖器' },
  { slug: 'tower-fan',           label: '塔扇' },
  { slug: 'standing-fan',        label: '落地扇' },
  { slug: 'humidifier',          label: '加湿器' },
  { slug: 'air-conditioner',     label: '空调' },
  { slug: 'ceiling-fan',         label: '吊扇' },
  { slug: 'cooling-fan',         label: '冷风扇' },
  { slug: 'air-circulator',      label: '空气循环扇' },
  { slug: 'milk-frother',        label: '奶泡机' },
  { slug: 'air-purifier',        label: '空气净化器' },
  { slug: 'water-purifier',      label: '净水器' },
  { slug: 'dehumidifier',        label: '除湿机' },
  { slug: 'appliance-accessory', label: '家电配件' },
  { slug: 'kitchen-accessory',   label: '厨房配件' },
  { slug: 'smart-kitchen',       label: '智能厨电' },
] as const

export function slugToTitleCase(slug: string): string {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export const COUNTRY_HEX: Record<string, string> = {
  US: '#346BFA',
  UK: '#00C2FF',
  DE: '#00F4B4',
  FR: '#FFC000',
  IT: '#FF840E',
  ES: '#0DAA07',
  CA: '#5F34FA',
  JP: '#FF0E53',
}
