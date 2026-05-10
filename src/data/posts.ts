// LinkedIn posts surfaced in the §06 Writing section.
// Add new ones at the top (most recent first). Excerpts are 1–2 sentences,
// edited from the original post — the goal is "would the reader click?",
// not a faithful copy.

export interface Post {
  date: string // human-readable, e.g. "May 2026"
  url: string
  title: string
  excerpt: string
  reactions: number
  comments: number
}

export const posts: Post[] = [
  {
    date: 'May 2026',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7456075541708800000/',
    title: 'On finishing a master’s degree',
    excerpt:
      'I started my master’s the same week I started my first full-time job at a startup. Two years of shipping during the day and asking, in class at night, whether the thing should exist at all.',
    reactions: 72,
    comments: 4,
  },
  {
    date: 'Apr 2026',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7452355251770298369/',
    title: 'If you vibe-coded your app, it’s probably already hacked.',
    excerpt:
      'AI ships code that runs. Engineering is the part it can’t fake. A field guide to the security holes vibe-coded apps quietly pile up — auth in the frontend, missing RLS, secrets in the repo.',
    reactions: 149,
    comments: 19,
  },
  {
    date: 'Dec 2025',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7370863516574117888/',
    title: 'When the fix isn’t code.',
    excerpt:
      'Instagram kept throwing captchas during dev — proxies, headless tweaks, cookie tricks, none of it stuck. The right call wasn’t more code; it was walking out of the Apple Store with a Mac mini and a new in-house server.',
    reactions: 49,
    comments: 2,
  },
  {
    date: 'Sep 2025',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7361123101708828672/',
    title: 'A startup is a marathon, not a sprint.',
    excerpt:
      'The first kilometers feel effortless. Then the road stretches. Progress is the daily grind, mentors are water stations, and the finish line changes who you had to become to get there.',
    reactions: 59,
    comments: 10,
  },
  {
    date: 'Jul 2025',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7348125874094755840/',
    title: 'Lessons from a turbo-charged first job.',
    excerpt:
      'It’s okay to fail, as long as tomorrow you’re better. You change hats every hour. What you do is noticed. Not everything is sunshine — but it’s been one of the best decisions I’ve made.',
    reactions: 54,
    comments: 13,
  },
]
