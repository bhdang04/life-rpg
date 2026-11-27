import { StrictMode, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './theme/tokens.css'
import { Feedback } from './components/Feedback'
import { DayComplete } from './ui/DayComplete'
import { Board } from './screens/Board'
import { CheckIn } from './screens/CheckIn'
import { Gym } from './screens/Gym'
import { Mission } from './screens/Mission'
import { Settings } from './screens/Settings'
import { Stats } from './screens/Stats'
import { STATS } from './config/missions'
import { crossing } from './core/events'
import { levelFor, rankFor, totalXp } from './core/ranks'
import { useGame } from './store/useGame'
import { LevelUp, type LevelUpInfo } from './ui/LevelUp'
import { PrCard, type Pr } from './ui/PrCard'
import { RankUp, type RankUpInfo } from './ui/RankUp'

const TABS = ['Board', 'Check-in', 'Stats', 'Settings'] as const

// 24px stroke icons, one per tab; they take the button's text color.
const ICONS: Record<(typeof TABS)[number], string> = {
  Board: 'M5 4h14v16H5zM9 9h6M9 13h6',
  'Check-in': 'M12 3a9 9 0 100 18 9 9 0 000-18zM8 12.5l3 3 5-6',
  Stats: 'M12 3l8 6-3 11H7L4 9z',
  Settings: 'M4 7h10M18 7h2M4 17h2M10 17h10M16 4v6M8 14v6',
}

// No router: an active mission takes over the screen, everything else switches with a useState tab.
function App() {
  const [state, setState, saveFailed] = useGame()
  const [tab, setTab] = useState<(typeof TABS)[number]>('Board')
  const [gym, setGym] = useState(false)
  const [dayDone, setDayDone] = useState(false)
  const [prs, setPrs] = useState<Pr[]>([])
  const [ups, setUps] = useState<LevelUpInfo[]>([])
  const seen = useRef(Object.fromEntries(STATS.map((st) => [st.id, state.statXp[st.id]]))) // best XP per stat this session
  // A level above the best seen queues a level-up card (none on first load, none for re-earning after a penalty).
  useEffect(() => {
    const found = STATS.flatMap((st) => {
      const [best, xp] = [seen.current[st.id], state.statXp[st.id]]
      seen.current[st.id] = Math.max(best, xp)
      return crossing(best, xp, levelFor) ? [{ stat: st.id, from: levelFor(best), to: levelFor(xp) }] : []
    })
    if (found.length) setUps((q) => [...q, ...found])
  }, [state.statXp])
  // Same idea for the overall rank: only a rise queues a card, never a drop.
  const [rankUps, setRankUps] = useState<RankUpInfo[]>([])
  const seenXp = useRef(totalXp(state.statXp))
  useEffect(() => {
    const [pt, nt] = [seenXp.current, totalXp(state.statXp)]
    seenXp.current = Math.max(pt, nt)
    if (crossing(pt, nt, rankFor)) setRankUps((q) => [...q, { from: rankFor(pt), to: rankFor(nt) }])
  }, [state.statXp])
  // Feedback stays mounted across every screen so it can compare each state change with the last.
  const screen = state.active ? <Mission active={state.active} onChange={setState} /> : gym ? <Gym state={state} onChange={setState} onBack={() => setGym(false)} onPr={setPrs} /> : (
    <>
      <div className="screen" key={tab}>
        {tab === 'Board' && <Board state={state} onChange={setState} onCheckIn={() => setTab('Check-in')} onGym={() => setGym(true)} />}
        {tab === 'Check-in' && <CheckIn state={state} onChange={setState} />}
        {tab === 'Stats' && <Stats state={state} onChange={setState} onCheckIn={() => setTab('Check-in')} />}
        {tab === 'Settings' && <Settings state={state} onChange={setState} />}
      </div>
      {ups[0] && !state.active && <LevelUp info={ups[0]} total={totalXp(state.statXp)} onClose={() => setUps((q) => q.slice(1))} />}
      {rankUps[0] && !ups[0] && !state.active && <RankUp info={rankUps[0]} total={totalXp(state.statXp)} onClose={() => setRankUps((q) => q.slice(1))} />}
      {prs.length > 0 && !ups[0] && !rankUps[0] && !state.active && <PrCard prs={prs} onClose={() => setPrs([])} />}
      {dayDone && !ups[0] && !rankUps[0] && !prs.length && <DayComplete state={state} onClose={() => setDayDone(false)} />}
      <nav>
        {TABS.map((t) => (
          <button key={t} aria-current={t === tab} onClick={() => setTab(t)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONS[t]} /></svg>
            {t}
          </button>
        ))}
      </nav>
    </>
  )
  return <>{saveFailed && <p role="alert" className="warn">Not saving! Settings, then Copy JSON, to keep your progress.</p>}<Feedback state={state} onDayComplete={() => setDayDone(true)} />{screen}</>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
