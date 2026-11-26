import type { CSSProperties } from 'react'
import { RANKS, RANK_COLORS } from '../config/missions'
import { nextRank, rankFor } from '../core/ranks'

const STEP = 60
const hex = (cx: number) =>
  [[0, -18], [15.6, -9], [15.6, 9], [0, 18], [-15.6, 9], [-15.6, -9]].map(([dx, dy]) => `${cx + dx},${24 + dy}`).join(' ')

// E to S strip: ranks you reached are lit, the current one glows, the rest are dim.
export function RankPath({ total }: { total: number }) {
  const current = RANKS.findIndex((r) => r.rank === rankFor(total))
  const next = nextRank(total)
  return (
    <div className="sys" style={{ padding: '14px 12px 12px', border: '1px solid var(--border)', background: 'var(--glass)', '--bracket': RANK_COLORS[RANKS[current].rank] } as CSSProperties}>
      <svg viewBox="0 0 350 48" width="100%" role="img" aria-label={`Rank path: ${RANKS[current].rank} current`} style={{ display: 'block' }}>
        {RANKS.map((r, i) => {
          const cx = 25 + i * STEP
          const color = RANK_COLORS[r.rank]
          const reached = i <= current
          return (
            <g key={r.rank}>
              {i < RANKS.length - 1 && <path d={`M${cx + 17} 24H${cx + 43}`} stroke={color} strokeOpacity={i < current ? 0.6 : 0.3} strokeWidth="2" strokeLinecap="round" />}
              <polygon
                points={hex(cx)}
                fill={color}
                fillOpacity={i === current ? 0.3 : 0.06}
                stroke={color}
                strokeOpacity={reached ? 1 : 0.55}
                strokeWidth={i === current ? 2.5 : 2}
                style={i === current ? { filter: `drop-shadow(0 0 6px ${color})` } : undefined}
              />
              <text x={cx} y="29" textAnchor="middle" className="display" fontSize="15" fontWeight="700" fill={reached ? '#ece8ff' : 'var(--text-dim)'}>{r.rank}</text>
            </g>
          )
        })}
      </svg>
      <p style={{ margin: '8px 0 0', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
        {next ? (
          <>
            <span>Next rank: <b style={{ color: RANK_COLORS[next.rank] }}>{next.rank}</b></span>
            <span>{next.minXp - total} XP to go</span>
          </>
        ) : (
          <span>Max rank</span>
        )}
      </p>
    </div>
  )
}
