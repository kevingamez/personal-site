// Fuzzy string scorer used by the ⌘P command palette.
// Returns -1 when `q` doesn't appear as a subsequence of `s`; lower = better.

export function fuzzyScore(q: string, s: string): number {
  q = q.toLowerCase()
  s = s.toLowerCase()
  let qi = 0
  let lastIdx = -1
  let score = 0
  for (let si = 0; si < s.length && qi < q.length; si++) {
    if (s[si] === q[qi]) {
      if (lastIdx >= 0) score += si - lastIdx - 1
      lastIdx = si
      qi++
    }
  }
  return qi === q.length ? score + s.length * 0.01 : -1
}
