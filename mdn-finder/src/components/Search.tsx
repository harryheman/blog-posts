import {
  getPlaceholder,
  SearchProps,
  useFocusOnSlash,
} from '../search/search-utils'
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'

const LazySearchNavigateWidget = lazy(() => import('../search/search'))

export default function Search({
  preload,
  onResultPicked,
}: {
  preload?: boolean
  onResultPicked?: () => void
}) {
  const [value, setValue] = useState('')
  const [isFocused, setIsFocused] = useState(true)
  const [defaultSelection, setDefaultSelection] = useState([0, 0] as [
    number,
    number,
  ])
  const [shouldUpgradeSearch, setShouldUpgradeSearch] = useState(false)

  const searchProps = useMemo(
    () => ({
      inputValue: value,
      onChangeInputValue: (value: string) => setValue(value),
      isFocused,
      onChangeIsFocused: (isFocused: boolean) => setIsFocused(isFocused),
      defaultSelection,
      onChangeSelection: (selection: [number, number]) =>
        setDefaultSelection(selection),
      onMouseEnter: () => setShouldUpgradeSearch(true),
    }),
    [value, isFocused, defaultSelection, setValue],
  )

  useEffect(() => {
    if (isFocused || preload) {
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

function BasicSearchWidget({
  isFocused,
  onChangeIsFocused,
  inputValue,
  onChangeInputValue,
  onChangeSelection,
  onMouseEnter,
}: SearchProps & {
  onChangeSelection: (selection: [number, number]) => void
  onMouseEnter: () => void
}) {
  const inputRef = useRef<null | HTMLInputElement>(null)

  useFocusOnSlash(inputRef)

  return (
    <form
      action='https://developer.mozilla.org/en-US/search'
      className='search-form'
      role='search'
    >
      <div className='search-field'>
        <label htmlFor='main-q' className='visually-hidden'>
          MDN Finder
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
                event.target.selectionEnd!,
              ])
            }
          }}
        />
        <input
          type='submit'
          className='search-button'
          value=''
          aria-label='Search'
        />
      </div>
    </form>
  )
}
