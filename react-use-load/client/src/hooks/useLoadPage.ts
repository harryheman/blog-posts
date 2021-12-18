import { useEffect, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Item, FetchItems } from 'types'

type UseLoadPageReturn = {
  loading: boolean
  items: Item[]
  hasNext: boolean
  hasPrev: boolean
  loadNext: () => void
  loadPrev: () => void
  currentPage: number
  allPages: number
  loadPage: (page: number) => void
}

type PagesCache = {
  [page: string]: Item[]
}

export const useLoadPage = (fetchItems: FetchItems): UseLoadPageReturn => {
  const [items, setItems] = useState<Item[]>([])
  const cachedItems = useRef<PagesCache>({})
  const page = Number(new URLSearchParams(window.location.search).get('page'))
  const currentPage = useRef(page > 0 ? page : 1)
  const firstPage = useRef(Infinity)
  const allPages = useRef(0)
  const [loading, setLoading] = useState(false)

  const history = useHistory()

  async function loadItems(page: number) {
    if (cachedItems.current[page]) {
      return setItems(cachedItems.current[page])
    }

    setLoading(true)

    try {
      const { items, totalPages } = await fetchItems(page)

      setItems(items)

      cachedItems.current[page] = items

      if (allPages.current !== totalPages) {
        allPages.current = totalPages
        firstPage.current = 1
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems(currentPage.current)
    // eslint-disable-next-line
  }, [])

  function loadPage(page: number) {
    if (loading) return

    currentPage.current = page

    history.replace(`?page=${page}`)

    loadItems(page)
  }

  function loadNext() {
    if (currentPage.current < allPages.current) {
      const nextPage = currentPage.current + 1
      loadPage(nextPage)
    }
  }

  function loadPrev() {
    if (currentPage.current > firstPage.current) {
      const nextPage = currentPage.current - 1
      loadPage(nextPage)
    }
  }

  return {
    loading,
    items,
    hasNext: currentPage.current < allPages.current,
    hasPrev: currentPage.current > firstPage.current,
    loadNext,
    loadPrev,
    currentPage: currentPage.current,
    allPages: allPages.current,
    loadPage
  }
}
