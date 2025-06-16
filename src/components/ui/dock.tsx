import { useState } from "preact/hooks"

export interface DockProps {
  className?: string
  children: preact.ComponentChildren
  direction?: "top" | "middle" | "bottom"
  isDarkMode?: boolean
}

const Dock = ({ className, children, direction = "bottom", isDarkMode }: DockProps) => {
  return (
    <div
      style={{
        margin: '0 auto',
        display: 'flex',
        height: '58px',
        width: 'max-content',
        gap: '8px',
        borderRadius: '16px',
        border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.3)',
        background: isDarkMode ? 'rgba(30,30,30,0.85)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        padding: '8px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
      }}
      className={className}
    >
      {children}
    </div>
  )
}

export interface DockIconProps {
  size?: number
  className?: string
  children?: preact.ComponentChildren
  onClick?: () => void
  isDarkMode?: boolean
}

const DockIcon = ({ size = 40, className, children, onClick, isDarkMode }: DockIconProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  return (
    <div
      style={{
        width: isHovered ? '48px' : '40px',
        height: isHovered ? '48px' : '40px',
        cursor: 'pointer',
        borderRadius: '12px',
        background: isDarkMode 
          ? (isHovered ? 'rgba(80,80,80,0.7)' : 'rgba(60,60,60,0.5)')
          : (isHovered ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)'),
        backdropFilter: 'blur(8px)',
        border: isDarkMode ? '1px solid rgba(100,100,100,0.3)' : '1px solid rgba(200,200,200,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease-out',
        transform: isPressed ? 'scale(0.95)' : 'scale(1)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setIsPressed(false)
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={onClick}
      className={className}
    >
      {children}
    </div>
  )
}

export { Dock, DockIcon } 