import './App.css'
import AppRouter from './AppRouter'
import { OfflineBanner } from './components/OfflineBanner'

function App() {
  return (
    <>
      <OfflineBanner />
      <AppRouter />
    </>
  )
}

export default App
