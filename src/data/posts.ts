// LinkedIn posts surfaced in the §06 Writing section.
// Add new ones at the top (most recent first). Body keeps the original
// linebreaks (rendered with white-space: pre-wrap). `image` is an optional
// path under /public - drop a screenshot at /public/posts/<slug>.jpg.
//
// Bodies are kept verbatim from the original LinkedIn posts - do not
// rewrite for "polish". If a typo or phrasing is awkward, leave it; the
// LinkedIn post is the canonical version.

export interface Post {
  date: string // human-readable, e.g. "May 2026"
  url: string
  body: string
  images?: { src: string; alt?: string }[] // mirror LinkedIn's image grid
  reactions: number
  comments: number
  reposts?: number
}

export const posts: Post[] = [
  {
    date: 'May 2026',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7456075541708800000/',
    body: `Last week I got my master's degree.

I started my master's the same week I started my first full-time job at a startup.

Early 2024, I was going to work in the day and going to class at night. The startup was full of my friends from undergrad. It felt less like a first job and more like getting paid to do what we'd been doing for years, together.

But my master's was a completely different thing.

Most of the people in my classes had been working for 5, 10, 15 years before they walked into class. A few weren't even engineers: anthropologists, artist, lawyers.

There were a few of us who had just started our first real jobs, sitting next to people who had been running teams since before we knew what a real sprint looked like.

At my start up everybody was an engineer and we always thing in analytical way. But my classmates asked questions about laws, economics social impact.

The two perspectives from the classroom and work force me to think from multiple different perspectives.

There were rough weeks. Weeks I thought I had taken on too much. The people on both sides showed up without me having to ask. Getting this degree is a personal milestone, but it's also the result of friends and family who carried me through the parts that almost broke me.

The startup taught me to ship fast. The classroom taught me to ask whether the thing I was about to ship should exist at all.

The startup doesn't exist anymore. Most of the people I worked with there are still some of my closest friends. The classroom is gone too, but the people I met in it changed how I think.

Thank you to my family and friends, and to everyone who's still around.`,
    images: [
      { src: '/posts/masters-1.jpg', alt: 'Kevin holding his master’s diploma' },
      { src: '/posts/masters-2.jpg', alt: 'Group photo with classmates and friends' },
      { src: '/posts/masters-3.jpg', alt: 'With family' },
      { src: '/posts/masters-4.jpg', alt: 'With friends' },
    ],
    reactions: 72,
    comments: 4,
    reposts: 0,
  },
  {
    date: 'Apr 2026',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7452355251770298369/',
    body: `If you vibe coded your app, it's probably already hacked and you don't know it.

AI ships code that runs. That's development. Ask AI why it picked this pattern over another and you'll get a confident answer that means nothing. Engineering is the part it can't fake.

On our first web app, we let Cursor build the entire auth layer. We never audited the code. It compiled. It ran. The login check was running in the frontend. Anyone could bypass it.

We use Supabase and they have an authentication service that already works. It was the easier path. We ignored it and had AI build one from scratch because it felt faster. One day of productivity became weeks of tech debt and a real security hole. Our fault, not the AI's.

What AI does well:
- Generates code
- Follows patterns it has seen
- Ships something that runs

If you vibe coded an app in the last few months and didn't audit the critical features, you might already be compromised and not know it yet.

Mistakes we keep seeing everywhere:
- API keys in the frontend, anyone can read them
- Supabase tables without RLS, anyone can pull your data
- Endpoints with no auth, AI writes them to run, not to be safe
- Validation only on the frontend
- No rate limiting on login, signup, password reset, or AI endpoints
- No input validation
- Secrets hardcoded in the repo

Here's the part nobody talks about.

A single feature? Sure, vibe code it. A whole system? Different game. The devs who understand that split will compound in value. The ones who confuse a clean compile with a shipped product are piling up debt that takes years to dig out of.

Screenshot from an old insecure project we killed.`,
    images: [
      { src: '/posts/vibe-coded.jpg', alt: 'Burp Suite capture of an unsafe Supabase request' },
    ],
    reactions: 149,
    comments: 19,
    reposts: 7,
  },
  {
    date: 'Jan 2026',
    url: 'https://www.linkedin.com/in/kevin-gamez/recent-activity/all/',
    body: `You can be a great engineer and still be poor.

Not because you can't code. Because you can't speak simply.

I love solving problems with technology. Building systems, automating repetitive work, making stuff work.

But I learned the hard way that being good at the technical part isn't enough. If the people with buying power (clients, companies, decision makers) can't understand you, they can't give you their money.

Because you can build the most elegant solution in the world. If it doesn't solve a problem someone is willing to pay for, it doesn't matter.

The best engineers I've worked with don't just write code. They ask questions. They sit in sales calls. They understand why a customer churns. They do customer support. They write copy. They're always learning how to speak the customer's languages

Engineering skill builds systems, communication skill builds income.`,
    images: [
      { src: '/posts/great-engineer-poor.jpg', alt: 'Cursor IDE on a laptop, late-night coding' },
    ],
    reactions: 270,
    comments: 12,
    reposts: 8,
  },
  {
    date: 'Dec 2025',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7370863516574117888/',
    body: `One moment you're debugging with your team, sitting together at your desks. The next, you're walking out of the Apple Store with a Mac mini under your arm.

Last week, we faced a frustrating blocker. Instagram kept throwing captchas and logging us out during development and testing. This was disrupting key features and stopping our progress.

We tried everything. We tested different proxies, made headless tweaks, and tried various cookie handling tricks. Nothing worked reliably.

After hours of troubleshooting, one thing became clear: the issue wasn't happening locally. So, we made a quick, practical decision. We decided to get a Mac mini and use it as a small in-house server. This meant no captchas, no logouts, and most importantly, no more broken features.

Sometimes, the right technical decision isn't just about code. It's about reacting quickly, choosing the easiest path, and keeping the team moving forward.

Tech isn't just about solving problems. It's about knowing when to change your approach and making quick decisions to maintain progress.`,
    images: [
      {
        src: '/posts/mac-mini.jpg',
        alt: 'Mac mini set up at the WeWork desk as an in-house server',
      },
    ],
    reactions: 49,
    comments: 2,
    reposts: 0,
  },
  {
    date: 'Sep 2025',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7361123101708828672/',
    body: `Building a startup feels a lot like preparing for a marathon

At the beginning, the excitement is overwhelming. You feel ready to take on the world. You have a vision, a plan, and the motivation to match. The first kilometers feel almost effortless; you're running on pure drive. But then the road stretches out. You need to manage your pace. Progress comes from the daily grind. It's about showing up even when no one is watching, even when it feels like nothing is moving forward.

Along the way, there are setbacks. Sometimes they're small stumbles; sometimes they're big injuries. In running, it might be a pulled muscle. In a startup, it could be losing a client, a failed feature, or an unexpected market shift. Either way, you learn to adjust and keep moving. And you never do it alone. Coaches, mentors, founders, co-founders, and friends are the water stations that keep you going when you feel like giving up.

Somewhere beyond the pain, the doubt, and the long kilometers, there's the finish line. Crossing it changes you. It's not just about achieving your goal, but about who you had to become to get there. Whether you're lacing up for 42 kilometers or building your first MVP, remember it's not a sprint. It's a steady, disciplined, and deeply rewarding journey.`,
    images: [
      { src: '/posts/marathon.jpg', alt: 'Kevin with the 42K Challenges 2024 finisher medal' },
    ],
    reactions: 59,
    comments: 10,
    reposts: 0,
  },
  {
    date: 'Jul 2025',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7348125874094755840/',
    body: `Since February 2024 I've been working at a startup my first job and, honestly, a turbo charged master's program. These are a few lessons that have learned:

Here it's okay to fail, as long as tomorrow you're better
A merely "decent" performance doesn't cut it; every mistake gets its mini-postmortem and the challenge to level up the next day.

You change hats every hour
With a small crew, today you're an analyst, tomorrow a half designer, half support, half whatever it takes.

What you do is noticed and it matters
You propose, build, ship, and watch the metrics jump. You're not just another cog; that feeling is more addictive than any bonus.

Passionate people, unexpected networks
You team up with ambitious, unconventional folks who are all-in on the mission. Before you know it, your network is rich with founders, investors, and future collaborators.

Not everything is sunshine
Expectations are sky-high and the pressure to ship never lets up. Some days it's "what did I sign up for?"-others it's "wow, look at what we're pulling off!"

My personal thoughts
Jumping into startup life has been one of my best decisions. I'm surrounded by brilliant people, growing technically and personally, learning to be concise and productive. And from this setup my little command center where caffeine meets code, I'm always hunting for the next challenge and the next big impact.`,
    images: [
      {
        src: '/posts/lessons-turbo.jpg',
        alt: 'Home command center, laptop + monitor running Enttor',
      },
    ],
    reactions: 54,
    comments: 13,
    reposts: 0,
  },
]
