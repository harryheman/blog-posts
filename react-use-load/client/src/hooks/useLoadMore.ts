import { useEffect, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Item, FetchItems } from 'types'

type UseLoadMoreReturn = {
  loading: boolean
  items: Item[]
  loadMore: () => void
  hasMore: boolean
}

export const useLoadMore = (fetchItems: FetchItems): UseLoadMoreReturn => {
  const [items, setItems] = useState<Item[]>([])
  const page = Number(new URLSearchParams(window.location.search).get('page'))
  const currentPage = useRef(page > 0 ? page : 1)
  const allPages = useRef(0)
  const [loading, setLoading] = useState(false)

  const history = useHistory()

  async function loadItems(page: number) {
    setLoading(true)

    try {
      const { items, totalPages } = await fetchItems(page)

      setItems(items)

      if (allPages.current !== totalPages) {
        allPages.current = totalPages
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

  function loadMore() {
    if (currentPage.current < allPages.current && !loading) {
      const nextPage = currentPage.current + 1

      currentPage.current = nextPage

      history.replace(`?page=${nextPage}`)

      loadItems(nextPage)
    }
  }

  return {
    loading,
    items,
    loadMore,
    hasMore: currentPage.current < allPages.current
  }
}
