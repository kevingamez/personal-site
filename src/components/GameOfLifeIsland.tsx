// GameOfLifeIsland.tsx
import { useEffect, useRef, useState } from 'preact/hooks'
import NavigationDock from './NavigationDock'
import LanguageToggle from './LanguageToggle'
import { useGameStore } from '../store/gameStore'
import { useI18n } from '../store/i18nStore'

const getCellSize = () => window.innerWidth < 1000 ? 35 : 25  // Larger cells on mobile
const MAX_FPS     = 10
const FADE_STEPS  = 2
const SEED_PERIOD = 5_000
const PLAY_DELAY  = 1_000
const ALIVE       = -1  
type Cell = number
type Grid = Int8Array

const PATTERNS: Record<string,[number,number][]> = {
  // Gosper Glider Gun
  GUN:[[24,0],[22,1],[24,1],[12,2],[13,2],[20,2],[21,2],[34,2],[35,2],
    [11,3],[15,3],[20,3],[21,3],[34,3],[35,3],
    [0,4],[1,4],[10,4],[16,4],[20,4],[21,4],
    [0,5],[1,5],[10,5],[14,5],[16,5],[17,5],[22,5],[24,5],
       [10,6],[16,6],[24,6],[11,7],[15,7],[12,8],[13,8]],
  
  // Classic patterns
//   GLIDER:[[1,0],[2,1],[0,2],[1,2],[2,2]],
//   ACORN:[[0,0],[1,0],[1,2],[3,1],[4,0],[5,0],[6,0]],
//   R:[[1,0],[2,0],[0,1],[1,1],[1,2]],
  
  // Oscillators
//   PULSAR:[[2,0],[3,0],[4,0],[8,0],[9,0],[10,0],
//            [0,2],[5,2],[7,2],[12,2],[0,3],[5,3],[7,3],[12,3],
//            [0,4],[5,4],[7,4],[12,4],[2,5],[3,5],[4,5],[8,5],[9,5],[10,5],
//            [2,7],[3,7],[4,7],[8,7],[9,7],[10,7],[0,8],[5,8],[7,8],[12,8],
//            [0,9],[5,9],[7,9],[12,9],[0,10],[5,10],[7,10],[12,10],
//            [2,12],[3,12],[4,12],[8,12],[9,12],[10,12]],
//   PENTADECATHLON:[[2,0],[3,0],[1,1],[4,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],
//                   [1,8],[4,8],[2,9],[3,9]],
//   BEACON:[[0,0],[1,0],[0,1],[3,2],[2,3],[3,3]],
//   TOAD:[[1,0],[2,0],[3,0],[0,1],[1,1],[2,1]],
//   BLINKER:[[0,0],[1,0],[2,0]],
  
  // Spaceships
  LWSS:[[0,0],[3,0],[4,1],[0,2],[4,2],[1,3],[2,3],[3,3],[4,3]],
  MWSS:[[0,0],[4,0],[5,1],[0,2],[5,2],[1,3],[2,3],[3,3],[4,3],[5,3]],
  HWSS:[[0,0],[5,0],[6,1],[0,2],[6,2],[1,3],[2,3],[3,3],[4,3],[5,3],[6,3]],
  
  // Methuselahs
  DIEHARD:[[6,0],[0,1],[1,1],[1,2],[5,2],[6,2],[7,2]],
  
  // Still lifes
//   BLOCK:[[0,0],[1,0],[0,1],[1,1]],
//   BEEHIVE:[[1,0],[2,0],[0,1],[3,1],[1,2],[2,2]],
//   LOAF:[[1,0],[2,0],[0,1],[3,1],[1,2],[3,2],[2,3]],
//   BOAT:[[0,0],[1,0],[0,1],[2,1],[1,2]],
//   TUB:[[1,0],[0,1],[2,1],[1,2]],
}

const fadeGrey = (v:number,isDark:boolean)=>{
  if(isDark){
    // In dark mode: fade from light grey (187) to background dark (26)
    const g=Math.round(187-(187-26)*(1-v/FADE_STEPS))
    return `rgb(${g},${g},${g})`
  } else {
    // In light mode: fade from dark to lighter
    const g=Math.round(68+(255-68)*(1-v/FADE_STEPS))
    return `rgb(${g},${g},${g})`
  }
}

export default function GameOfLifeIsland(){
  const gameState = useGameStore()
  const { 
    playing, 
    stats, 
    time, 
    isDarkMode, 
    setPlaying, 
    setStats, 
    setTime, 
    toggleTheme,
    reset: resetStore
  } = gameState
  
  const { t } = useI18n()
  const [isMobile, setIsMobile] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bgRef     = useRef<HTMLCanvasElement>()
  const gridRef   = useRef<Grid>()
  const nextRef   = useRef<Grid>()
  const wRef      = useRef(0)
  const hRef      = useRef(0)
  const cellSizeRef = useRef(25)
  const isDarkModeRef = useRef(false)

  const playTimer = useRef<number>()
  const seedTimer = useRef<number>()
  const rampTimer = useRef<number>()
  const fpsRef    = useRef(0)
  const running   = useRef(false)

  /* logo mask rect (cell coordinates) */
  const logoRect = useRef({l:0,r:0,t:0,b:0})
  const inLogo   = (x:number,y:number)=>{
    const r=logoRect.current
    return y>=r.t && y<=r.b && x>=r.l && x<=r.r
  }

  const updateStats=()=>{
    const alive=gridRef.current?.reduce((s,v)=>s+(v===ALIVE?1:0),0)??0
    const total=wRef.current*hRef.current
    setStats({alive,dead:total-alive})
  }

  const seedPattern=()=>{
    const keys=Object.keys(PATTERNS)
    const pat =PATTERNS[keys[Math.floor(Math.random()*keys.length)]]
    const maxX=wRef.current-Math.max(...pat.map(([x])=>x))-1
    const maxY=hRef.current-Math.max(...pat.map(([,y])=>y))-1
    const ox=Math.floor(Math.random()*maxX)
    const oy=Math.floor(Math.random()*maxY)
    pat.forEach(([x,y])=>{
      gridRef.current![(oy+y)*wRef.current+(ox+x)]=ALIVE
    })
  }

  const startTimers=()=>{
    clearInterval(seedTimer.current);seedPattern()
    seedTimer.current=window.setInterval(seedPattern,SEED_PERIOD)
    clearInterval(rampTimer.current);fpsRef.current=1
    rampTimer.current=window.setInterval(()=>{
      if(fpsRef.current<MAX_FPS)fpsRef.current+=1
      else clearInterval(rampTimer.current)
    },1_000)
  }
  const stopTimers=()=>{clearInterval(seedTimer.current);clearInterval(rampTimer.current)}

  const drawBG=(wp:number,hp:number,c:number,r:number)=>{
    bgRef.current ??=document.createElement('canvas')
    const bg=bgRef.current;bg.width=wp;bg.height=hp
    const g=bg.getContext('2d')!
    const dark = isDarkModeRef.current
    // Background color based on theme
    g.fillStyle=dark?'#1a1a1a':'#fff';g.fillRect(0,0,wp,hp)
    // Grid lines based on theme  
    g.beginPath();g.strokeStyle=dark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.03)';g.lineWidth=1
    for(let x=0;x<=c;x++){const px=x*cellSizeRef.current+0.5;g.moveTo(px,0);g.lineTo(px,hp)}
    for(let y=0;y<=r;y++){const py=y*cellSizeRef.current+0.5;g.moveTo(0,py);g.lineTo(wp,py)}
    g.stroke()
    // Major grid lines based on theme
    g.strokeStyle=dark?'rgba(255,255,255,0.15)':'rgba(0,0,0,0.12)';g.lineWidth=1.2
    for(let by=0;by<=r;by+=4)
      for(let bx=0;bx<=c;bx+=4){
        const cx=bx*cellSizeRef.current,cy=by*cellSizeRef.current
        g.beginPath();g.moveTo(cx-6,cy);g.lineTo(cx+6,cy)
        g.moveTo(cx,cy-6);g.lineTo(cx,cy+6);g.stroke()
      }
  }

  // Update Colombia time every second
  useEffect(()=>{
    const updateTime=()=>{
      const now=new Date()
      const colombiaTime=new Intl.DateTimeFormat('es-CO',{
        timeZone:'America/Bogota',
        hour:'2-digit',
        minute:'2-digit',
        second:'2-digit',
        hour12:false
      }).format(now)
      setTime(colombiaTime)
    }
    updateTime()
    const interval=setInterval(updateTime,1000)
    return()=>clearInterval(interval)
  },[])

  useEffect(()=>{
    const canvas=canvasRef.current!;const ctx=canvas.getContext('2d')!

        const calcLogoRect=()=>{
      const isMobile = innerWidth < 1000
      
      if (isMobile) {
        // On mobile, create a much larger protected area in the center
        const centerX = Math.floor(wRef.current / 2)
        const centerY = Math.floor(hRef.current / 2)
        
        // Create a large rectangle around the center (about 80% of screen width, 40% of height)
        const protectedWidth = Math.floor(wRef.current * 0.8)
        const protectedHeight = Math.floor(hRef.current * 0.4)
        
        logoRect.current = {
          l: centerX - Math.floor(protectedWidth / 2),
          r: centerX + Math.floor(protectedWidth / 2),
          t: centerY - Math.floor(protectedHeight / 2),
          b: centerY + Math.floor(protectedHeight / 2)
        }
      } else {
        // Desktop calculation (original logic but more conservative)
        const fontSize = Math.min(innerWidth * 0.18, 160)
        const charWidthEstimate = fontSize * 0.6
        const letterSpacingTotal = fontSize * 0.08 * 10
        const estimatedWidth = (11 * charWidthEstimate) + letterSpacingTotal
        
        const padding = 160
        const tw = estimatedWidth + padding
        const th = fontSize * 1.4
        
        const left = (canvas.width - tw) / 2
        const top = (canvas.height - th) / 2
        
        logoRect.current = {
          l: Math.floor(left / cellSizeRef.current) - 1,
          r: Math.ceil((left + tw) / cellSizeRef.current),
          t: Math.floor(top / cellSizeRef.current) - 1,
          b: Math.ceil((top + th) / cellSizeRef.current)
        }
      }
    }

    const resize=()=>{
      canvas.width=innerWidth;canvas.height=innerHeight
      cellSizeRef.current = getCellSize()  // Update cell size based on screen
      wRef.current=Math.ceil(canvas.width /cellSizeRef.current)
      hRef.current=Math.ceil(canvas.height/cellSizeRef.current)
      gridRef.current=new Int8Array(wRef.current*hRef.current)
      nextRef.current=new Int8Array(wRef.current*hRef.current)
      setIsMobile(innerWidth < 1000)  // Update mobile state
      calcLogoRect()
      drawBG(canvas.width,canvas.height,wRef.current,hRef.current)
      updateStats();render()
    }

    const render=()=>{
      ctx.drawImage(bgRef.current!,0,0)
      const dark = isDarkModeRef.current
      for(let y=0;y<hRef.current;y++)
        for(let x=0;x<wRef.current;x++){
          if(inLogo(x,y)) continue
          const v=gridRef.current![y*wRef.current+x] as Cell
          if(v===ALIVE) ctx.fillStyle=dark?'#bbbbbb':'#444'
          else if(v>0)  ctx.fillStyle=fadeGrey(v,dark)
          else continue
          ctx.fillRect(x*cellSizeRef.current,y*cellSizeRef.current,cellSizeRef.current,cellSizeRef.current)
        }
    }

    const step=()=>{
      const w=wRef.current,h=hRef.current,g=gridRef.current!,n=nextRef.current!
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){
        const idx=y*w+x,v=g[idx] as Cell
        let s=0
        for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)
          if(dx||dy)s+=g[((y+dy+h)%h)*w+((x+dx+w)%w)]===ALIVE?1:0
        if(v===ALIVE) n[idx]=(s===2||s===3)?ALIVE:FADE_STEPS
        else if(s===3) n[idx]=ALIVE
        else if(v>0)   n[idx]=v-1
        else           n[idx]=0
      }
      gridRef.current=new Int8Array(n);updateStats()
    }

    let last=0
    const loop=(t:number)=>{
      const fps=fpsRef.current||1
      if(running.current&&t-last>1000/fps){step();render();last=t}
      requestAnimationFrame(loop)
    }

    const paint=(e:PointerEvent)=>{
      const r=canvas.getBoundingClientRect()
      const x=Math.floor((e.clientX-r.left)/cellSizeRef.current)
      const y=Math.floor((e.clientY-r.top )/cellSizeRef.current)
      if(x>=0&&x<wRef.current&&y>=0&&y<hRef.current&&!inLogo(x,y)){
        gridRef.current![y*wRef.current+x]=ALIVE;updateStats();render()
      }
    }

    // Initialize mobile state
    setIsMobile(innerWidth < 1000)
    resize();requestAnimationFrame(loop)
    addEventListener('resize',resize)
    canvas.addEventListener('pointermove',paint)
    canvas.addEventListener('pointerenter',()=>{
      if(running.current) return
      running.current=true;setPlaying(true);startTimers()
    })
    canvas.addEventListener('pointerleave',()=>{
      if(!running.current) clearTimeout(playTimer.current)
    })

    return()=>{removeEventListener('resize',resize)
      canvas.removeEventListener('pointermove',paint)
      clearTimeout(playTimer.current);stopTimers()}
  },[])

  // Update theme reference and redraw background when theme changes
  useEffect(()=>{
    isDarkModeRef.current = isDarkMode
    if(canvasRef.current && wRef.current && hRef.current){
      drawBG(canvasRef.current.width, canvasRef.current.height, wRef.current, hRef.current)
    }
  },[isDarkMode])

  const togglePlay=()=>{running.current=!running.current;setPlaying(running.current)
    running.current?startTimers():stopTimers()}
  const reset=()=>{running.current=false;setPlaying(false);stopTimers();fpsRef.current=0
    gridRef.current?.fill(0);updateStats();resetStore()}

  return(
    <div style={{
      height:'100%',
      width:'100%',
      position:'absolute',
      top:0,
      left:0,
      overflow:'hidden'
    }}>
      <canvas ref={canvasRef} style={{
        position:'absolute',
        inset:0,
        zIndex:0,
        overflow:'hidden'
      }}/>
      
      {/* Fade overlay for edges */}
      <div style={{
        position:'absolute',inset:0,zIndex:5,pointerEvents:'none',
        background: isDarkMode 
          ? `radial-gradient(ellipse at center, transparent 60%, transparent 75%, rgba(26,26,26,0.2) 85%, rgba(26,26,26,0.6) 95%, rgba(26,26,26,0.9) 100%)`
          : `radial-gradient(ellipse at center, transparent 60%, transparent 75%, rgba(255,255,255,0.2) 85%, rgba(255,255,255,0.6) 95%, rgba(255,255,255,0.9) 100%)`
      }}/>
      
      <div style={{
        position:'absolute',
        top:0,
        left:0,
        width:'100%',
        height:'100%',
        zIndex:10,
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        fontFamily:'Inter, sans-serif',
        fontWeight:500,
        fontSize: isMobile ? 'min(28vw,160px)' : 'min(18vw,160px)',
        letterSpacing:'0.08em',
        color: isDarkMode ? '#E5E7EB' : '#243B55',
        pointerEvents:'none',
        textAlign:'center',
        lineHeight:1
      }}>
        <span style={{
          display:'block',
          width:'100%',
          textAlign:'center'
        }}>
          KEVIN GAMEZ
        </span>
      </div>
      
      {/* Colombia time in top right corner */}
      <div style={{
        position:'fixed',top:14,right:14,zIndex:20,
        background: isDarkMode ? 'rgba(30,30,30,.85)' : 'rgba(255,255,255,.85)',
        padding:'8px 12px',borderRadius:6,
        fontSize:14,fontFamily:'Inter, sans-serif',fontWeight:500,
        color: isDarkMode ? '#E5E7EB' : '#243B55',
        boxShadow:'0 4px 12px rgba(0,0,0,.15)',
        letterSpacing:'0.5px'
      }}>
        {time} COL
      </div>
      
      <NavigationDock 
        isPlaying={playing} 
        onPlay={togglePlay} 
        onReset={reset}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />
      
      {/* Stats overlay */}
      <div style={{
        position:'fixed',bottom:14,left:14,zIndex:20,
        background: isDarkMode ? 'rgba(30,30,30,.85)' : 'rgba(255,255,255,.85)',
        padding:'8px 12px',borderRadius:6,
        fontSize:12,fontFamily:'Inter, sans-serif',
        color: isDarkMode ? '#E5E7EB' : '#243B55',
        boxShadow:'0 4px 12px rgba(0,0,0,.15)'
      }}>
        {t('gameOfLife.stats.alive')}: {stats.alive} | {t('gameOfLife.stats.dead')}: {stats.dead}
      </div>
      
      {/* Language Toggle */}
      <div style={{
        position:'fixed',top:14,left:14,zIndex:20
      }}>
        <LanguageToggle />
      </div>
    </div>
  )
}
