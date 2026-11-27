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
import { levelFor, totalXp } from './core/ranks'
import { useGame } from './store/useGame'
import { LevelUp, type LevelUpInfo } from './ui/LevelUp'

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
  const [state, setState] = useGame()
  const [tab, setTab] = useState<(typeof TABS)[number]>('Board')
  const [gym, setGym] = useState(false)
  const [dayDone, setDayDone] = useState(false)
  const [ups, setUps] = useState<LevelUpInfo[]>([])
  const seen = useRef(Object.fromEntries(STATS.map((st) => [st.id, levelFor(state.statXp[st.id])])))
  // Compare each stat's level with the last one seen; a jump queues a level-up card (none on first load).
  useEffect(() => {
    const found = STATS.flatMap((st) => {
      const to = levelFor(state.statXp[st.id])
      const from = seen.current[st.id]
      seen.current[st.id] = to
      return to > from ? [{ stat: st.id, from, to }] : []
    })
    if (found.length) setUps((q) => [...q, ...found])
  }, [state.statXp])
  // Feedback stays mounted across every screen so it can compare each state change with the last.
  const screen = state.active ? <Mission active={state.active} onChange={setState} /> : gym ? <Gym state={state} onChange={setState} onBack={() => setGym(false)} /> : (
    <>
      <div className="screen" key={tab}>
        {tab === 'Board' && <Board state={state} onChange={setState} onCheckIn={() => setTab('Check-in')} onGym={() => setGym(true)} />}
        {tab === 'Check-in' && <CheckIn state={state} onChange={setState} />}
        {tab === 'Stats' && <Stats state={state} onChange={setState} onCheckIn={() => setTab('Check-in')} />}
        {tab === 'Settings' && <Settings state={state} onChange={setState} />}
      </div>
      {ups[0] && !state.active && <LevelUp info={ups[0]} total={totalXp(state.statXp)} onClose={() => setUps((q) => q.slice(1))} />}
      {dayDone && !ups[0] && <DayComplete state={state} onClose={() => setDayDone(false)} />}
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
  return <><Feedback state={state} onDayComplete={() => setDayDone(true)} />{screen}</>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
