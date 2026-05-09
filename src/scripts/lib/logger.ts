// Lightweight, scoped, level-aware client logger.
// `debug` is silenced in production. Everything else uses console.* directly
// so DevTools shows the right severity icon and source map.

type Level = 'debug' | 'info' | 'warn' | 'error'

const isProd = import.meta.env.PROD

function emit(level: Level, scope: string, msg: string, data?: unknown): void {
  if (isProd && level === 'debug') return
  const tag = `%c[${scope}]%c ${msg}`
  const tagStyle = 'color:#d96944;font-weight:600'
  const reset = 'color:inherit;font-weight:normal'
  const fn =
    level === 'debug'
      ? console.debug
      : level === 'warn'
        ? console.warn
        : level === 'error'
          ? console.error
          : console.info
  if (data !== undefined) fn(tag, tagStyle, reset, data)
  else fn(tag, tagStyle, reset)
}

export interface Logger {
  debug: (msg: string, data?: unknown) => void
  info: (msg: string, data?: unknown) => void
  warn: (msg: string, data?: unknown) => void
  error: (msg: string, data?: unknown) => void
}

export function logger(scope: string): Logger {
  return {
    debug: (msg, data) => emit('debug', scope, msg, data),
    info: (msg, data) => emit('info', scope, msg, data),
    warn: (msg, data) => emit('warn', scope, msg, data),
    error: (msg, data) => emit('error', scope, msg, data),
  }
}
