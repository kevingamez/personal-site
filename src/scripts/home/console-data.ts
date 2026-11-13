// English corpus for the home-page console: the canned command output, man
// pages, and the one-line messages the built-ins print. Pure data; the page
// language picks this or ./console-data-es (see ./console-i18n).

import type { ConsoleMessages, ConsoleStrings } from './console-i18n'

const help = [
  '<b>info</b>',
  '  <span class="ac">whoami</span>          one-line bio',
  '  <span class="ac">about</span>           the long version',
  '  <span class="ac">experience</span>      roles, dates, education',
  '  <span class="ac">stack</span>           tools I use',
  '  <span class="ac">repos</span>           public github repos',
  '  <span class="ac">now</span>             what I’m working on this week',
  '  <span class="ac">contact</span>         email + socials',
  '',
  '<b>files</b>',
  '  <span class="ac">ls</span>              list available "files"',
  '  <span class="ac">cat</span> &lt;name&gt;      print a file (try <span class="ac">cat about</span>)',
  '  <span class="ac">pwd</span>             print working directory',
  '  <span class="ac">cd</span> &lt;dir&gt;        change directory',
  '',
  '<b>system</b>',
  '  <span class="ac">date</span>            current date',
  '  <span class="ac">uname</span>           kernel info',
  '  <span class="ac">uptime</span>          how long this tab has been open',
  '  <span class="ac">history</span>         your command history',
  '  <span class="ac">which</span> &lt;cmd&gt;     where a command lives',
  '  <span class="ac">man</span> &lt;cmd&gt;       what a command does',
  '  <span class="ac">ps</span>              fake processes',
  '  <span class="ac">echo</span> &lt;text&gt;     repeat back',
  '  <span class="ac">clear</span>           clear the screen (also <kbd>Ctrl-L</kbd>)',
  '  <span class="ac">dev</span>             boot the ide interface at /dev/',
  '',
  '<b>ai</b>',
  '  <span class="ac">kevin</span> &lt;question&gt;  ask the LLM (powered by Claude)',
  '  <span class="ac">ask</span>   &lt;question&gt;  alias for <span class="ac">kevin</span>',
  '',
  '<span class="muted">tip, <kbd>Tab</kbd> autocompletes, <kbd>↑</kbd>/<kbd>↓</kbd> for history, <kbd>Ctrl-W/U/K</kbd> to edit, <kbd>Ctrl-C</kbd> to cancel</span>',
]

const about = [
  "I'm <b>Kevin Gámez</b>, a software engineer from Bogotá.",
  '',
  '<b>last</b>, founding engineer at <span class="ac">enttor</span> - paid ads platform, a slack agent,',
  '<span class="cs-pad cs-pad-s"></span>an AI creative studio, on Next.js + Supabase + Postgres. looking for the next thing.',
  '<b>before</b>, product engineer at <span class="ac">samsam</span> (e-commerce marketplace).',
  '<b>school</b>, M.Sc. + B.Sc. at Universidad de los Andes.',
  '',
  'Type <span class="ac">experience</span> for the full timeline, or',
  '<span class="ac">kevin "your question"</span> to chat with the AI.',
]

const experience = [
  '<span class="muted">Mar 2025, Jul 2026</span> Founding engineer <span class="at">@ Enttor</span>',
  '<span class="cs-pad"></span>Paid ads platform, slack agent, AI creative studio',
  '',
  '<span class="muted">Feb 2024, Mar 2025</span> Product engineer <span class="at">@ Samsam</span>',
  '<span class="cs-pad"></span>E-commerce marketplace, React Native, Next.js',
  '',
  '<span class="muted">Oct 2022, Dec 2023</span> Software engineer <span class="at">@ Heinsohn</span>',
  '<span class="cs-pad"></span>Azure CI/CD, Python reporting service, Power BI',
  '',
  '<span class="muted">Jan 2024, May 2025</span> M.Sc. Information Engineering <span class="at">@ Uniandes</span>',
  '',
  '<span class="muted">Jan 2019, Dec 2023</span> B.Sc. Systems and Computing <span class="at">@ Uniandes</span>',
  '<span class="cs-pad"></span>Andrés Bello National Distinction, AWS certs',
]

const stack = [
  '<b>frontend</b>   next.js, react, react native, expo, tailwind',
  '<b>backend </b>   nestjs, trpc, prisma, postgres, redis, supabase',
  '<b>ai / ml </b>   claude, openai, pgvector rag, mcp, pytorch',
  '<b>infra   </b>   vercel, aws, docker, modal, ci/cd',
]

const repos = [
  'kevingamez/<span class="ac">personal-site</span>            <span class="muted">typescript, this page</span>',
  'kevingamez/<span class="ac">AD_ASTRA2023-SpaceInvaders</span>  <span class="muted">python, aerial deforestation, opencv + yolov5</span>',
  'kevingamez/<span class="ac">Palladium_Chat</span>           <span class="muted">typescript</span>',
  'kevingamez/<span class="ac">budget-app</span>               <span class="muted">swift</span>',
  'kevingamez/<span class="ac">GCP-CloudRun</span>             <span class="muted">dockerfile</span>',
  '',
  '→ <a href="https://github.com/kevingamez" target="_blank" rel="noopener">github.com/kevingamez</a>, 28 public repos',
]

const now = [
  'status    <b>between roles</b>, open to founding-engineer roles',
  'last      <b>paid ads platform, slack agent, ad studio</b> at enttor, meta and tiktok',
  'tinkering <b>LLM agents</b> and browser automation, plus this site',
]

const contact = [
  '<b>email   </b>  <a href="mailto:kevingamez.kg@gmail.com">kevingamez.kg@gmail.com</a>',
  '<b>github  </b>  <a href="https://github.com/kevingamez" target="_blank" rel="noopener">github.com/kevingamez</a>',
  '<b>linkedin</b>  <a href="https://www.linkedin.com/in/kevin-gamez/" target="_blank" rel="noopener">linkedin.com/in/kevin-gamez</a>',
  '<b>x       </b>  <a href="https://x.com/KevinGamezA" target="_blank" rel="noopener">x.com/KevinGamezA</a>',
]

const source = [
  '<b>source map</b>',
  '  <a href="https://github.com/kevingamez/personal-site" target="_blank" rel="noopener">github.com/kevingamez/personal-site</a>',
  '  <a href="/humans.txt">/humans.txt</a>    credits and build notes',
  '  <a href="/robots.txt">/robots.txt</a>    crawler instructions',
  '  <a href="/dev/">/dev/</a>           alternate portfolio interface',
]

const man: Record<string, string[]> = {
  help: ['<b>HELP</b>(1)', '  list every command this shell knows.'],
  whoami: ['<b>WHOAMI</b>(1)', '  print a one-line bio.'],
  about: ['<b>ABOUT</b>(1)', '  print the longer bio (~6 lines).'],
  experience: ['<b>EXPERIENCE</b>(1)', '  print roles, dates, education.'],
  stack: ['<b>STACK</b>(1)', '  print the tools I use.'],
  repos: ['<b>REPOS</b>(1)', '  list public github repos.'],
  now: ['<b>NOW</b>(1)', '  what I’m working on right now.'],
  contact: ['<b>CONTACT</b>(1)', '  email + social links.'],
  source: ['<b>SOURCE</b>(1)', '  print links for source readers.'],
  dev: ['<b>DEV</b>(1)', '  boot the vs code-styled interface at /dev/. the only way in.'],
  date: ['<b>DATE</b>(1)', '  print the current date.'],
  uname: ['<b>UNAME</b>(1)', '  print system info.'],
  uptime: ['<b>UPTIME</b>(1)', '  how long this tab has been open.'],
  history: ['<b>HISTORY</b>(1)', '  list the commands you’ve typed in this session.'],
  which: [
    '<b>WHICH</b>(1)',
    '  which &lt;cmd&gt; , where a command lives. (always /usr/local/bin/X.)',
  ],
  man: ['<b>MAN</b>(1)', '  man &lt;cmd&gt; , short docs for a command.'],
  clear: ['<b>CLEAR</b>(1)', '  clear the screen. <kbd>Ctrl-L</kbd> does the same.'],
  echo: ['<b>ECHO</b>(1)', '  echo &lt;text&gt; , print text back.'],
  ls: ['<b>LS</b>(1)', '  list available "files" in this fake fs.'],
  cat: [
    '<b>CAT</b>(1)',
    '  cat &lt;name&gt; , print a file. files: about, experience, stack, repos, now, contact.',
  ],
  pwd: ['<b>PWD</b>(1)', '  print working directory. always /home/kevin.'],
  cd: ['<b>CD</b>(1)', '  cd &lt;dir&gt; , only /home/kevin exists.'],
  ps: ['<b>PS</b>(1)', '  list (fake) processes.'],
  mkdir: ['<b>MKDIR</b>(1)', '  this fs is read-only. mkdir always fails.'],
  rmdir: ['<b>RMDIR</b>(1)', '  this fs is read-only. rmdir always fails.'],
  touch: ['<b>TOUCH</b>(1)', '  this fs is read-only. touch always fails.'],
  rm: ['<b>RM</b>(1)', '  this fs is read-only. rm always fails.'],
  mv: ['<b>MV</b>(1)', '  this fs is read-only.'],
  cp: ['<b>CP</b>(1)', '  this fs is read-only.'],
  sudo: ['<b>SUDO</b>(1)', '  not available.'],
  exit: ['<b>EXIT</b>(1)', '  does nothing. this is a web page.'],
  logout: ['<b>LOGOUT</b>(1)', '  does nothing. this is a web page.'],
  kevin: [
    '<b>KEVIN</b>(1)',
    '  kevin &lt;question&gt; , POST your question to /api/chat and stream back a Claude reply.',
    '  example: <span class="ac">kevin "what does enttor do?"</span>',
  ],
  ask: ['<b>ASK</b>(1)', '  alias for <span class="ac">kevin</span>.'],
}

const RO = '<span class="muted">read-only file system.</span>'

const msg: ConsoleMessages = {
  whoami:
    'kevin, founding engineer, most recently @ <span class="ac">enttor</span>, <span class="muted">bogotá / utc-5</span>',
  devBoot: 'booting <span class="ac">/dev/</span>, the ide interface...',
  ls: 'about  experience  stack  repos  now  contact  <span class="muted">(try `cat about`)</span>',
  notFound: (c) => `zsh: command not found: ${c}, try <span class="ac">help</span>`,
  catMissing: 'cat: missing operand, try `cat about`',
  catNoFile: (f) => `cat: ${f}: no such file`,
  cdHere: '<span class="muted">already there.</span>',
  cdReadOnly: (d) =>
    `cd: <span class="muted">${d}</span>, this site is mostly read-only. try <span class="ac">ls</span>.`,
  uname: 'kevingamez.co, next.js build',
  uptime: (m, s) => `up ${m}m ${s}s`,
  historyEmpty: '<span class="muted">(empty)</span>',
  whichMissing: 'which: missing operand',
  whichNotFound: (c) => `which: ${c}: not found`,
  manMissing: 'man: missing operand, what page do you want?',
  manNone: (c) => `No manual entry for ${c}`,
  mkdirMissing: 'mkdir: missing operand',
  mkdir: (n) => `mkdir: cannot create directory ‘${n}’: ${RO}`,
  rmdir: (n) => `rmdir: ‘${n}’: read-only file system.`,
  touch: (n) => `touch: cannot touch ‘${n}’: ${RO}`,
  rm: (n) => `rm: cannot remove ‘${n}’: ${RO}`,
  mv: `mv: ${RO}`,
  cp: `cp: ${RO}`,
  sudo: 'sudo: not available.',
  exit: '<span class="muted">nothing to exit. this is a web page.</span>',
  logout: '<span class="muted">nothing to log out of. this is a web page.</span>',
  date: () => new Date().toString(),
}

export const EN: ConsoleStrings = {
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
    usage: 'usage: kevin "your question"',
    tooLong: (max) => `question too long, keep it under ${max} characters.`,
    busy: 'the assistant is busy right now. try again later.',
    rateLimited: 'rate limited, daily message cap reached. try tomorrow.',
    conversationTooLong: 'this conversation got too long. reload the page to start fresh.',
    forbidden: 'this console only answers requests from kevingamez.co.',
    notConfigured: 'the AI backend is not configured here. the shell still works - try `help`.',
    unreachable: 'could not reach the AI backend. the shell still works - try `help`.',
    interrupted: 'request interrupted - try again.',
    error: (detail) => `[error: ${detail}]`,
  },
  steps: {
    thinking: 'thinking',
    web_search: 'searching the web',
    get_site_data: 'reading site data',
    get_strava_stats: 'reading training stats',
  },
}
