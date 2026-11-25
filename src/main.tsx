import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Board } from './screens/Board'
import { Mission } from './screens/Mission'
import { useGame } from './store/useGame'

// No router: an active mission takes over the screen, later screens switch with a useState tab.
function App() {
  const [state, setState] = useGame()
  if (state.active) return <Mission active={state.active} onChange={setState} />
  return <Board state={state} onChange={setState} />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
