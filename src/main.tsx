import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Board } from './screens/Board'
import { useGame } from './store/useGame'

// No router: later screens switch with a useState tab.
function App() {
  const [state, setState] = useGame()
  return <Board state={state} onChange={setState} />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
