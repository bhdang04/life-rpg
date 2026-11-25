import { STATS } from '../config/missions'
import type { GameState } from '../core/missions'
import { levelProgress, nextRank, rankFor, totalXp } from '../core/ranks'

export function Stats({ state }: { state: GameState }) {
  const total = totalXp(state.statXp)
  const next = nextRank(total)
  return (
    <main>
      <h1>Rank {rankFor(total)} · {total} XP</h1>
      <p>{next ? `${next.minXp - total} XP to rank ${next.rank}` : 'Max rank'}</p>
      <ul>
        {STATS.map((st) => {
          const { level, into, need } = levelProgress(state.statXp[st.id])
          return (
            <li key={st.id}>
              <strong>{st.name}</strong> Lv {level} <progress value={into} max={need} /> {into}/{need}
            </li>
          )
        })}
      </ul>
    </main>
  )
}
