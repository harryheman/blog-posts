import { useEffect } from 'react'

export type SearchProps = {
  inputValue: string
  onChangeInputValue: (value: string) => void
  isFocused: boolean
  onChangeIsFocused: (isFocused: boolean) => void
}

export function useFocusOnSlash(
  inputRef: React.RefObject<null | HTMLInputElement>
) {
  useEffect(() => {
    function focusOnSearchMaybe(event: KeyboardEvent) {
      const element = event.target as HTMLInputElement | HTMLTextAreaElement
      const input = inputRef.current
      if (
        event.code === 'Slash' &&
        !['TEXTAREA', 'INPUT'].includes(element.tagName)
      ) {
        if (input && document.activeElement !== input) {
          event.preventDefault()
          input.focus()
        }
      }
    }
    document.addEventListener('keydown', focusOnSearchMaybe)
    return () => {
      document.removeEventListener('keydown', focusOnSearchMaybe)
    }
  }, [inputRef])
}

function isMobileUserAgent() {
  return (
    typeof window !== 'undefined' &&
    (typeof window.orientation !== 'undefined' ||
      navigator.userAgent.indexOf('IEMobile') !== -1)
  )
}

const ACTIVE_PLACEHOLDER = 'Go ahead. Type your search...'
const INACTIVE_PLACEHOLDER = isMobileUserAgent()
  ? 'Site search...'
  : 'Site search... (Press "/" to focus)'

export const getPlaceholder = (isFocused: boolean) =>
  isFocused ? ACTIVE_PLACEHOLDER : INACTIVE_PLACEHOLDER
