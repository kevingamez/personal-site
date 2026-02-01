import { createStore } from 'zustand/vanilla'
import { useEffect, useState } from 'preact/hooks'

interface GameStats {
  alive: number
  dead: number
}

interface GameStore {
  // Game state
  playing: boolean
  stats: GameStats
  time: string
  timeDiff: string
  isDarkMode: boolean

  // Actions
  setPlaying: (playing: boolean) => void
  setStats: (stats: GameStats) => void
  setTime: (time: string) => void
  setTimeDiff: (diff: string) => void
  toggleTheme: () => void
  reset: () => void
}

export const gameStore = createStore<GameStore>((set) => ({
  // Initial state
  playing: false,
  stats: { alive: 0, dead: 0 },
  time: '',
  timeDiff: '',
  isDarkMode: false,

  // Actions
  setPlaying: (playing) => set({ playing }),
  setStats: (stats) => set({ stats }),
  setTime: (time) => set({ time }),
  setTimeDiff: (timeDiff) => set({ timeDiff }),
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  reset: () => set({
    playing: false,
    stats: { alive: 0, dead: 0 }
  })
}))

// Custom hook for Preact compatibility
export const useGameStore = () => {
  const [state, setState] = useState(gameStore.getState())
  
  useEffect(() => {
    const unsubscribe = gameStore.subscribe((newState) => {
      setState(newState)
    })
    return unsubscribe
  }, [])
  
  return state
} 