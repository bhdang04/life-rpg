import { ringDash } from '../core/ring'

interface Props {
  level: number
  pct: number // 0..1 progress to the next level
  color: string
  label: string // read aloud by screen readers
  size?: number
}

// Round RPG stat gauge: tick ring, faint track, glowing arc, level in the middle.
export function Ring({ level, pct, color, label, size = 96 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="img" aria-label={label} style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
      <circle cx="48" cy="48" r="44" fill="none" stroke={color} strokeOpacity="0.45" strokeWidth="2" strokeDasharray="2 5.68" />
      <circle cx="48" cy="48" r="34" fill="rgba(124,58,237,0.12)" stroke={color} strokeOpacity="0.22" strokeWidth="8" />
      {pct > 0 && (
        <circle cx="48" cy="48" r="34" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={ringDash(pct)} transform="rotate(-90 48 48)" />
      )}
      <text x="48" y="58" textAnchor="middle" className="display" fontSize="28" fontWeight="700" fill="#fff">{level}</text>
    </svg>
  )
}
