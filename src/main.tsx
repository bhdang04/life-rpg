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
          <button key={t} aria-current={t === tab} onClick={() => setTab(t)}>{t}</button>
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
