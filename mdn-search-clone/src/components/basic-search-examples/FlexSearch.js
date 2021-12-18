import { useState } from 'react'
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

export const FlexSearch = () => {
  const [value, setValue] = useState('')
  const [results, setResults] = useState([])

  const search = (e) => {
    e.preventDefault()
    const indexes = flex.search(value, {
      limit: 3
    })
    // console.log(indexes) // [3, 2]
    const results = indexes.map((i) => data[i])
    setResults(results)
  }

  return (
    <>
      <form onSubmit={search}>
        <input
          type='text'
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
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
