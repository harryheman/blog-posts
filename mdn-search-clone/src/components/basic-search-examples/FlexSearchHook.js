import { useState, useRef, useMemo, useEffect } from 'react'
import { Index } from 'flexsearch'

const data = [
  {
    title: 'Веб-технологии для разработчиков',
    url: '/ru/docs/Web'
  },
  {
    title: 'Стандартные встроенные объекты',
    url: '/ru/docs/Web/JavaScript/Reference/Global_Objects'
  },
  {
    title: 'Справочник по JavaScript',
    url: '/ru/docs/Web/JavaScript/Reference'
  },
  {
    title: 'JavaScript',
    url: '/ru/docs/Web/JavaScript'
  },
  {
    title: 'Array',
    url: '/ru/docs/Web/JavaScript/Reference/Global_Objects/Array'
  }
]

const flex = new Index({ tokenize: 'forward' })

data.forEach(({ title }, i) => {
  flex.add(i, title)
})

const HighlightMatch = ({ title, q }) => {
  const words = q.trim().toLowerCase().split(/[ ,]+/)
  const regexWords = words.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const regex = `\\b(${regexWords.join('|')})`
  const parts = title.split(new RegExp(regex, 'gi'))

  return (
    <>
      {parts.map((part, i) => {
        const key = `${part}:${i}`
        if (words.includes(part.toLowerCase())) {
          return <mark key={key}>{part}</mark>
        } else {
          return <span key={key}>{part}</span>
        }
      })}
    </>
  )
}

const useFlexSearch = (query, providedIndex, store, searchOptions) => {
  const [index, setIndex] = useState(null)

  useEffect(() => {
    if (!providedIndex && !store)
      console.warn(
        'A FlexSearch index and store was not provided. Your search results will be empty.'
      )
    else if (!providedIndex)
      console.warn(
        'A FlexSearch index was not provided. Your search results will be empty.'
      )
    else if (!store)
      console.warn(
        'A FlexSearch store was not provided. Your search results will be empty.'
      )
  }, [providedIndex, store])

  useEffect(() => {
    if (!providedIndex) {
      setIndex(null)
      return
    }

    if (providedIndex instanceof Index) {
      setIndex(providedIndex)
      return
    }

    // Если `providedIndex` - это строка,
    if (typeof providedIndex === 'string') {
      const importedIndex = new Index(searchOptions)
      // Данные для поиска импортируются из локального хранилища
      importedIndex.import(providedIndex, localStorage.getItem(providedIndex))

      setIndex(importedIndex)
      return
    }
  }, [providedIndex, searchOptions])

  return useMemo(() => {
    if (!query || !index || !store) return []

    const rawResults = index.search(query, searchOptions)

    return rawResults.map((id) => store[id])
  }, [query, index, store, searchOptions])
}

export const FlexSearchHook = () => {
  const [value, setValue] = useState('')
  const inputRef = useRef()
  const results = useFlexSearch(value, flex, data)
  // console.log(results)

  const search = (e) => {
    e.preventDefault()
    setValue(inputRef.current.value.trim())
  }

  return (
    <>
      <form onSubmit={search}>
        <input type='text' defaultValue='' ref={inputRef} />
        <button>Search</button>
      </form>
      <ul>
        {results.map((result, i) => (
          <li key={i}>
            <HighlightMatch title={result.title} q={value} />
          </li>
        ))}
      </ul>
    </>
  )
}
