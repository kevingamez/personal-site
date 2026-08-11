// Shared types and language-color constants for the home page GitHub stats.

export type LangSlice = { name: string; pct: number; color: string }
export type RepoCard = {
  name: string
  description: string
  language: string
  color: string
  stars: number
  url: string
}
export type ContribDay = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }
export type ContribCalendar = {
  totalContributions: number
  days: ContribDay[] // ~365 entries, oldest first
  longestStreak: number
  currentStreak: number
}
export type HomeStats = {
  publicRepos: number
  languagesShipped: number
  yearsOnGithub: number
  followers: number
  following: number
  joinedISO: string // ISO date of GitHub account creation
  languageMix: LangSlice[]
  topRepos: RepoCard[]
  contribCalendar: ContribCalendar
}

// GitHub-canonical language colors (subset most likely in this repo set).
// Source: github/linguist's `languages.yml`.
const LANG_COLOR: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Swift: '#F05138',
  Dart: '#00B4AB',
  Dockerfile: '#384d54',
  CSS: '#563d7c',
  HTML: '#e34c26',
  Astro: '#ff5d01',
  Rust: '#dea584',
  Go: '#00ADD8',
  Ruby: '#701516',
  Java: '#b07219',
  Kotlin: '#A97BFF',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Shell: '#89e051',
  PHP: '#4F5D95',
  Lua: '#000080',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Solidity: '#AA6746',
  TeX: '#3D6117',
  PowerShell: '#012456',
  R: '#198CE7',
  Scala: '#c22d40',
  'Jupyter Notebook': '#DA5B0B',
  SCSS: '#c6538c',
  Sass: '#a53b70',
  Vim: '#199f4b',
  Makefile: '#427819',
  YAML: '#cb171e',
}
export const colorFor = (name: string): string => LANG_COLOR[name] || '#888888'
