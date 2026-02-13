import { useLocalStorage } from '@vueuse/core'
import type { GlobalConfigProvider } from 'tdesign-vue-next'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { i18n, langCode, localeConfigKey } from '@/locales/index'
type AppLocaleMessage = {
  componentsLocale?: GlobalConfigProvider
  // 你还可以在这里补充别的顶层字段，比如:
  // route?: Record<string, any>
  // common?: Record<string, any>
}

export function useLocale() {
  const { locale } = useI18n({ useScope: 'global' })
  function changeLocale(lang: string) {
    // 如果切换的语言不在对应语言文件里则默认为简体中文
    if (!langCode.includes(lang)) {
      lang = 'zh_CN'
    }

    locale.value = lang
    useLocalStorage(localeConfigKey, 'zh_CN').value = lang
  }

  const getComponentsLocale = computed(() => {
    const msg = i18n.global.getLocaleMessage(locale.value) as AppLocaleMessage
    return (msg.componentsLocale ?? {}) as GlobalConfigProvider
  })

  return {
    changeLocale,
    getComponentsLocale,
    locale,
  }
}
