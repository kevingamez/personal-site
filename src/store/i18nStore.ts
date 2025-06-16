import { createStore } from 'zustand/vanilla'
import { useEffect, useState } from 'preact/hooks'

// Import translations
import enTranslations from '../i18n/locales/en.json'
import esTranslations from '../i18n/locales/es.json'

export type Locale = 'en' | 'es'
export type Translations = typeof enTranslations

const translations: Record<Locale, Translations> = {
  en: enTranslations,
  es: esTranslations
}

interface I18nStore {
  locale: Locale
  translations: Translations
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

// Get nested property from object using dot notation
const getNestedValue = (obj: any, path: string): string => {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path
}

export const i18nStore = createStore<I18nStore>((set, get) => ({
  locale: 'en', // Default language
  translations: translations.en,
  
  setLocale: (locale: Locale) => {
    const newTranslations = translations[locale]
    set({ 
      locale, 
      translations: newTranslations 
    })
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-language', locale)
    }
  },
  
  t: (key: string) => {
    const state = get()
    return getNestedValue(state.translations, key)
  }
}))

// Custom hook for Preact compatibility
export const useI18n = () => {
  const [state, setState] = useState(i18nStore.getState())
  
  useEffect(() => {
    // Load saved language preference
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('preferred-language') as Locale
      if (savedLocale && (savedLocale === 'en' || savedLocale === 'es')) {
        i18nStore.getState().setLocale(savedLocale)
      }
    }
    
    const unsubscribe = i18nStore.subscribe((newState) => {
      setState(newState)
    })
    return unsubscribe
  }, [])
  
  return state
} 