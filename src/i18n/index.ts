import { createI18n } from 'vue-i18n'
import de from './locales/de'
import en from './locales/en'

export const i18n = createI18n({
  legacy: false,
  locale: navigator.language.startsWith('de') ? 'de' : 'en',
  fallbackLocale: 'en',
  messages: { de, en },
})

export const t = i18n.global.t
