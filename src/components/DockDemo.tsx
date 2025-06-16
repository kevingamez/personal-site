import { Dock, DockIcon } from "./ui/dock"
import { Home, User, Mail, Settings, Github, Play, Pause, RotateCcw, Sun, Moon } from "lucide-preact"

interface DockDemoProps {
  isPlaying?: boolean
  onPlay?: () => void
  onReset?: () => void
  isDarkMode?: boolean
  onToggleTheme?: () => void
}

export default function DockDemo({ isPlaying, onPlay, onReset, isDarkMode, onToggleTheme }: DockDemoProps) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 30,
      maxWidth: '90vw',
      overflow: 'hidden'
    }}>
      <Dock>
        <DockIcon onClick={() => window.open('https://github.com', '_blank')} isDarkMode={isDarkMode}>
          <Github style={{ 
            width: '24px', 
            height: '24px', 
            color: isDarkMode ? '#E5E7EB' : '#374151',
            transition: 'color 0.3s ease-in-out'
          }} />
        </DockIcon>
        
        <DockIcon onClick={onPlay} isDarkMode={isDarkMode}>
          {isPlaying ? (
            <Pause style={{ 
              width: '24px', 
              height: '24px', 
              color: isDarkMode ? '#E5E7EB' : '#374151',
              transition: 'color 0.3s ease-in-out'
            }} />
          ) : (
            <Play style={{ 
              width: '24px', 
              height: '24px', 
              color: isDarkMode ? '#E5E7EB' : '#374151',
              transition: 'color 0.3s ease-in-out'
            }} />
          )}
        </DockIcon>
        
        <DockIcon onClick={onReset} isDarkMode={isDarkMode}>
          <RotateCcw style={{ 
            width: '24px', 
            height: '24px', 
            color: isDarkMode ? '#E5E7EB' : '#374151',
            transition: 'color 0.3s ease-in-out'
          }} />
        </DockIcon>
        
        <DockIcon onClick={onToggleTheme} isDarkMode={isDarkMode}>
          {isDarkMode ? (
            <Sun style={{ 
              width: '24px', 
              height: '24px', 
              color: isDarkMode ? '#E5E7EB' : '#374151',
              transition: 'color 0.3s ease-in-out'
            }} />
          ) : (
            <Moon style={{ 
              width: '24px', 
              height: '24px', 
              color: isDarkMode ? '#E5E7EB' : '#374151',
              transition: 'color 0.3s ease-in-out'
            }} />
          )}
        </DockIcon>
        
        <DockIcon isDarkMode={isDarkMode}>
          <Home style={{ 
            width: '24px', 
            height: '24px', 
            color: isDarkMode ? '#E5E7EB' : '#374151',
            transition: 'color 0.3s ease-in-out'
          }} />
        </DockIcon>
        
        <DockIcon isDarkMode={isDarkMode}>
          <User style={{ 
            width: '24px', 
            height: '24px', 
            color: isDarkMode ? '#E5E7EB' : '#374151',
            transition: 'color 0.3s ease-in-out'
          }} />
        </DockIcon>
        
        <DockIcon isDarkMode={isDarkMode}>
          <Mail style={{ 
            width: '24px', 
            height: '24px', 
            color: isDarkMode ? '#E5E7EB' : '#374151',
            transition: 'color 0.3s ease-in-out'
          }} />
        </DockIcon>
        
        <DockIcon isDarkMode={isDarkMode}>
          <Settings style={{ 
            width: '24px', 
            height: '24px', 
            color: isDarkMode ? '#E5E7EB' : '#374151',
            transition: 'color 0.3s ease-in-out'
          }} />
        </DockIcon>
      </Dock>
    </div>
  )
} 