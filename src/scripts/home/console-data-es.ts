// Spanish corpus for the home-page console, mirroring ./console-data. Command
// and file names stay in English (they are what the shell accepts); everything
// the shell prints back is in Spanish.

import type { ConsoleMessages, ConsoleStrings } from './console-i18n'

const help = [
  '<b>info</b>',
  '  <span class="ac">whoami</span>          bio en una línea',
  '  <span class="ac">about</span>           la versión larga',
  '  <span class="ac">experience</span>      cargos, fechas, estudios',
  '  <span class="ac">stack</span>           las herramientas que uso',
  '  <span class="ac">repos</span>           repos públicos en github',
  '  <span class="ac">now</span>             en qué estoy esta semana',
  '  <span class="ac">contact</span>         correo y redes',
  '',
  '<b>archivos</b>',
  '  <span class="ac">ls</span>              lista los "archivos" disponibles',
  '  <span class="ac">cat</span> &lt;nombre&gt;    imprime un archivo (prueba <span class="ac">cat about</span>)',
  '  <span class="ac">pwd</span>             muestra el directorio actual',
  '  <span class="ac">cd</span> &lt;dir&gt;        cambia de directorio',
  '',
  '<b>sistema</b>',
  '  <span class="ac">date</span>            fecha y hora actual',
  '  <span class="ac">uname</span>           info del sistema',
  '  <span class="ac">uptime</span>          cuánto tiempo lleva abierta esta pestaña',
  '  <span class="ac">history</span>         tu historial de comandos',
  '  <span class="ac">which</span> &lt;cmd&gt;     dónde vive un comando',
  '  <span class="ac">man</span> &lt;cmd&gt;       qué hace un comando',
  '  <span class="ac">ps</span>              procesos falsos',
  '  <span class="ac">echo</span> &lt;texto&gt;    repite lo que escribas',
  '  <span class="ac">clear</span>           limpia la pantalla (también <kbd>Ctrl-L</kbd>)',
  '  <span class="ac">dev</span>             abre la interfaz tipo ide en /dev/',
  '',
  '<b>ia</b>',
  '  <span class="ac">kevin</span> &lt;pregunta&gt;  pregúntale al LLM (con Claude)',
  '  <span class="ac">ask</span>   &lt;pregunta&gt;  lo mismo que <span class="ac">kevin</span>',
  '',
  '<span class="muted">tip, <kbd>Tab</kbd> autocompleta, <kbd>↑</kbd>/<kbd>↓</kbd> recorre el historial, <kbd>Ctrl-W/U/K</kbd> para editar, <kbd>Ctrl-C</kbd> para cancelar</span>',
]

const about = [
  'Soy <b>Kevin Gámez</b>, ingeniero de software de Bogotá.',
  '',
  '<b>lo último</b>, founding engineer en <span class="ac">enttor</span>: plataforma de paid ads, un agente',
  '<span class="cs-pad cs-pad-s"></span>de slack y un estudio creativo con IA, sobre Next.js + Supabase + Postgres. buscando lo que sigue.',
  '<b>antes</b>, product engineer en <span class="ac">samsam</span> (marketplace de e-commerce).',
  '<b>estudios</b>, maestría y pregrado en la Universidad de los Andes.',
  '',
  'Escribe <span class="ac">experience</span> para ver la línea de tiempo completa, o',
  '<span class="ac">kevin "tu pregunta"</span> para hablar con la IA.',
]

const experience = [
  '<span class="muted">Mar 2025, Jul 2026</span> Founding engineer <span class="at">@ Enttor</span>',
  '<span class="cs-pad"></span>Plataforma de paid ads, agente de slack, estudio creativo con IA',
  '',
  '<span class="muted">Feb 2024, Mar 2025</span> Product engineer <span class="at">@ Samsam</span>',
  '<span class="cs-pad"></span>Marketplace de e-commerce, React Native, Next.js',
  '',
  '<span class="muted">Oct 2022, Dic 2023</span> Software engineer <span class="at">@ Heinsohn</span>',
  '<span class="cs-pad"></span>CI/CD en Azure, servicio de reportes en Python, Power BI',
  '',
  '<span class="muted">Ene 2024, May 2025</span> Maestría en Ingeniería de Información <span class="at">@ Uniandes</span>',
  '',
  '<span class="muted">Ene 2019, Dic 2023</span> Ingeniería de Sistemas y Computación <span class="at">@ Uniandes</span>',
  '<span class="cs-pad"></span>Distinción Nacional Andrés Bello, certificaciones de AWS',
]

const stack = [
  '<b>frontend</b>   next.js, react, react native, expo, tailwind',
  '<b>backend </b>   nestjs, trpc, prisma, postgres, redis, supabase',
  '<b>ia / ml </b>   claude, openai, rag con pgvector, mcp, pytorch',
  '<b>infra   </b>   vercel, aws, docker, modal, ci/cd',
]

const repos = [
  'kevingamez/<span class="ac">personal-site</span>            <span class="muted">typescript, esta página</span>',
  'kevingamez/<span class="ac">AD_ASTRA2023-SpaceInvaders</span>  <span class="muted">python, deforestación aérea, opencv + yolov5</span>',
  'kevingamez/<span class="ac">Palladium_Chat</span>           <span class="muted">typescript</span>',
  'kevingamez/<span class="ac">budget-app</span>               <span class="muted">swift</span>',
  'kevingamez/<span class="ac">GCP-CloudRun</span>             <span class="muted">dockerfile</span>',
  '',
  '→ <a href="https://github.com/kevingamez" target="_blank" rel="noopener">github.com/kevingamez</a>, 28 repos públicos',
]

const now = [
  'estado     <b>entre trabajos</b>, abierto a roles de founding engineer',
  'lo último  <b>plataforma de paid ads, agente de slack, estudio de anuncios</b> en enttor, meta y tiktok',
  'cacharreo  <b>agentes con LLM</b> y automatización de navegador, y este sitio',
]

const contact = [
  '<b>correo  </b>  <a href="mailto:kevingamez.kg@gmail.com">kevingamez.kg@gmail.com</a>',
  '<b>github  </b>  <a href="https://github.com/kevingamez" target="_blank" rel="noopener">github.com/kevingamez</a>',
  '<b>linkedin</b>  <a href="https://www.linkedin.com/in/kevin-gamez/" target="_blank" rel="noopener">linkedin.com/in/kevin-gamez</a>',
  '<b>x       </b>  <a href="https://x.com/KevinGamezA" target="_blank" rel="noopener">x.com/KevinGamezA</a>',
]

const source = [
  '<b>mapa del código</b>',
  '  <a href="https://github.com/kevingamez/personal-site" target="_blank" rel="noopener">github.com/kevingamez/personal-site</a>',
  '  <a href="/humans.txt">/humans.txt</a>    créditos y notas de construcción',
  '  <a href="/robots.txt">/robots.txt</a>    instrucciones para crawlers',
  '  <a href="/dev/">/dev/</a>           otra interfaz del portafolio',
]

const RO = 'solo lectura.'

const man: Record<string, string[]> = {
  help: ['<b>HELP</b>(1)', '  lista todos los comandos que conoce esta shell.'],
  whoami: ['<b>WHOAMI</b>(1)', '  imprime una bio de una línea.'],
  about: ['<b>ABOUT</b>(1)', '  imprime la bio larga (~6 líneas).'],
  experience: ['<b>EXPERIENCE</b>(1)', '  imprime cargos, fechas y estudios.'],
  stack: ['<b>STACK</b>(1)', '  imprime las herramientas que uso.'],
  repos: ['<b>REPOS</b>(1)', '  lista los repos públicos en github.'],
  now: ['<b>NOW</b>(1)', '  en qué estoy trabajando ahora.'],
  contact: ['<b>CONTACT</b>(1)', '  correo y redes.'],
  source: ['<b>SOURCE</b>(1)', '  enlaces para quien quiera leer el código.'],
  dev: ['<b>DEV</b>(1)', '  abre la interfaz estilo vs code en /dev/. es la única entrada.'],
  date: ['<b>DATE</b>(1)', '  imprime la fecha actual.'],
  uname: ['<b>UNAME</b>(1)', '  imprime info del sistema.'],
  uptime: ['<b>UPTIME</b>(1)', '  cuánto tiempo lleva abierta esta pestaña.'],
  history: ['<b>HISTORY</b>(1)', '  lista los comandos que has escrito en esta sesión.'],
  which: [
    '<b>WHICH</b>(1)',
    '  which &lt;cmd&gt; , dónde vive un comando. (siempre /usr/local/bin/X.)',
  ],
  man: ['<b>MAN</b>(1)', '  man &lt;cmd&gt; , documentación corta de un comando.'],
  clear: ['<b>CLEAR</b>(1)', '  limpia la pantalla. <kbd>Ctrl-L</kbd> hace lo mismo.'],
  echo: ['<b>ECHO</b>(1)', '  echo &lt;texto&gt; , repite el texto.'],
  ls: ['<b>LS</b>(1)', '  lista los "archivos" de este sistema de archivos ficticio.'],
  cat: [
    '<b>CAT</b>(1)',
    '  cat &lt;nombre&gt; , imprime un archivo. archivos: about, experience, stack, repos, now, contact.',
  ],
  pwd: ['<b>PWD</b>(1)', '  muestra el directorio actual. siempre /home/kevin.'],
  cd: ['<b>CD</b>(1)', '  cd &lt;dir&gt; , solo existe /home/kevin.'],
  ps: ['<b>PS</b>(1)', '  lista procesos (falsos).'],
  mkdir: ['<b>MKDIR</b>(1)', '  este sistema es de solo lectura. mkdir siempre falla.'],
  rmdir: ['<b>RMDIR</b>(1)', '  este sistema es de solo lectura. rmdir siempre falla.'],
  touch: ['<b>TOUCH</b>(1)', '  este sistema es de solo lectura. touch siempre falla.'],
  rm: ['<b>RM</b>(1)', '  este sistema es de solo lectura. rm siempre falla.'],
  mv: ['<b>MV</b>(1)', '  este sistema es de solo lectura.'],
  cp: ['<b>CP</b>(1)', '  este sistema es de solo lectura.'],
  sudo: ['<b>SUDO</b>(1)', '  no disponible.'],
  exit: ['<b>EXIT</b>(1)', '  no hace nada. esto es una página web.'],
  logout: ['<b>LOGOUT</b>(1)', '  no hace nada. esto es una página web.'],
  kevin: [
    '<b>KEVIN</b>(1)',
    '  kevin &lt;pregunta&gt; , envía tu pregunta a /api/chat y transmite la respuesta de Claude.',
    '  ejemplo: <span class="ac">kevin "¿qué hace enttor?"</span>',
  ],
  ask: ['<b>ASK</b>(1)', '  lo mismo que <span class="ac">kevin</span>.'],
}

const muted = (s: string): string => `<span class="muted">${s}</span>`

const msg: ConsoleMessages = {
  whoami:
    'kevin, founding engineer, hasta hace poco @ <span class="ac">enttor</span>, <span class="muted">bogotá / utc-5</span>',
  devBoot: 'iniciando <span class="ac">/dev/</span>, la interfaz tipo ide...',
  ls: 'about  experience  stack  repos  now  contact  <span class="muted">(prueba `cat about`)</span>',
  notFound: (c) => `zsh: comando no encontrado: ${c}, prueba <span class="ac">help</span>`,
  catMissing: 'cat: falta el archivo, prueba `cat about`',
  catNoFile: (f) => `cat: ${f}: no existe ese archivo`,
  cdHere: muted('ya estás ahí.'),
  cdReadOnly: (d) =>
    `cd: ${muted(d)}, este sitio es casi todo de solo lectura. prueba <span class="ac">ls</span>.`,
  uname: 'kevingamez.co, build de next.js',
  uptime: (m, s) => `abierta hace ${m}m ${s}s`,
  historyEmpty: muted('(vacío)'),
  whichMissing: 'which: falta el comando',
  whichNotFound: (c) => `which: ${c}: no encontrado`,
  manMissing: 'man: falta el comando, ¿qué página quieres ver?',
  manNone: (c) => `No hay entrada de manual para ${c}`,
  mkdirMissing: 'mkdir: falta el nombre',
  mkdir: (n) => `mkdir: no se puede crear el directorio ‘${n}’: ${muted('sistema de ' + RO)}`,
  rmdir: (n) => `rmdir: ‘${n}’: sistema de ${RO}`,
  touch: (n) => `touch: no se puede crear ‘${n}’: ${muted('sistema de ' + RO)}`,
  rm: (n) => `rm: no se puede borrar ‘${n}’: ${muted('sistema de ' + RO)}`,
  mv: `mv: ${muted('sistema de ' + RO)}`,
  cp: `cp: ${muted('sistema de ' + RO)}`,
  sudo: 'sudo: no disponible.',
  exit: muted('no hay nada de qué salir. esto es una página web.'),
  logout: muted('no hay sesión que cerrar. esto es una página web.'),
  date: () => new Date().toLocaleString('es-CO', { dateStyle: 'full', timeStyle: 'long' }),
}

export const ES: ConsoleStrings = {
  help,
  about,
  experience,
  stack,
  repos,
  now,
  contact,
  source,
  man,
  msg,
  chat: {
    usage: 'uso: kevin "tu pregunta"',
    tooLong: (max) => `pregunta demasiado larga, que no pase de ${max} caracteres.`,
    busy: 'el asistente está ocupado ahora mismo. intenta más tarde.',
    rateLimited: 'límite de mensajes del día alcanzado. intenta mañana.',
    conversationTooLong:
      'esta conversación quedó muy larga. recarga la página para empezar de nuevo.',
    forbidden: 'esta consola solo responde a peticiones desde kevingamez.co.',
    notConfigured:
      'el backend de IA no está configurado aquí. la shell sigue funcionando, prueba `help`.',
    unreachable:
      'no se pudo conectar con el backend de IA. la shell sigue funcionando, prueba `help`.',
    interrupted: 'petición interrumpida, intenta de nuevo.',
    // The server words its detail in English, so it is not passed through.
    error: () => '[error: algo falló al generar la respuesta.]',
  },
  steps: {
    thinking: 'pensando',
    web_search: 'buscando en la web',
    get_site_data: 'leyendo datos del sitio',
    get_strava_stats: 'leyendo estadísticas de entrenamiento',
  },
}
