import { useI18n } from '../store/i18nStore'

export default function ContactSection() {
  const { t } = useI18n()

  return (
    <section
      id="contact"
      style={{
        minHeight: '80vh',
        width: '100%',
        backgroundColor: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Grid Pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '25px 25px',
          pointerEvents: 'none',
        }}
      />

      {/* Crosses */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        <svg style={{ width: '100%', height: '100%' }}>
          <defs>
            <pattern id="crosses-contact" width="100" height="100" patternUnits="userSpaceOnUse">
              <g stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none">
                <line x1="50" y1="44" x2="50" y2="56" />
                <line x1="44" y1="50" x2="56" y2="50" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#crosses-contact)" />
        </svg>
      </div>

      <div style={{
        maxWidth: '800px',
        width: '100%',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh'
      }}>
        {/* Footer */}
        <div style={{
          borderTop: '1px solid #334155',
          paddingTop: '32px',
          color: '#64748b',
          fontSize: '14px'
        }}>
          <p>{t('contact.footer')}</p>
          <p style={{ marginTop: '8px' }}>
            {t('contact.tech')}
          </p>
        </div>
      </div>
    </section>
  )
} 