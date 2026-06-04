// Static content for the home-page console: the canned command output, man
// pages, and the file list used by tab-completion. Pure data, no logic.

export const HELP_LINES = [
  '<b>info</b>',
  '  <span class="ac">whoami</span>          one-line bio',
  '  <span class="ac">about</span>           the long version',
  '  <span class="ac">experience</span>      trajectory · roles · dates',
  '  <span class="ac">stack</span>           tools I actually reach for',
  '  <span class="ac">repos</span>           public github repos',
  '  <span class="ac">now</span>             what I’m working on this week',
  '  <span class="ac">contact</span>         email + socials',
  '',
  '<b>files</b>',
  '  <span class="ac">ls</span>              list available "files"',
  '  <span class="ac">cat</span> &lt;name&gt;      print a file (try <span class="ac">cat about</span>)',
  '  <span class="ac">pwd</span>             print working directory',
  '  <span class="ac">cd</span> &lt;dir&gt;        change directory (sort of)',
  '',
  '<b>system</b>',
  '  <span class="ac">date</span>            current date',
  '  <span class="ac">uname</span>           kernel info',
  '  <span class="ac">uptime</span>          how long this tab has been alive',
  '  <span class="ac">history</span>         your command history',
  '  <span class="ac">which</span> &lt;cmd&gt;     where a command lives',
  '  <span class="ac">man</span> &lt;cmd&gt;       what a command does',
  '  <span class="ac">ps</span>              fake processes',
  '  <span class="ac">echo</span> &lt;text&gt;     repeat back',
  '  <span class="ac">clear</span>           clear the screen (also <kbd>Ctrl-L</kbd>)',
  '',
  '<b>ai</b>',
  '  <span class="ac">kevin</span> &lt;question&gt;  ask the LLM (powered by Claude)',
  '  <span class="ac">ask</span>   &lt;question&gt;  alias for <span class="ac">kevin</span>',
  '',
  '<span class="muted">tip · <kbd>Tab</kbd> autocompletes · <kbd>↑</kbd>/<kbd>↓</kbd> for history · <kbd>Ctrl-W/U/K</kbd> to edit · <kbd>Ctrl-C</kbd> to cancel</span>',
]

export const ABOUT_LINES = [
  "I'm <b>Kevin Gámez</b>, a software engineer from Bogotá.",
  '',
  '<b>now</b> · founding engineer at <span class="ac">enttor</span> - AI outbound, browser automation,',
  '       OpenAI pipelines on Next.js + NestJS + Postgres.',
  '<b>before</b> · founding engineer at <span class="ac">samsam</span> (e-commerce marketplace).',
  '<b>school</b> · M.Sc. + B.Sc. at Universidad de los Andes (deep-learning specialization).',
  '',
  'Type <span class="ac">experience</span> for the full timeline, or',
  '<span class="ac">kevin "your question"</span> to chat with the AI.',
]

export const EXPERIENCE_LINES = [
  '<span class="muted">Jun 2025 · now</span>      Founding engineer <span class="at">@ Enttor</span>',
  '                       AI outbound · browser automation · OpenAI pipelines',
  '',
  '<span class="muted">Feb 2024 · Mar 2025</span> Founding engineer <span class="at">@ Samsam</span>',
  '                       E-commerce marketplace · React Native · Next.js',
  '',
  '<span class="muted">Jan 2024 · May 2025</span> M.Sc. Information Engineering <span class="at">@ Uniandes</span>',
  '                       Deep-learning specialization · graduate TA',
  '',
  '<span class="muted">Jan 2019 · Dec 2023</span> B.Sc. Systems and Computing <span class="at">@ Uniandes</span>',
  '                       Andrés Bello National Distinction · AWS certs',
]

export const STACK_LINES = [
  '<b>frontend</b>   next.js · react · react native · astro · tailwind',
  '<b>backend </b>   nestjs · postgres · prisma · supabase · inngest',
  '<b>ai / ml </b>   openai · pytorch · opencv · browser automation',
  '<b>infra   </b>   vercel · aws · cloud run · docker',
]

export const REPOS_LINES = [
  'kevingamez/<span class="ac">personal-site</span>            <span class="muted">typescript · this page</span>',
  'kevingamez/<span class="ac">AD_ASTRA2023-SpaceInvaders</span>  <span class="muted">python · aerial deforestation, opencv + yolov5</span>',
  'kevingamez/<span class="ac">Palladium_Chat</span>           <span class="muted">typescript</span>',
  'kevingamez/<span class="ac">budget-app</span>               <span class="muted">swift</span>',
  'kevingamez/<span class="ac">GCP-CloudRun</span>             <span class="muted">dockerfile</span>',
  '',
  '→ <a href="https://github.com/kevingamez" target="_blank" rel="noopener">github.com/kevingamez</a> · 28 public repos',
]

export const NOW_LINES = [
  'building   · <b>eval-as-a-service</b> at enttor - brand-fit evals over an API',
  "reading    · <i>A Mathematician's Apology</i>, Hardy. Slim, beautiful.",
  'thinking   · knot invariants, specifically the Jones polynomial.',
]

export const CONTACT_LINES = [
  '<b>email   </b>  <a href="mailto:kevingamez.kg@gmail.com">kevingamez.kg@gmail.com</a>',
  '<b>github  </b>  <a href="https://github.com/kevingamez" target="_blank" rel="noopener">github.com/kevingamez</a>',
  '<b>linkedin</b>  <a href="https://co.linkedin.com/in/kevin-gamez/" target="_blank" rel="noopener">linkedin.com/in/kevin-gamez</a>',
  '<b>x       </b>  <a href="https://x.com/KevinGamezA" target="_blank" rel="noopener">x.com/KevinGamezA</a>',
]

export const CAT_FILES = ['about', 'experience', 'stack', 'repos', 'now', 'contact']

export const MAN_PAGES: Record<string, string[]> = {
  help: ['<b>HELP</b>(1)', '  list every command this shell knows.'],
  whoami: ['<b>WHOAMI</b>(1)', '  print a one-line bio.'],
  about: ['<b>ABOUT</b>(1)', '  print the longer bio (~6 lines).'],
  experience: ['<b>EXPERIENCE</b>(1)', '  print the trajectory: roles, dates, education.'],
  stack: ['<b>STACK</b>(1)', '  print the tools I actually reach for.'],
  repos: ['<b>REPOS</b>(1)', '  list public github repos.'],
  now: ['<b>NOW</b>(1)', '  what I’m building / reading / thinking about.'],
  contact: ['<b>CONTACT</b>(1)', '  email + social links.'],
  date: ['<b>DATE</b>(1)', '  print the current date.'],
  uname: ['<b>UNAME</b>(1)', '  print system identity (it lies).'],
  uptime: ['<b>UPTIME</b>(1)', '  how long this tab has been open.'],
  history: ['<b>HISTORY</b>(1)', '  list the commands you’ve typed in this session.'],
  which: [
    '<b>WHICH</b>(1)',
    '  which &lt;cmd&gt;  · where a command lives. (always /usr/local/bin/X.)',
  ],
  man: ['<b>MAN</b>(1)', '  man &lt;cmd&gt;  · short docs for a command.'],
  clear: ['<b>CLEAR</b>(1)', '  clear the screen. <kbd>Ctrl-L</kbd> does the same.'],
  echo: ['<b>ECHO</b>(1)', '  echo &lt;text&gt;  · print text back.'],
  ls: ['<b>LS</b>(1)', '  list available "files" in this fake fs.'],
  cat: [
    '<b>CAT</b>(1)',
    '  cat &lt;name&gt;  · print a file. files: about, experience, stack, repos, now, contact.',
  ],
  pwd: ['<b>PWD</b>(1)', '  print working directory. always /home/kevin.'],
  cd: ['<b>CD</b>(1)', '  cd is mostly decorative - there’s nowhere else to go.'],
  ps: ['<b>PS</b>(1)', '  list (fake) processes.'],
  mkdir: ['<b>MKDIR</b>(1)', '  this fs is read-only. mkdir always fails.'],
  rmdir: ['<b>RMDIR</b>(1)', '  this fs is read-only. rmdir always fails.'],
  touch: ['<b>TOUCH</b>(1)', '  this fs is read-only. touch always fails.'],
  rm: ['<b>RM</b>(1)', '  this fs is read-only. rm always fails (mercifully).'],
  mv: ['<b>MV</b>(1)', '  this fs is read-only.'],
  cp: ['<b>CP</b>(1)', '  this fs is read-only.'],
  sudo: ['<b>SUDO</b>(1)', '  not on my watch.'],
  exit: ['<b>EXIT</b>(1)', '  there is no exit.'],
  logout: ['<b>LOGOUT</b>(1)', '  there is no exit.'],
  kevin: [
    '<b>KEVIN</b>(1)',
    '  kevin &lt;question&gt;  · POST your question to /api/chat and stream back a Claude reply.',
    '  example: <span class="ac">kevin "what does enttor do?"</span>',
  ],
  ask: ['<b>ASK</b>(1)', '  alias for <span class="ac">kevin</span>.'],
}
