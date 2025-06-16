import { useState, useEffect } from 'preact/hooks'
import { useI18n } from '../store/i18nStore'

interface NavigationDockProps {
  isPlaying?: boolean
  onPlay?: () => void
  onReset?: () => void
  isDarkMode?: boolean
  onToggleTheme?: () => void
}

export default function NavigationDock({ 
  isPlaying, 
  onPlay, 
  onReset, 
  isDarkMode, 
  onToggleTheme 
}: NavigationDockProps) {
  const { t } = useI18n()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1000)
    }
    
    // Initial check
    checkMobile()
    
    // Listen for resize
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const navigationItems = [
    { id: 'hero', label: '🏠', title: t('nav.home') },
    { id: 'about', label: '👋', title: t('nav.about') },
    { id: 'experience', label: '🎯', title: t('nav.experience') },
    { id: 'projects', label: '💼', title: t('nav.portfolio') },
    { id: 'skills', label: '🛠️', title: t('nav.skills') },
    { id: 'contact', label: '📞', title: t('nav.contact') }
  ]

  const gameControls = [
    { 
      action: onPlay, 
      label: isPlaying ? '⏸️' : '▶️', 
      title: isPlaying ? t('gameOfLife.controls.pause') : t('gameOfLife.controls.play')
    },
    { 
      action: onReset, 
      label: '🔄', 
      title: t('gameOfLife.controls.reset')
    },
    { 
      action: onToggleTheme, 
      label: isDarkMode ? '☀️' : '🌙', 
      title: isDarkMode ? t('theme.light') : t('theme.dark')
    }
  ]

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontSize: '20px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'inherit'
  }

  return (
    <div style={{
      position: 'fixed',
      right: isMobile ? '12px' : '20px',
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      // Smaller on mobile
      scale: isMobile ? '0.85' : '1'
    }}>
      {/* Navigation Section */}
      <div style={{
        backgroundColor: isDarkMode 
          ? 'rgba(30, 30, 30, 0.9)' 
          : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '12px',
        border: isDarkMode 
          ? '1px solid rgba(255, 255, 255, 0.1)' 
          : '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: isDarkMode
          ? '0 8px 32px rgba(0, 0, 0, 0.3)'
          : '0 8px 32px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        {navigationItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            title={item.title}
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode 
                ? 'rgba(59, 130, 246, 0.2)' 
                : 'rgba(59, 130, 246, 0.1)'
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            {item.label}
          </a>
        ))}
      </div>

      {/* Separator */}
      <div style={{
        height: '1px',
        backgroundColor: isDarkMode 
          ? 'rgba(255, 255, 255, 0.1)' 
          : 'rgba(0, 0, 0, 0.1)',
        margin: '4px 12px'
      }}></div>

      {/* Game Controls Section */}
      <div style={{
        backgroundColor: isDarkMode 
          ? 'rgba(30, 30, 30, 0.9)' 
          : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '12px',
        border: isDarkMode 
          ? '1px solid rgba(255, 255, 255, 0.1)' 
          : '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: isDarkMode
          ? '0 8px 32px rgba(0, 0, 0, 0.3)'
          : '0 8px 32px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        {gameControls.map((control, index) => (
          <button
            key={index}
            onClick={control.action}
            title={control.title}
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode 
                ? 'rgba(59, 130, 246, 0.2)' 
                : 'rgba(59, 130, 246, 0.1)'
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            {control.label}
          </button>
        ))}
      </div>
    </div>
  )
} 