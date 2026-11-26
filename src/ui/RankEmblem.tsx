import { RANK_COLORS } from '../config/missions'

// Glowing hexagon with the overall rank letter. Its color follows the rank.
export function RankEmblem({ rank, size = 54 }: { rank: string; size?: number }) {
  const color = RANK_COLORS[rank]
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" role="img" aria-label={`Rank ${rank}`} style={{ filter: `drop-shadow(0 0 10px ${color})` }}>
      <polygon points="27,2 49,14.5 49,39.5 27,52 5,39.5 5,14.5" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="2" />
      <text x="27" y="36" textAnchor="middle" className="display" fontSize="26" fontWeight="700" fill="#ece8ff">{rank}</text>
    </svg>
  )
}
