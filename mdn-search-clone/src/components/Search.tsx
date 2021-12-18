import React, {
  Suspense,
  lazy,
  useState,
  useMemo,
  useRef,
  useEffect
} from 'react'
import { useLocation } from 'react-router-dom'

import { useLocale } from '../search/hooks'

// Утилиты для поиска
import {
  getPlaceholder,
  SearchProps,
  useFocusOnSlash
} from '../search/search-utils'

// Виджет для поиска
const LazySearchNavigateWidget = lazy(() => import('../search/search'))

// Хук для извлечения параметров из строки запроса
function useQueryParamState() {
  // Извлекаем параметры
  const searchParams = new URLSearchParams(useLocation().search)
  const queryState = searchParams.get('q') || ''
  // Состояние для параметров
  const [value, setValue] = useState(queryState)

  // The site-search page might trigger an update to the current
  // `?q=...` value and if that happens we want to be reflected in the search inputs
  // Страница поиска должна реагировать (повторно рендериться)
  // при изменении значения строки запроса `?q=...`
  React.useEffect(() => {
    setValue(queryState)
  }, [setValue, queryState])

  return [value, setValue] as const
}

// Компонент поиска
// Принимает два опциональных пропа:
// индикатор предварительной инициализации и
// функцию для сохранения результатов поиска
export default function Search({
  preload,
  onResultPicked
}: {
  preload?: boolean
  onResultPicked?: () => void
}) {
  // Получаем значение строки запроса и функцию для его обновления
  const [value, setValue] = useQueryParamState()
  // Состояние фокуса
  const [isFocused, setIsFocused] = useState(false)
  // Состояние выделенного по умолчанию текста
  const [defaultSelection, setDefaultSelection] = useState([0, 0] as [
    number,
    number
  ])
  // Состояние переключения виджетов для поиска
  const [shouldUpgradeSearch, setShouldUpgradeSearch] = useState(false)

  // Пропы для поиска
  const searchProps = useMemo(
    () => ({
      // Значение инпута
      inputValue: value,
      // Обработчик изменения значения инпута
      onChangeInputValue: (value: string) => setValue(value),
      // Индикатор установки фокуса
      isFocused,
      // Обработчик изменения фокуса
      onChangeIsFocused: (isFocused: boolean) => setIsFocused(isFocused),
      // Выделенный текст (начальный и конечный индексы выделения)
      defaultSelection,
      // Обработчик выделения текста
      onChangeSelection: (selection: [number, number]) =>
        setDefaultSelection(selection),
      // Наведение курсора приводит к переключению виджетов для поиска
      onMouseEnter: () => setShouldUpgradeSearch(true)
    }),
    [value, isFocused, defaultSelection, setValue]
  )

  // Побочный эффект для определения необходимости переключения виджетов
  useEffect(() => {
    // Если инпут находится в фокусе и индикатор предварительной загрузки имеет значение `true`
    if (isFocused || preload) {
      // Переключаем виджеты
      setShouldUpgradeSearch(true)
    }
  }, [isFocused, setShouldUpgradeSearch, preload])

  return (
    <div className='header-search'>
      {shouldUpgradeSearch ? (
        <Suspense fallback={<BasicSearchWidget {...searchProps} />}>
          <LazySearchNavigateWidget
            {...searchProps}
            onResultPicked={onResultPicked}
          />
        </Suspense>
      ) : (
        <BasicSearchWidget {...searchProps} />
      )}
    </div>
  )
}

// Упрощенная версия виджета для поиска
function BasicSearchWidget({
  isFocused,
  onChangeIsFocused,
  inputValue,
  onChangeInputValue,
  onChangeSelection,
  onMouseEnter
}: SearchProps & {
  onChangeSelection: (selection: [number, number]) => void
  onMouseEnter: () => void
}) {
  const locale = useLocale()
  const inputRef = useRef<null | HTMLInputElement>(null)

  useFocusOnSlash(inputRef)

  return (
    <form action={`/${locale}/search`} className='search-form' role='search'>
      <div className='search-field'>
        <label htmlFor='main-q' className='visually-hidden'>
          Search MDN
        </label>
        <input
          ref={inputRef}
          type='search'
          name='q'
          id='main-q'
          className='search-input-field'
          placeholder={getPlaceholder(isFocused)}
          pattern='(.|\s)*\S(.|\s)*'
          required
          value={inputValue}
          onMouseEnter={onMouseEnter}
          onChange={(e) => {
            onChangeInputValue(e.target.value)
          }}
          autoFocus={isFocused}
          onFocus={() => onChangeIsFocused(true)}
          onBlur={() => onChangeIsFocused(false)}
          onSelect={(event) => {
            if (event.target instanceof HTMLInputElement) {
              onChangeSelection([
                event.target.selectionStart!,
                event.target.selectionEnd!
              ])
            }
          }}
        />
        <input
          type='submit'
          className='search-button'
          value=''
          aria-label='Поиск'
        />
      </div>
    </form>
  )
}
