<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import chevronUpLinearUrl from '@/assets/nav/chevron-up-linear.svg?url'
import collapseLeftUrl from '@/assets/nav/collapse-left.svg?url'
import logoMarkUrl from '@/assets/brand/logo-mark.svg?url'
import logoWanwuUrl from '@/assets/brand/logo-wanwu.svg?url'
import { getNavSubTree } from '@/data/navSubTree'
import { erpColor } from '@/theme/erpAntdTheme'

/** 与 `public/nav/{目录}/未选中.svg|选中.svg` 一致；「供应商协同」使用 `供应商` 目录资源 */
const NAV_ITEMS = [
  { key: 'common', label: '常用', dir: '常用' },
  { key: 'order', label: '订单', dir: '订单' },
  { key: 'purchase', label: '采购', dir: '采购' },
  { key: 'delivery', label: '交付', dir: '交付' },
  { key: 'inventory', label: '库存', dir: '库存' },
  { key: 'product', label: '产品', dir: '产品' },
  { key: 'operations', label: '运营', dir: '运营' },
  { key: 'quality', label: '品质', dir: '品质' },
  { key: 'supplier', label: '供应商协同', dir: '供应商' },
  { key: 'logistics', label: '物流', dir: '物流' },
  { key: 'finance', label: '财务', dir: '财务' },
  { key: 'master', label: '基础数据', dir: '基础数据' },
] as const

defineProps<{
  activeKey?: string
}>()

const emit = defineEmits<{
  navClick: [key: string]
  thirdNavClick: [firstKey: string, secondId: string, thirdId: string, thirdLabel: string]
}>()

/** 当前展开二三级的一级 key；与一级选中可独立（再次点击同一项可收起） */
const panelOpenFor = ref<string | null>(null)
/** 不默认选中；仅用户点击三级后赋值 */
const selectedThirdId = ref<string | null>(null)

const flyoutSections = computed(() => {
  const k = panelOpenFor.value
  return k ? getNavSubTree(k) : []
})

/** 展开的二级分组 id；切换一级或树变化时默认展开前两组 */
const expandedSecIds = ref<Set<string>>(new Set())

watch(
  flyoutSections,
  (sections) => {
    const next = new Set<string>()
    sections.slice(0, 2).forEach((s) => next.add(s.id))
    expandedSecIds.value = next
  },
  { immediate: true },
)

function isSecExpanded(secId: string): boolean {
  return expandedSecIds.value.has(secId)
}

function toggleSecExpanded(secId: string) {
  const next = new Set(expandedSecIds.value)
  if (next.has(secId)) next.delete(secId)
  else next.add(secId)
  expandedSecIds.value = next
}

/** 当前展开面板对应的一级导航名称（如「运营」） */
const flyoutFirstLabel = computed(() => {
  const k = panelOpenFor.value
  if (!k) return ''
  return NAV_ITEMS.find((x) => x.key === k)?.label ?? ''
})

function closeFlyout() {
  panelOpenFor.value = null
  selectedThirdId.value = null
}

/** 点击一级：展开二三级；收起仅通过顶栏收缩 icon */
function onFirstLevelClick(key: string) {
  emit('navClick', key)
  panelOpenFor.value = key
  selectedThirdId.value = null
}

function onThirdClick(secondId: string, thirdId: string, thirdLabel: string) {
  const fk = panelOpenFor.value
  if (!fk) return
  selectedThirdId.value = thirdId
  emit('thirdNavClick', fk, secondId, thirdId, thirdLabel)
}

function navSvgUrl(dir: string, active: boolean): string {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/')
  const file = active ? '选中' : '未选中'
  return `${base}nav/${dir}/${file}.svg`
}

/** Hover 时仍用未选中 SVG 作 mask，避免换图；url 用 JSON.stringify 转义 */
function inactiveHoverMaskStyle(dir: string): Record<string, string> {
  const u = navSvgUrl(dir, false)
  const quoted = `url(${JSON.stringify(u)})`
  return {
    WebkitMaskImage: quoted,
    maskImage: quoted,
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
  }
}
</script>

<template>
  <div class="app-nav-cluster">
    <aside class="app-nav-rail" aria-label="一级导航">
      <div class="app-nav-rail__logo">
        <img class="app-nav-rail__logo-mark" :src="logoMarkUrl" width="32" height="32" alt="" />
        <img class="app-nav-rail__logo-word" :src="logoWanwuUrl" width="32" height="24" alt="万物" />
      </div>

      <nav class="app-nav-rail__nav">
        <button
          v-for="it in NAV_ITEMS"
          :key="it.key"
          type="button"
          class="app-nav-rail__item"
          :class="{ 'app-nav-rail__item--active': activeKey === it.key }"
          :aria-current="activeKey === it.key ? 'page' : undefined"
          :aria-expanded="panelOpenFor === it.key"
          :title="it.label"
          @click="onFirstLevelClick(it.key)"
        >
        <template v-if="activeKey === it.key">
          <img
            class="app-nav-rail__icon"
            :src="navSvgUrl(it.dir, true)"
            width="20"
            height="20"
            alt=""
          />
        </template>
        <span v-else class="app-nav-rail__icon-stack" aria-hidden="true">
          <img
            class="app-nav-rail__icon app-nav-rail__icon--inactive-img"
            :src="navSvgUrl(it.dir, false)"
            width="20"
            height="20"
            alt=""
          />
          <span
            class="app-nav-rail__icon app-nav-rail__icon--inactive-hoverfill"
            :style="{
              ...inactiveHoverMaskStyle(it.dir),
              backgroundColor: erpColor.primary,
            }"
          />
        </span>
        <span class="app-nav-rail__label">{{ it.label }}</span>
      </button>
    </nav>
  </aside>

    <aside
      v-if="panelOpenFor"
      class="app-nav-flyout"
      aria-label="二三级导航"
    >
      <header class="app-nav-flyout__chrome">
        <h2 class="app-nav-flyout__chrome-title">{{ flyoutFirstLabel }}</h2>
        <a-tooltip title="收起导航" placement="bottom">
          <button
            type="button"
            class="app-nav-flyout__collapse"
            aria-label="收起导航"
            @click="closeFlyout"
          >
            <img
              class="app-nav-flyout__collapse-icon"
              :src="collapseLeftUrl"
              width="16"
              height="16"
              alt=""
            />
          </button>
        </a-tooltip>
      </header>
      <div class="app-nav-flyout__inner">
        <section
          v-for="sec in flyoutSections"
          :key="sec.id"
          class="app-nav-flyout__sec"
          :aria-labelledby="`flyout-sec-label-${sec.id}`"
        >
          <button
            type="button"
            class="app-nav-flyout__sec-head"
            :aria-expanded="isSecExpanded(sec.id)"
            :aria-controls="`flyout-third-${sec.id}`"
            @click="toggleSecExpanded(sec.id)"
          >
            <span :id="`flyout-sec-label-${sec.id}`" class="app-nav-flyout__sec-title">{{
              sec.label
            }}</span>
            <img
              class="app-nav-flyout__sec-chevron"
              :class="{ 'app-nav-flyout__sec-chevron--collapsed': !isSecExpanded(sec.id) }"
              :src="chevronUpLinearUrl"
              width="14"
              height="14"
              alt=""
              aria-hidden="true"
            />
          </button>
          <ul
            :id="`flyout-third-${sec.id}`"
            v-show="isSecExpanded(sec.id)"
            class="app-nav-flyout__third-list"
            role="list"
          >
            <li
              v-for="t in sec.children"
              :key="t.id"
              class="app-nav-flyout__third-item"
              :class="{ 'app-nav-flyout__third-item--active': selectedThirdId === t.id }"
              role="listitem"
            >
              <button
                type="button"
                class="app-nav-flyout__third-btn"
                @click="onThirdClick(sec.id, t.id, t.label)"
              >
                {{ t.label }}
              </button>
            </li>
          </ul>
        </section>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.app-nav-cluster {
  display: flex;
  flex-shrink: 0;
  align-items: stretch;
  align-self: stretch;
  min-height: 0;
  max-height: 100%;
}

.app-nav-flyout {
  width: var(--layout-nav-secondary-width, 176px);
  min-width: var(--layout-nav-secondary-width, 176px);
  max-width: var(--layout-nav-secondary-width, 176px);
  flex-shrink: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: var(--color-bg-page);
  min-height: 0;
  align-self: stretch;
  max-height: 100%;
  overflow: hidden;
}

.app-nav-flyout__chrome {
  flex-shrink: 0;
  box-sizing: border-box;
  width: 100%;
  max-width: 176px;
  height: 44px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  padding: 0 12px;
  line-height: var(--line-height-h6);
  color: rgba(50, 59, 75, 1);
}

.app-nav-flyout__chrome-title {
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  box-sizing: border-box;
  max-width: 124px;
  width: 124px;
  min-width: 0;
  font-size: var(--font-size-h6);
  line-height: var(--line-height-h6);
  font-weight: var(--font-weight-semibold, 600);
  color: rgba(50, 59, 75, 1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-nav-flyout__collapse {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: var(--radius-medium);
  background: transparent;
  cursor: pointer;
}

.app-nav-flyout__collapse:hover {
  background: rgba(19, 23, 31, 0.06);
}

.app-nav-flyout__collapse-icon {
  display: block;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  object-fit: contain;
}

.app-nav-flyout__inner {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  /* 行宽与侧栏一致 176px，不在此处加左右内边距 */
  padding: var(--spacing-tight) 0;
}

.app-nav-flyout__sec + .app-nav-flyout__sec {
  margin-top: var(--spacing-tight);
}

.app-nav-flyout__sec-head {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 44px;
  height: 44px;
  margin: 0;
  padding: 0 18px 0 var(--spacing-base-tight);
  border: none;
  background: transparent;
  font: inherit;
  text-align: left;
  cursor: pointer;
  color: inherit;
}

.app-nav-flyout__sec-head:hover {
  background: rgba(19, 23, 31, 0.04);
}

.app-nav-flyout__sec-head:focus {
  outline: none;
}

.app-nav-flyout__sec-head:focus-visible {
  outline: 2px solid var(--color-primary-focus, var(--color-brand-2));
  outline-offset: -2px;
}

.app-nav-flyout__sec-title {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  flex: 0 1 auto;
  min-width: 0;
  max-width: 118px;
  border: none;
  background: none;
  font-size: var(--font-size-regular);
  line-height: var(--line-height-regular);
  font-weight: var(--font-weight-semibold, 600);
  color: rgba(50, 59, 75, 1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
}

.app-nav-flyout__sec-chevron {
  display: block;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  object-fit: contain;
  transition: transform 0.15s ease;
  pointer-events: none;
}

/* 折叠：箭头朝下表示可下拉展开 */
.app-nav-flyout__sec-chevron--collapsed {
  transform: rotate(180deg);
}

.app-nav-flyout__third-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.app-nav-flyout__third-item {
  margin: 0;
}

.app-nav-flyout__third-btn {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  min-height: 44px;
  height: 44px;
  margin: 0;
  padding: 0 var(--spacing-base-tight);
  border: none;
  border-radius: 0;
  background: transparent;
  text-align: left;
  font: inherit;
  font-size: var(--font-size-regular);
  line-height: var(--line-height-regular);
  font-weight: var(--font-weight-regular, 400);
  color: var(--color-gray-7);
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-nav-flyout__third-btn:hover {
  color: var(--color-brand-6);
  font-weight: var(--font-weight-regular, 400);
  background: rgba(19, 23, 31, 0.04);
}

.app-nav-flyout__third-item--active .app-nav-flyout__third-btn {
  color: var(--color-brand-6);
  font-weight: var(--font-weight-semibold, 600);
  background: transparent;
}

.app-nav-flyout__third-item--active .app-nav-flyout__third-btn:hover {
  color: var(--color-brand-6);
  font-weight: var(--font-weight-regular, 400);
  background: rgba(19, 23, 31, 0.04);
}

.app-nav-rail {
  width: 74px;
  min-width: 74px;
  max-width: 74px;
  flex-shrink: 0;
  min-height: 0;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--color-bg-page);
  box-sizing: border-box;
}

.app-nav-rail__logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: var(--spacing-extra-tight);
  width: 100%;
  padding-top: 15px;
  flex-shrink: 0;
}

.app-nav-rail__logo-mark,
.app-nav-rail__logo-word {
  display: block;
  flex-shrink: 0;
}

.app-nav-rail__nav {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-base) 0;
  gap: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.app-nav-rail__item {
  position: relative;
  box-sizing: border-box;
  width: 74px;
  height: 62px;
  min-height: 62px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  font: inherit;
}

.app-nav-rail__item > * {
  position: relative;
  z-index: 1;
}

.app-nav-rail__item--active::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 0;
  width: 62px;
  height: 54px;
  border-radius: 10px;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(52, 107, 250, 0.1) 0%, rgba(52, 107, 250, 0) 100%);
}

.app-nav-rail__item:hover .app-nav-rail__label {
  color: #346bfa;
  font-weight: var(--font-weight-regular, 400);
}

.app-nav-rail__item--active:hover .app-nav-rail__label {
  color: #346bfa;
  font-weight: var(--font-weight-semibold, 600);
}

.app-nav-rail__icon {
  display: block;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  object-fit: contain;
}

.app-nav-rail__icon-stack {
  position: relative;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.app-nav-rail__icon--inactive-img {
  position: absolute;
  inset: 0;
  width: 20px;
  height: 20px;
  object-fit: contain;
  opacity: 1;
  transition: opacity 0.12s ease;
}

.app-nav-rail__icon--inactive-hoverfill {
  position: absolute;
  inset: 0;
  width: 20px;
  height: 20px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.12s ease;
}

.app-nav-rail__item:hover:not(.app-nav-rail__item--active) .app-nav-rail__icon--inactive-img {
  opacity: 0;
}

.app-nav-rail__item:hover:not(.app-nav-rail__item--active) .app-nav-rail__icon--inactive-hoverfill {
  opacity: 1;
}

.app-nav-rail__label {
  display: block;
  width: 100%;
  max-width: 74px;
  padding: 0 2px;
  box-sizing: border-box;
  font-size: var(--font-size-nav-rail-label);
  line-height: var(--line-height-nav-rail-label);
  text-align: center;
  word-break: keep-all;
  overflow-wrap: anywhere;
  color: #858b97;
  font-weight: var(--font-weight-regular, 400);
}

.app-nav-rail__item--active .app-nav-rail__label {
  color: #346bfa;
  font-weight: var(--font-weight-semibold, 600);
}
</style>
