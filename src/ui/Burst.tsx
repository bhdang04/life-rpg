import type { CSSProperties } from 'react'

const N = 14

// One-shot ring of sparks (700 ms, CSS only). Mount it when the moment starts; hidden under reduce-motion.
export function Burst() {
  return (
    <div className="burst" aria-hidden="true">
      {Array.from({ length: N }, (_, i) => <i key={i} style={{ '--a': `${(360 / N) * i}deg` } as CSSProperties} />)}
    </div>
  )
}
