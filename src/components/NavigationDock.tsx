import { useState, useEffect } from 'preact/hooks'
import { useI18n } from '../store/i18nStore'

interface NavigationDockProps {
  isPlaying?: boolean
  onPlay?: () => void
  onReset?: () => void
  isDarkMode?: boolean
  onToggleTheme?: () => void
}

/* SVG Icons */
const Icons = {
  home: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  user: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  briefcase: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  code: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/>
      <polyline points="8 6 2 12 8 18"/>
    </svg>
  ),
  layers: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 17 12 22 22 17"/>
      <polyline points="2 12 12 17 22 12"/>
    </svg>
  ),
  mail: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  play: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
  pause: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="4" width="4" height="16"/>
      <rect x="14" y="4" width="4" height="16"/>
    </svg>
  ),
  refresh: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  ),
  sun: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  moon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
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
    { id: 'hero', icon: Icons.home, title: t('nav.home') },
    { id: 'about', icon: Icons.user, title: t('nav.about') },
    { id: 'experience', icon: Icons.briefcase, title: t('nav.experience') },
    { id: 'projects', icon: Icons.code, title: t('nav.portfolio') },
    { id: 'skills', icon: Icons.layers, title: t('nav.skills') },
    { id: 'contact', icon: Icons.mail, title: t('nav.contact') }
  ]

  const gameControls = [
    {
      action: onPlay,
      icon: isPlaying ? Icons.pause : Icons.play,
      title: isPlaying ? t('gameOfLife.controls.pause') : t('gameOfLife.controls.play')
    },
    {
      action: onReset,
      icon: Icons.refresh,
      title: t('gameOfLife.controls.reset')
    },
    {
      action: onToggleTheme,
      icon: isDarkMode ? Icons.sun : Icons.moon,
      title: isDarkMode ? t('theme.light') : t('theme.dark')
    }
  ]

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    textDecoration: 'none',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer'
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
            style={{
              ...buttonStyle,
              color: isDarkMode ? '#a1a1aa' : '#64748b'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode
                ? 'rgba(59, 130, 246, 0.2)'
                : 'rgba(59, 130, 246, 0.1)'
              e.currentTarget.style.color = '#3b82f6'
              e.currentTarget.style.transform = 'scale(1.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = isDarkMode ? '#a1a1aa' : '#64748b'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            {item.icon}
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
            style={{
              ...buttonStyle,
              color: isDarkMode ? '#a1a1aa' : '#64748b'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode
                ? 'rgba(59, 130, 246, 0.2)'
                : 'rgba(59, 130, 246, 0.1)'
              e.currentTarget.style.color = '#3b82f6'
              e.currentTarget.style.transform = 'scale(1.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = isDarkMode ? '#a1a1aa' : '#64748b'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            {control.icon}
          </button>
        ))}
      </div>
    </div>
  )
} 