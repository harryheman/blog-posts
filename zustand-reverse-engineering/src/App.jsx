import Modal from './components/Modal'
import useModal from './hooks/useModal'

function App() {
  const modal = useModal()

  return (
    <>
      <button onClick={modal.open}>Open modal</button>
      <Modal />
    </>
  )
}

export default App
