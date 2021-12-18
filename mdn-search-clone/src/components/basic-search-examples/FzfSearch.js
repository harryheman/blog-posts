import { useState } from 'react'
import { Fzf } from 'fzf'

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

const formattedData = data.map(({ title, url }) => ({
  title,
  url: url
    .split('/')
    .slice(1)
    .filter((i) => i !== 'docs')
    .join(' / ')
}))

const fzf = new Fzf(formattedData, {
  limit: 3,
  selector: (item) => item.url
})

const HighlightChars = ({ url, positions }) => {
  const chars = url.split('')

  const nodes = chars.map((char, i) => {
    if (positions.has(i)) {
      return <b key={i}>{char}</b>
    } else {
      return char
    }
  })

  return <>{nodes}</>
}

export const FzfSearch = () => {
  const [value, setValue] = useState('')
  const [results, setResults] = useState([])

  const search = (e) => {
    e.preventDefault()
    const results = fzf.find(value)
    // console.log(results)
    /*
      [
        {
          item: {
            title: 'Стандартные встроенные объекты',
            url: 'ru / Web / JavaScript / Reference / Global_Objects'
          },
          positions: Set(4) {14, 13, 12, 11},
          start: 11,
          end: 15,
          score: 104
        }
      ]
    */
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
            <HighlightChars
              url={result.item.url}
              positions={result.positions}
            />
          </li>
        ))}
      </ul>
    </>
  )
}
