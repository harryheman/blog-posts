import { Picker } from 'emoji-mart'
import 'emoji-mart/css/emoji-mart.css'
import useStore from 'hooks/useStore'
import { useCallback, useEffect } from 'react'
import { BsEmojiSmile } from 'react-icons/bs'

export default function EmojiMart({ setText, messageInput }) {
  const { showEmoji, setShowEmoji, showPreview } = useStore(
    ({ showEmoji, setShowEmoji, showPreview }) => ({
      showEmoji,
      setShowEmoji,
      showPreview
    })
  )

  const onKeydown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        setShowEmoji(false)
      }
    },
    [setShowEmoji]
  )

  useEffect(() => {
    window.addEventListener('keydown', onKeydown)

    return () => {
      window.removeEventListener('keydown', onKeydown)
    }
  }, [onKeydown])

  const onSelect = ({ native }) => {
    setText((text) => text + native)
    messageInput.focus()
  }

  return (
    <div className='container emoji'>
      <button
        className='btn'
        type='button'
        onClick={() => setShowEmoji(!showEmoji)}
        disabled={showPreview}
      >
        <BsEmojiSmile className='icon' />
      </button>
      {showEmoji && (
        <Picker
          onSelect={onSelect}
          emojiSize={20}
          showPreview={false}
          perLine={6}
        />
      )}
    </div>
  )
}
