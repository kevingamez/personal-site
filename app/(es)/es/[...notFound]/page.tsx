// Twin of the (en) catch-all. Without it, /es/anything-wrong falls through the
// Spanish group entirely and gets matched by the (en) catch-all, so a Spanish
// visitor was served the English 404. Calling notFound() from inside this group
// makes React use the nearest boundary, which is (es)/not-found.tsx, and still
// returns a real 404 status rather than a 200 with apologetic content.

import { notFound } from 'next/navigation'

export default function CatchAll() {
  notFound()
}
