import { useEffect, useRef } from 'react'
import { useClickAway } from 'react-use'
import useModal from '../hooks/useModal'

export default function Modal() {
  const modal = useModal()
  const modalRef = useRef(null)
  const modalContentRef = useRef(null)

  useEffect(() => {
    if (!modalRef.current) return

    if (modal.isOpen) {
      modalRef.current.showModal()
    } else {
      modalRef.current.close()
    }
  }, [modal.isOpen])

  useClickAway(modalContentRef, modal.close)

  if (!modal.isOpen) return null

  return (
    <dialog
      style={{
        padding: 0,
      }}
      ref={modalRef}
    >
      <div
        style={{
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
        ref={modalContentRef}
      >
        <div>Modal content</div>
        <button onClick={modal.close}>X</button>
      </div>
    </dialog>
  )
}
