import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './theme/tokens.css'
import { Board } from './screens/Board'
import { CheckIn } from './screens/CheckIn'
import { Mission } from './screens/Mission'
import { Settings } from './screens/Settings'
import { Stats } from './screens/Stats'
import { useGame } from './store/useGame'

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
  if (state.active) return <Mission active={state.active} onChange={setState} />
  return (
    <>
      {tab === 'Board' && <Board state={state} onChange={setState} onCheckIn={() => setTab('Check-in')} />}
      {tab === 'Check-in' && <CheckIn state={state} onChange={setState} />}
      {tab === 'Stats' && <Stats state={state} />}
      {tab === 'Settings' && <Settings state={state} onChange={setState} />}
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
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
