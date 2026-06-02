<script setup lang="ts">
import AppNavRail from '@/components/AppNavRail.vue'
import chromeUserAvatarUrl from '@/assets/avatar/chrome-user-avatar.png?url'
import chevronUpLinearUrl from '@/assets/nav/chevron-up-linear.svg?url'
import feedbackUrl from '@/assets/nav/feedback.svg?url'

defineProps<{
  /** 一级导航当前高亮 key，与 `AppNavRail` 一致 */
  navActiveKey: string
  /** 顶栏时区展示文案 */
  chromeTimezone: string
  /** 顶栏实时时钟文案 */
  chromeNowText: string
}>()

const emit = defineEmits<{
  navClick: [key: string]
  thirdNavClick: [firstKey: string, secondId: string, thirdId: string, thirdLabel: string]
  chromeTzMenuClick: [info: { key: string | number }]
  chromeUserMenuClick: [info: { key: string | number }]
  chromeFeedbackClick: []
}>()

function onChromeTzMenu(info: { key: string | number }) {
  emit('chromeTzMenuClick', info)
}

function onChromeUserMenu(info: { key: string | number }) {
  emit('chromeUserMenuClick', info)
}
</script>

<template>
  <div class="erp-app-shell">
    <AppNavRail
      :active-key="navActiveKey"
      @nav-click="(k) => emit('navClick', k)"
      @third-nav-click="(a, b, c, d) => emit('thirdNavClick', a, b, c, d)"
    />

    <div class="erp-app-shell__workspace">
      <div class="erp-app-shell__chrome" role="region" aria-label="顶栏">
        <div class="erp-app-shell__chrome-tabs" role="tablist" aria-label="已打开页面">
          <slot name="chrome-tabs" />
        </div>
        <div class="erp-app-shell__chrome-user">
          <button
            type="button"
            class="erp-app-shell__fb"
            aria-label="意见反馈"
            @click="emit('chromeFeedbackClick')"
          >
            <img class="erp-app-shell__fb-icon" :src="feedbackUrl" width="18" height="18" alt="" />
          </button>
          <div class="erp-app-shell__tz-time" aria-label="时区与时间">
            <a-dropdown :trigger="['click']" placement="bottomLeft">
              <button type="button" class="erp-app-shell__pill" aria-label="切换时区">
                <span class="erp-app-shell__pill-text">{{ chromeTimezone }}</span>
                <img
                  class="erp-app-shell__caret-img"
                  :src="chevronUpLinearUrl"
                  width="14"
                  height="14"
                  alt=""
                  aria-hidden="true"
                />
              </button>
              <template #overlay>
                <a-menu :selected-keys="[chromeTimezone]" @click="onChromeTzMenu">
                  <a-menu-item key="美东">美东</a-menu-item>
                  <a-menu-item key="美西">美西</a-menu-item>
                  <a-menu-item key="北京">北京</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
            <span class="erp-app-shell__clock">{{ chromeNowText }}</span>
          </div>
          <a-dropdown :trigger="['click']" placement="bottomRight">
            <button type="button" class="erp-app-shell__pill" aria-label="用户菜单">
              <img
                class="erp-app-shell__avatar"
                :src="chromeUserAvatarUrl"
                width="22"
                height="22"
                alt=""
                aria-hidden="true"
              />
              <span class="erp-app-shell__name">Sonia Cai</span>
              <img
                class="erp-app-shell__caret-img"
                :src="chevronUpLinearUrl"
                width="14"
                height="14"
                alt=""
                aria-hidden="true"
              />
            </button>
            <template #overlay>
              <a-menu @click="onChromeUserMenu">
                <a-menu-item key="download-center">下载中心</a-menu-item>
                <a-menu-item key="logout">退出登录</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </div>

      <!-- 主内容外边距：上/左 0，右/下 16；页内滚动由插槽自行实现 -->
      <div class="erp-app-shell__content">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
/** fixed 视口壳：顶栏 + 导航固定，document 不纵向滚动 */
.erp-app-shell {
  position: fixed;
  inset: 0;
  z-index: 0;
  display: flex;
  align-items: stretch;
  overflow: hidden;
  background: var(--color-bg-page);
}

.erp-app-shell__workspace {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: var(--color-bg-page);
}

.erp-app-shell__chrome {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  flex-shrink: 0;
  box-sizing: border-box;
  gap: 18px;
  height: 40px;
  min-height: 40px;
  max-height: 40px;
  padding: 0;
  background: var(--color-bg-page);
  z-index: 20;
}

.erp-app-shell__chrome-tabs {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: flex-end;
  gap: var(--nav-tab-gap, 2px);
  overflow-x: auto;
  overflow-y: hidden;
}

.erp-app-shell__chrome-user {
  flex-shrink: 0;
  align-self: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 18px;
  padding: 0 18px;
}

.erp-app-shell__tz-time {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.erp-app-shell__pill {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 4px;
  margin: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: var(--radius-medium);
  font: inherit;
  color: inherit;
}

.erp-app-shell__pill:hover {
  background: rgba(19, 23, 31, 0.04);
}

.erp-app-shell__pill-text,
.erp-app-shell__name {
  font-size: var(--font-size-regular);
  line-height: var(--line-height-regular);
  color: var(--color-gray-11, #323b4b);
}

.erp-app-shell__caret-img {
  display: block;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  object-fit: contain;
  transform: rotate(180deg);
}

.erp-app-shell__clock {
  font-size: var(--font-size-regular);
  line-height: var(--line-height-regular);
  color: var(--color-gray-11, #323b4b);
  white-space: nowrap;
}

.erp-app-shell__avatar {
  display: block;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  flex-shrink: 0;
  object-fit: cover;
}

.erp-app-shell__fb {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  margin: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: var(--radius-medium);
  line-height: 0;
}

.erp-app-shell__fb:hover {
  background: rgba(19, 23, 31, 0.04);
}

.erp-app-shell__fb-icon {
  display: block;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  object-fit: contain;
}

/** 主内容区相对工作区：右/下 16px */
.erp-app-shell__content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  margin: 0 var(--layout-primary-card-margin-right, 16px) var(--spacing-base, 16px) 0;
  overflow: hidden;
  background: var(--color-bg-page);
}

.erp-app-shell__content :deep(.ant-layout-content) {
  background: var(--color-bg-page) !important;
  min-height: 0;
}

/** 顶栏页签：由页面 `chrome-tabs` 插槽输出，类名约定 `erp-chrome-tab*` */
.erp-app-shell__chrome-tabs :deep(.erp-chrome-tab) {
  box-sizing: border-box;
  flex-shrink: 0;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  height: 36px;
  min-height: 36px;
  padding: 0 12px;
  margin: 0;
  border: none;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  cursor: pointer;
  color: inherit;
  outline: none;
}

.erp-app-shell__chrome-tabs :deep(.erp-chrome-tab:focus-visible) {
  outline: 2px solid var(--color-primary-focus, var(--color-brand-2));
  outline-offset: 2px;
  border-radius: 4px;
}

.erp-app-shell__chrome-tabs :deep(.erp-chrome-tab--active) {
  background: var(--color-white, #fff);
  border-radius: 4px 4px 0 0;
  box-shadow: var(--shadow-1);
  position: relative;
  z-index: 1;
}

.erp-app-shell__chrome-tabs :deep(.erp-chrome-tab__label) {
  font-size: var(--font-size-regular);
  line-height: var(--line-height-regular);
  font-weight: var(--font-weight-regular, 400);
  color: var(--color-gray-11, #323b4b);
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.erp-app-shell__chrome-tabs :deep(.erp-chrome-tab__close) {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;
}

.erp-app-shell__chrome-tabs :deep(.erp-chrome-tab__close):hover {
  opacity: 0.85;
}

.erp-app-shell__chrome-tabs :deep(.erp-chrome-tab__close:focus-visible) {
  outline: 2px solid var(--color-primary-focus, var(--color-brand-2));
  outline-offset: 2px;
  border-radius: 2px;
}

.erp-app-shell__chrome-tabs :deep(.erp-chrome-tab__close-icon) {
  display: block;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  object-fit: contain;
  pointer-events: none;
}
</style>
