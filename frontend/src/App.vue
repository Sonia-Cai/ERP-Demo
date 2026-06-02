<script setup lang="ts">
import { zhCN } from '@/locale'
import { erpAntdTheme } from '@/theme/erpAntdTheme'
import { theme } from 'ant-design-vue'

const { defaultAlgorithm } = theme

const appTheme = {
  algorithm: defaultAlgorithm,
  ...erpAntdTheme,
}
</script>

<template>
  <a-config-provider :locale="zhCN" :theme="appTheme">
    <router-view />
  </a-config-provider>
</template>
