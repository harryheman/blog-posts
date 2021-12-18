import React, { useEffect } from 'react'

// Тип для пропов для поиска
export type SearchProps = {
  inputValue: string
  onChangeInputValue: (value: string) => void
  isFocused: boolean
  onChangeIsFocused: (isFocused: boolean) => void
}

// Хук для установки фокуса на инпут при нажатии `/`
// Принимает ссылку на инпут
export function useFocusOnSlash(
  inputRef: React.RefObject<null | HTMLInputElement>
) {
  useEffect(() => {
    // Возможно, пользователь хочет установить фокус на инпут :)
    function focusOnSearchMaybe(event: KeyboardEvent) {
      const element = event.target as HTMLInputElement | HTMLTextAreaElement
      // Ссылка на инпут
      const input = inputRef.current
      // Если нажат `/` и название тега цели события - это не указанные теги
      if (
        event.code === 'Slash' &&
        !['TEXTAREA', 'INPUT'].includes(element.tagName)
      ) {
        // Если имеется инпут и он не находится в фокусе
        if (input && document.activeElement !== input) {
          event.preventDefault()
          input.focus()
        }
      }
    }
    // Регистрируем обработчик на документе
    document.addEventListener('keydown', focusOnSearchMaybe)
    // Удаляем обработчик при размонтировании компонента
    return () => {
      document.removeEventListener('keydown', focusOnSearchMaybe)
    }
  }, [inputRef])
}

// Утилита для определения мобилки
function isMobileUserAgent() {
  return (
    typeof window !== 'undefined' &&
    (typeof window.orientation !== 'undefined' ||
      navigator.userAgent.indexOf('IEMobile') !== -1)
  )
}

// Активный плейсхолдер - когда инпут находится в фокусе
// const ACTIVE_PLACEHOLDER = 'Go ahead. Type your search...'
const ACTIVE_PLACEHOLDER = 'Вперед. Ищите и обрящете...'
// Make this one depend on figuring out if you're on a mobile device
// because there you can't really benefit from keyboard shortcuts.
// Пассивный плейсхолдер - зависит от девайса
// const INACTIVE_PLACEHOLDER = isMobileUserAgent()
//   ? 'Site search...'
//   : 'Site search... (Press "/" to focus)'
const INACTIVE_PLACEHOLDER = isMobileUserAgent()
  ? 'Поиск по сайту...'
  : 'Поиск по сайту... (Нажмите "/" для установки фокуса)'

// Утилита для получения плейсхолдера
export const getPlaceholder = (isFocused: boolean) =>
  isFocused ? ACTIVE_PLACEHOLDER : INACTIVE_PLACEHOLDER
