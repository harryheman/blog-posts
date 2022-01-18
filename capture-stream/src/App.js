import { VideoSelector, AudioSelector, Recorder, Result } from 'components'
import { createStore } from 'utils/createStore'
import './App.scss'

const store = {
  state: {
    audio: '',
    video: '',
    result: ''
  },
  setters: {
    setAudio: (_, audio) => ({ audio }),
    setVideo: (_, video) => ({ video }),
    setResult: (_, result) => ({ result })
  }
}

export const [Provider, useStore, useSetters] = createStore(store)

function App() {
  return (
    <Provider>
      <div className='container common'>
        <VideoSelector />
        <AudioSelector />
      </div>
      <Recorder />
      <Result />
    </Provider>
  )
}

export default App
