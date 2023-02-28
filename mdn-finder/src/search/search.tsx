import { Doc, FuzzySearch } from './fuzzy-search'
import { getPlaceholder, SearchProps, useFocusOnSlash } from './search-utils'
import { useCombobox } from 'downshift'
import FlexSearch from 'flexsearch'
import React, { Component, useEffect, useMemo, useRef, useState } from 'react'
import useSWR from 'swr'
import storage, { defaultOptions, OPTIONS_KEY } from '~storage'

const SHOW_INDEXING_AFTER_MS = 500

type Item = {
  url: string
  title: string
}
type SearchIndex = {
  flex: any
  fuzzy: FuzzySearch
  items: null | Item[]
}
type ResultItem = {
  title: string
  url: string
  positions: Set<number>
}

function useSearchIndex(): readonly [
  null | SearchIndex,
  null | Error,
  () => void,
] {
  const [shouldInitialize, setShouldInitialize] = useState(false)
  const [searchIndex, setSearchIndex] = useState<null | SearchIndex>(null)
  const url = `./assets/search-index.json`

  const { error, data } = useSWR<null | Item[], Error | undefined>(
    shouldInitialize ? url : null,
    async (url: string) => {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(await response.text())
      }
      return await response.json()
    },
    { revalidateOnFocus: false },
  )

  useEffect(() => {
    if (!data || searchIndex) {
      return
    }

    const flex = new FlexSearch.Index({ tokenize: 'forward' })

    data!.forEach(({ title }, i) => {
      flex.add(i, title)
    })

    const fuzzy = new FuzzySearch(data as Doc[])

    setSearchIndex({ flex, fuzzy, items: data! })
  }, [searchIndex, shouldInitialize, data])

  return useMemo(
    () => [searchIndex, error || null, () => setShouldInitialize(true)],
    [searchIndex, error, setShouldInitialize],
  )
}

function isFuzzySearchString(str: string) {
  return str.startsWith('/') && !/\s/.test(str)
}

function HighlightMatch({ title, q }: { title: string; q: string }) {
  const words = q.trim().toLowerCase().split(/[ ,]+/)
  const regexWords = words.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const regex = `\\b(${regexWords.join('|')})`
  const parts = title.split(new RegExp(regex, 'gi'))

  return (
    <b>
      {parts.map((part, i) => {
        const key = `${part}:${i}`
        if (words.includes(part.toLowerCase())) {
          return <mark key={key}>{part}</mark>
        } else {
          return <span key={key}>{part}</span>
        }
      })}
    </b>
  )
}

function BreadcrumbURI({
  uri,
  positions,
}: {
  uri: string
  positions?: Set<number>
}) {
  if (positions && positions.size) {
    const chars = uri.split('')

    return (
      <small>
        {chars.map((char, i) => {
          if (positions.has(i)) {
            return <mark key={i}>{char}</mark>
          } else {
            return <span key={i}>{char}</span>
          }
        })}
      </small>
    )
  }

  const keep = uri
    .split('/')
    // .slice(1)
    .slice(3)
    .filter((p) => !['docs', 'en-US', 'Reference'].includes(p))
  return <small className='search-item-uri'>{keep.join(' / ')}</small>
}

type InnerSearchNavigateWidgetProps = SearchProps & {
  onResultPicked?: () => void
  defaultSelection: [number, number]
}

function useHasNotChangedFor(value: string, ms: number) {
  const [hasNotChanged, setHasNotChanged] = useState(false)
  const previousValue = useRef(value)

  useEffect(() => {
    if (previousValue.current === value) {
      return
    }
    previousValue.current = value
    setHasNotChanged(false)
    const timeout = setTimeout(() => {
      setHasNotChanged(true)
    }, ms)
    return () => {
      clearTimeout(timeout)
    }
  }, [value, ms])

  return hasNotChanged
}

function InnerSearchNavigateWidget(props: InnerSearchNavigateWidgetProps) {
  const {
    inputValue,
    onChangeInputValue,
    isFocused,
    onChangeIsFocused,
    onResultPicked,
    defaultSelection,
  } = props

  const [searchIndex, searchIndexError, initializeSearchIndex] =
    useSearchIndex()
  const [options, setOptions] = useState(defaultOptions)

  const inputRef = useRef<null | HTMLInputElement>(null)
  const formRef = useRef<null | HTMLFormElement>(null)
  const isSelectionInitialized = useRef(false)

  const showIndexing = useHasNotChangedFor(inputValue, SHOW_INDEXING_AFTER_MS)

  useEffect(() => {
    if (!inputRef.current || isSelectionInitialized.current) {
      return
    }

    if (isFocused) {
      inputRef.current.selectionStart = defaultSelection[0]
      inputRef.current.selectionEnd = defaultSelection[1]
    }

    isSelectionInitialized.current = true
  }, [isFocused, defaultSelection])

  useEffect(() => {
    storage.get<typeof options>(OPTIONS_KEY).then((opts) => {
      if (opts) {
        setOptions(opts)
      }
    })
  }, [])

  const resultItems: ResultItem[] = useMemo(() => {
    if (!searchIndex || !inputValue || searchIndexError) {
      return []
    }

    const limit = window.innerHeight < 850 ? 5 : 10

    if (isFuzzySearchString(inputValue)) {
      if (inputValue === '/') {
        return []
      } else {
        const fuzzyResults = searchIndex.fuzzy.search(inputValue.slice(1), {
          limit,
        })
        return fuzzyResults.map((fuzzyResult) => ({
          url: fuzzyResult.item.url,
          title: fuzzyResult.item.title,
          positions: fuzzyResult.positions,
        }))
      }
    } else {
      const indexResults: number[] = searchIndex.flex.search(inputValue, {
        limit,
        suggest: true,
      })
      return indexResults.map(
        (index: number) => (searchIndex.items || [])[index] as ResultItem,
      )
    }
  }, [inputValue, searchIndex, searchIndexError])

  const formAction = `https://developer.mozilla.org/en-US/search`
  const searchPath = useMemo(() => {
    const sp = new URLSearchParams()
    sp.set('q', inputValue.trim())
    return `${formAction}?${sp.toString()}`
  }, [formAction, inputValue])

  const nothingFoundItem = useMemo(
    () => ({ url: searchPath, title: '', positions: new Set() }),
    [searchPath],
  )

  const {
    getInputProps,
    getItemProps,
    getMenuProps,
    getComboboxProps,

    highlightedIndex,
    isOpen,

    reset,
    toggleMenu,
  } = useCombobox({
    items: resultItems.length === 0 ? [nothingFoundItem] : resultItems,
    inputValue,
    defaultIsOpen: isFocused,
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        window.open(selectedItem.url, '_blank')
        onChangeInputValue('')
        reset()
        toggleMenu()
        inputRef.current?.blur()
        if (onResultPicked) {
          onResultPicked()
        }
        window.scroll({
          top: 0,
          left: 0,
          behavior: 'smooth',
        })
      }
    },
  })

  useFocusOnSlash(inputRef)

  useEffect(() => {
    if (isFocused) {
      initializeSearchIndex()
    }
  }, [initializeSearchIndex, isFocused])

  const searchResults = (() => {
    if (!isOpen || !inputValue.trim()) {
      return null
    }

    if (searchIndexError) {
      return (
        <div className='searchindex-error'>Error initializing search index</div>
      )
    }

    if (!searchIndex) {
      return showIndexing ? (
        <div className='indexing-warning'>
          <em>Initializing index</em>
        </div>
      ) : null
    }

    return (
      <>
        {resultItems.length === 0 && inputValue !== '/' ? (
          <div
            {...getItemProps({
              className:
                'nothing-found result-item ' +
                (highlightedIndex === 0 ? 'highlight' : ''),
              item: nothingFoundItem,
              index: 0,
            })}
          >
            No document titles found.
            <br />
            <a href={searchPath} target='_blank' rel='noopener noreferrer'>
              Site search for <code>{inputValue}</code>
            </a>
          </div>
        ) : (
          resultItems.map((item, i) => (
            <div
              {...getItemProps({
                key: item.url,
                className:
                  'result-item ' + (i === highlightedIndex ? 'highlight' : ''),
                item,
                index: i,
              })}
            >
              <HighlightMatch title={item.title} q={inputValue} />
              {Boolean(options.showUrl) ? (
                <>
                  <br />
                  <BreadcrumbURI uri={item.url} positions={item.positions} />
                </>
              ) : null}
            </div>
          ))
        )}
        {isFuzzySearchString(inputValue) && (
          <div className='fuzzy-engaged'>Searching by URI</div>
        )}
      </>
    )
  })()

  return (
    <form
      action={formAction}
      {...getComboboxProps({
        ref: formRef as any,
        className: 'search-form',
        id: 'nav-main-search',
        role: 'search',
        onSubmit: (e) => {
          e.preventDefault()
        },
      })}
      style={
        {
          '--background-color': options.backgroundColor,
        } as React.CSSProperties
      }
    >
      <div className='search-field'>
        <label htmlFor='main-q' className='visually-hidden'>
          Search MDN
        </label>

        <input
          {...getInputProps({
            type: 'search',
            className: isOpen
              ? 'has-search-results search-input-field'
              : 'search-input-field',
            id: 'main-q',
            name: 'q',
            placeholder: getPlaceholder(isFocused),
            onMouseOver: initializeSearchIndex,
            onFocus: () => {
              onChangeIsFocused(true)
            },
            onBlur: () => onChangeIsFocused(false),
            onKeyDown(event) {
              if (event.key === 'Escape' && inputRef.current) {
                toggleMenu()
              } else if (
                event.key === 'Enter' &&
                inputValue.trim() &&
                highlightedIndex === -1
              ) {
                inputRef.current!.blur()
                window.open(searchPath, '_blank')
              }
            },
            onChange(event) {
              if (event.target instanceof HTMLInputElement) {
                onChangeInputValue(event.target.value)
              }
            },
            ref: (input) => {
              inputRef.current = input
            },
          })}
        />

        <input
          type='submit'
          className='search-button'
          value=''
          aria-label='Поиск'
          onClick={() => {
            if (inputValue.trim() && inputValue !== '/') {
              window.open(searchPath, '_blank')
            }
          }}
        />
      </div>

      <div {...getMenuProps()}>
        {searchResults && (
          <div
            className='search-results'
            style={
              {
                '--text-color': options.textColor,
                '--selection-background': options.selectionBackground,
                '--selection-color': options.selectionColor,
              } as React.CSSProperties
            }
          >
            {searchResults}
          </div>
        )}
      </div>
    </form>
  )
}

class SearchErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError(error: Error) {
    console.error('There was an error while trying to render search', error)
    return { hasError: true }
  }
  render() {
    return this.state.hasError ? (
      <div>Error while rendering search. Check console for details.</div>
    ) : (
      (this.props as any).children
    )
  }
}

export default function SearchNavigateWidget(
  props: InnerSearchNavigateWidgetProps,
) {
  return (
    <SearchErrorBoundary>
      <InnerSearchNavigateWidget {...props} />
    </SearchErrorBoundary>
  )
}
