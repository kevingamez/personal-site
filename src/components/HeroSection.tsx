import GameOfLifeIsland from './GameOfLifeIsland'
import { useI18n } from '../store/i18nStore'

export default function HeroSection() {
  const { t } = useI18n()

  return (
    <section id="hero" style={{
      height: '100vh',
      width: '100%',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <GameOfLifeIsland />
      
      {/* Scroll indicator */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        color: '#fff',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
        opacity: 0.8,
        animation: 'bounce 2s infinite'
      }}>
        <span>{t('hero.scrollToExplore')}</span>
        <div style={{
          width: '20px',
          height: '30px',
          border: '2px solid #fff',
          borderRadius: '20px',
          position: 'relative'
        }}>
          <div style={{
            width: '4px',
            height: '8px',
            backgroundColor: '#fff',
            borderRadius: '2px',
            position: 'absolute',
            top: '6px',
            left: '50%',
            transform: 'translateX(-50%)',
            animation: 'scroll-indicator 2s infinite'
          }}></div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
          40% { transform: translateX(-50%) translateY(-10px); }
          60% { transform: translateX(-50%) translateY(-5px); }
        }
        
        @keyframes scroll-indicator {
          0% { opacity: 1; top: 6px; }
          50% { opacity: 0.5; top: 12px; }
          100% { opacity: 1; top: 6px; }
        }
      `}</style>
    </section>
  )
} 