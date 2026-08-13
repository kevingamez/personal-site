// Site-data tool for /api/chat: get_site_data + the readers behind it.
//
// The system prompt in chat-prompt.ts is a static summary, so the model used to
// answer "how many commits went into the ad studio" or "what has he written"
// with a shrug or, worse, an invention. Everything below is already in the repo
// as plain data the site itself renders, so the tool reads the same source the
// pages do and the answer can never drift from what a visitor sees.
//
// ONE tool with a topic enum rather than three tools: every definition is sent
// with every request, so three descriptions would be paid for on every chat,
// including the ones that never ask about any of this.

import Anthropic from '@anthropic-ai/sdk'

import { resumeEn } from '@/content/resume-en'
import { posts } from '@/data/posts'
import { yearProjects, yearProjectsCapturedAt } from '@/data/year-projects'

// A post body is the full verbatim LinkedIn text, which can run many hundreds
// of words. The model only needs enough to recognize and summarize the piece.
const POST_EXCERPT_CHARS = 320
const MAX_POSTS = 6

function resumeText(): string {
  const lines = [`Kevin Gámez, ${resumeEn.contactLocation}.`, resumeEn.summary, '', 'EXPERIENCE']
  for (const e of resumeEn.experience) {
    lines.push(`- ${e.role} at ${e.at} (${e.dates}, ${e.meta}):`)
    for (const b of e.bullets) lines.push(`  - ${b}`)
  }
  lines.push('', 'EDUCATION')
  for (const e of resumeEn.education) {
    lines.push(`- ${e.role}, ${e.at} (${e.dates}). ${e.bullets.join(' ')}`)
  }
  lines.push('', 'SKILLS')
  for (const s of resumeEn.skills) lines.push(`- ${s.term}: ${s.desc}`)
  return lines.join('\n')
}

function projectsText(): string {
  // Sorted by Kevin's own commits so the model leads with the real workhorse
  // instead of whatever happens to sit first in the file.
  const ranked = [...yearProjects].sort((a, b) => b.commits - a.commits)
  const total = ranked.reduce((sum, p) => sum + p.commits, 0)
  const lines = [
    `What Kevin was actively building over the trailing 12 months, from git log --author on each repo (captured ${yearProjectsCapturedAt}). These are HIS OWN commits inside that window, ${total} in total across ${ranked.length} products. Most of these repos are private, so the code is not public.`,
    '',
  ]
  for (const p of ranked) {
    const before = p.startedBefore ? ', already running when the window opened' : ''
    lines.push(`- ${p.label}: ${p.commits} commits, ${p.from} to ${p.to}${before}.`)
  }
  return lines.join('\n')
}

function writingText(): string {
  const lines = [
    `Kevin's writing, posted on LinkedIn and reproduced verbatim in the writing section of the site. ${posts.length} posts total, the ${Math.min(MAX_POSTS, posts.length)} most recent below. Excerpts are truncated; link to the post rather than quoting it whole.`,
    '',
  ]
  for (const p of posts.slice(0, MAX_POSTS)) {
    const body = p.body.replace(/\s+/g, ' ').trim()
    const excerpt =
      body.length > POST_EXCERPT_CHARS ? body.slice(0, POST_EXCERPT_CHARS) + '...' : body
    const reposts = p.reposts ? `, ${p.reposts} reposts` : ''
    lines.push(`- ${p.date} (${p.reactions} reactions, ${p.comments} comments${reposts})`)
    lines.push(`  ${excerpt}`)
    lines.push(`  ${p.url}`)
  }
  return lines.join('\n')
}

export const SITE_TOOL: Anthropic.Tool = {
  name: 'get_site_data',
  description:
    "Read Kevin's own records from this site. Call it before answering anything specific about his work history, output, or writing, and quote the numbers it returns rather than estimating. Topics: 'resume' for the full CV with per-role achievement bullets and measured results (revenue, latency, team size) that the summary above does not carry; 'projects' for what he was actually building over the last 12 months with his real commit count per product, including private work; 'writing' for his LinkedIn posts with excerpts, engagement counts and links. Takes one argument.",
  input_schema: {
    type: 'object',
    properties: {
      topic: {
        type: 'string',
        enum: ['resume', 'projects', 'writing'],
        description: 'Which record to read.',
      },
    },
    required: ['topic'],
  },
}

export function runSiteTool(input: unknown): string {
  const topic = (input as { topic?: string } | null)?.topic
  if (topic === 'resume') return resumeText()
  if (topic === 'projects') return projectsText()
  if (topic === 'writing') return writingText()
  return "Unknown topic. Valid topics are 'resume', 'projects' and 'writing'."
}
