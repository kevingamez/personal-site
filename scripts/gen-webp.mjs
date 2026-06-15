// Generate WebP siblings for the raw JPEG photos so the home page can serve a
// modern format via <picture> with the JPEG kept as a universal fallback.
// Run after adding or replacing any /public/posts photo:  npm run images:webp
import { readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'
import sharp from 'sharp'

const TARGETS = [
  { dir: 'public/posts', exts: ['.jpg', '.jpeg', '.png'] },
  { dir: 'public', exts: ['.jpg'], only: ['kevin.jpg'] },
]

let made = 0
for (const t of TARGETS) {
  for (const name of readdirSync(t.dir)) {
    if (t.only && !t.only.includes(name)) continue
    if (!t.exts.includes(extname(name).toLowerCase())) continue
    const src = join(t.dir, name)
    if (!statSync(src).isFile()) continue
    const out = src.replace(/\.(jpe?g|png)$/i, '.webp')
    const info = await sharp(src).webp({ quality: 80 }).toFile(out)
    const before = statSync(src).size
    const after = statSync(out).size
    const pct = Math.round((1 - after / before) * 100)
    console.log(
      `${name} -> ${info.width}x${info.height}  ${(after / 1024).toFixed(0)}KB  (-${pct}%)`
    )
    made++
  }
}
console.log(`\n${made} webp files generated.`)
