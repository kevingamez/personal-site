// Hides a little message inside the profile photo (public/kevin.jpg) for the
// curious: a Caesar-ciphered note appended after the JPEG end-of-image marker.
// Decoders ignore everything past FFD9, so the image renders identically — but
// `strings public/kevin.jpg`, `exiftool`, or a hex editor reveal the payload.
//
// The hint ("et tu?") nods at Brutus → Caesar. Shift is 3, the classic Caesar
// cipher. Run `node tools/embed-profile-secret.mjs` to (re)embed; it strips any
// previous payload first, so it's idempotent.

import { readFileSync, writeFileSync } from 'node:fs'

const IMG = new URL('../public/kevin.jpg', import.meta.url)
const BEGIN = '--BEGIN KG SECRET--'
const END = '--END KG SECRET--'

// Caesar shift +3 on letters only; everything else passes through.
const caesar = (s, k = 3) =>
  s.replace(/[a-z]/g, (c) => String.fromCharCode(((c.charCodeAt(0) - 97 + k) % 26) + 97)).replace(
    /[A-Z]/g,
    (c) => String.fromCharCode(((c.charCodeAt(0) - 65 + k) % 26) + 65)
  )

const PLAINTEXT =
  "You read the bits. Caesar would be proud. Mail me with subject GLIDER and I'll buy the coffee. -- KG"

const payload =
  `\n\n${BEGIN}\n` + `hint: et tu? shift 3.\n` + `${caesar(PLAINTEXT)}\n` + `${END}\n`

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
console.log('Verify: strings public/kevin.jpg | tail -4')
