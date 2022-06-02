import { GreetingProvider } from './GreetingProvider'
import FetchGreeting from './FetchGreeting'

function App() {
  return (
    <div className='App'>
      <GreetingProvider>
        <FetchGreeting url='/greeting' />
      </GreetingProvider>
    </div>
  )
}

export default App
