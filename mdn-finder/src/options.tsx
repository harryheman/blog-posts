import { useRef } from 'react'
import storage, { defaultOptions, OPTIONS_KEY } from '~storage'
import './style.css'

export default function IndexOptions() {
  const btnRef = useRef<HTMLButtonElement | null>(null)

  const onSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault()

    const formData = Object.fromEntries(
      new FormData(e.target as HTMLFormElement).entries(),
    )

    try {
      await storage.set(OPTIONS_KEY, formData)

      if (btnRef.current) {
        btnRef.current.textContent = 'Saved'

        const id = setTimeout(() => {
          btnRef.current.textContent = 'Save'
          clearTimeout(id)
        }, 1000)
      }
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <form className='options' onSubmit={onSubmit}>
      <label>
        Background color:{' '}
        <input
          type='color'
          name='backgroundColor'
          defaultValue={defaultOptions.backgroundColor}
        />
      </label>
      <label>
        Result item color:{' '}
        <input
          type='color'
          name='textColor'
          defaultValue={defaultOptions.textColor}
        />
      </label>
      <label>
        Selection background:{' '}
        <input
          type='color'
          name='selectionBackground'
          defaultValue={defaultOptions.selectionBackground}
        />
      </label>
      <label>
        Selection color:{' '}
        <input
          type='color'
          name='selectionColor'
          defaultValue={defaultOptions.selectionColor}
        />
      </label>
      <label>
        Show URL:{' '}
        <input
          type='checkbox'
          name='showUrl'
          defaultChecked={defaultOptions.showUrl}
        />
      </label>
      <button ref={btnRef}>Save</button>
    </form>
  )
}
