import { Languages } from 'lucide-preact'
import { useI18n, type Locale } from '../store/i18nStore'

interface LanguageToggleProps {
  className?: string
}

export default function LanguageToggle({ className }: LanguageToggleProps) {
  const { locale, setLocale, t } = useI18n()

  const toggleLanguage = () => {
    const newLocale: Locale = locale === 'en' ? 'es' : 'en'
    setLocale(newLocale)
  }

  return (
    <button
      onClick={toggleLanguage}
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        borderRadius: '6px',
        border: 'none',
        background: 'rgba(255,255,255,0.1)',
        color: 'inherit',
        cursor: 'pointer',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        transition: 'background-color 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
      }}
      title={`Switch to ${locale === 'en' ? 'Español' : 'English'}`}
    >
      <Languages style={{ width: '16px', height: '16px' }} />
      <span>{locale === 'en' ? 'ES' : 'EN'}</span>
    </button>
  )
} 