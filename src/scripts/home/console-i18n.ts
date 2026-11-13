// Locale picker for the home-page console. The canned output is too long to
// ship through data attributes on both pages, so each locale keeps its corpus
// in its own script module and the page language decides which one answers.
// Both root layouts stamp <html lang>, so it is always present.

import { EN } from './console-data'
import { ES } from './console-data-es'

// Values passed to the message functions are already HTML-escaped by the caller.
export interface ConsoleMessages {
  whoami: string
  devBoot: string
  ls: string
  notFound: (cmd: string) => string
  catMissing: string
  catNoFile: (file: string) => string
  cdHere: string
  cdReadOnly: (dir: string) => string
  uname: string
  uptime: (m: number, s: number) => string
  historyEmpty: string
  whichMissing: string
  whichNotFound: (cmd: string) => string
  manMissing: string
  manNone: (cmd: string) => string
  mkdirMissing: string
  mkdir: (name: string) => string
  rmdir: (name: string) => string
  touch: (name: string) => string
  rm: (name: string) => string
  mv: string
  cp: string
  sudo: string
  exit: string
  logout: string
  date: () => string
}

export interface ConsoleChatStrings {
  usage: string
  tooLong: (max: number) => string
  rateLimited: string
  busy: string
  conversationTooLong: string
  forbidden: string
  notConfigured: string
  unreachable: string
  interrupted: string
  error: (detail: string) => string
}

export interface ConsoleStrings {
  help: string[]
  about: string[]
  experience: string[]
  stack: string[]
  repos: string[]
  now: string[]
  contact: string[]
  source: string[]
  man: Record<string, string[]>
  msg: ConsoleMessages
  // Messages the AI bridge prints itself (see ./console-chat).
  chat: ConsoleChatStrings
  // Progress lines for the AI bridge (see ./console-steps).
  steps: Record<string, string>
}

// File names stay the same in every locale: they are what `cat` accepts.
export const CAT_FILES = ['about', 'experience', 'stack', 'repos', 'now', 'contact']

export function consoleStrings(): ConsoleStrings {
  const lang = document.documentElement.lang.toLowerCase()
  return lang.startsWith('es') ? ES : EN
}
