// Hides a quiet signature inside the profile photo (public/kevin.jpg): a Conway
// glider (the hacker emblem - and this site's hero) plus a Caesar-ciphered
// signature line, appended after the JPEG end-of-image marker. Decoders ignore
// everything past FFD9, so the image renders identically - but `strings
// public/kevin.jpg`, `exiftool`, or a hex editor reveal the mark.
//
// It's a watermark, not a note to a stranger: name, city, coordinates. Shift is
// 3 (classic Caesar). Run `node tools/embed-profile-secret.mjs` to (re)embed;
// it strips any previous payload first, so it's idempotent.

import { readFileSync, writeFileSync } from 'node:fs'

const IMG = new URL('../public/kevin.jpg', import.meta.url)
const BEGIN = '--BEGIN KG SIGNATURE--'
const END = '--END KG SIGNATURE--'

// Caesar shift +3 on letters only; digits, punctuation and accents pass through.
const caesar = (s, k = 3) =>
  s
    .replace(/[a-z]/g, (c) => String.fromCharCode(((c.charCodeAt(0) - 97 + k) % 26) + 97))
    .replace(/[A-Z]/g, (c) => String.fromCharCode(((c.charCodeAt(0) - 65 + k) % 26) + 65))

// Conway glider - spaced so each line is >=4 printable chars (so `strings`
// shows it) and left as-is (Caesar only touches letters), so it stays legible.
const GLIDER = ['. # .', '. . #', '# # #'].join('\n')

// ASCII only: accents and the middot break `strings` into ugly fragments.
const SIGNATURE = 'Kevin Gamez - Bogota - 4.7110,-74.0721'

const payload =
  `\n\n${BEGIN}\n` + `${GLIDER}\n` + `caesar +3:\n` + `${caesar(SIGNATURE)}\n` + `${END}\n`

const buf = readFileSync(IMG)

// Find the real JPEG EOI (FFD9) and drop anything already appended after it.
let eoi = -1
for (let i = buf.length - 2; i >= 0; i--) {
  if (buf[i] === 0xff && buf[i + 1] === 0xd9) {
    eoi = i + 2
    break
  }
}
if (eoi === -1) throw new Error('No JPEG EOI (FFD9) found in kevin.jpg')

const clean = buf.subarray(0, eoi)
writeFileSync(IMG, Buffer.concat([clean, Buffer.from(payload, 'utf8')]))

console.log(`Embedded ${payload.length} bytes after EOI (offset ${eoi}).`)
console.log('Verify: strings public/kevin.jpg | tail -6')
