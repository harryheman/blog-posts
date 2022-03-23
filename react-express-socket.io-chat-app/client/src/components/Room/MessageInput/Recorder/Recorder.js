import useStore from 'hooks/useStore'
import { useState } from 'react'
import { RiRecordCircleLine } from 'react-icons/ri'
import RecordingModal from './RecordingModal'

export default function Recorder() {
  const showPreview = useStore(({ showPreview }) => showPreview)
  const [showModal, setShowModal] = useState(false)

  return (
    <div className='container recorder'>
      <button
        type='button'
        className='btn'
        onClick={() => setShowModal(!showModal)}
        disabled={showPreview}
      >
        <RiRecordCircleLine className='icon' />
      </button>
      {showModal && <RecordingModal setShowModal={setShowModal} />}
    </div>
  )
}
