import { useCallback, useEffect, useRef } from 'react'
import Loader from 'react-loader-spinner'
import { ProductList } from 'components'
import { fetchItemsByPage } from 'api'
import { useLoadPage } from 'hooks/useLoadPage'

export const ProductsByPage = () => {
  const {
    loading,
    items,
    loadNext,
    loadPrev,
    hasNext,
    hasPrev,
    currentPage,
    allPages,
    loadPage
  } = useLoadPage(fetchItemsByPage)
  const nextBtnRef = useRef<HTMLButtonElement | null>(null)
  const prevBtnRef = useRef<HTMLButtonElement | null>(null)

  const PageLinks = () => (
    <nav>
      <ul>
        {Array.from({ length: allPages }).map((_, i) => {
          const pageNum = i + 1
          return (
            <li
              key={pageNum}
              onClick={() => {
                if (!loading) {
                  loadPage(pageNum)
                }
              }}
              className={`page-link ${
                currentPage === pageNum ? 'current' : ''
              }`}
            >
              {i + 1}
            </li>
          )
        })}
      </ul>
    </nav>
  )

  const PrevBtn = () =>
    hasPrev ? (
      <button
        onClick={() => {
          loadPrev()
          window.scrollTo(0, 0)
        }}
        ref={prevBtnRef}
        disabled={loading}
        className='btn prev'
      >
        {loading ? '🚫' : '👈'}
      </button>
    ) : (
      <button className='btn' role='presentation'></button>
    )

  const NextBtn = () =>
    hasNext ? (
      <button
        onClick={() => {
          loadNext()
          window.scrollTo(0, 0)
        }}
        ref={nextBtnRef}
        disabled={loading}
        className='btn next'
      >
        {loading ? '🚫' : '👉'}
      </button>
    ) : (
      <button className='btn' role='presentation'></button>
    )

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowRight':
        return nextBtnRef.current?.click()
      case 'ArrowLeft':
        return prevBtnRef.current?.click()
      default:
        return
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onKeyDown])

  return (
    <>
      <div className='control-box'>
        <PrevBtn />
        <PageLinks />
        <NextBtn />
      </div>

      {loading ? (
        <Loader type='Oval' color='deepskyblue' width={50} className='loader' />
      ) : (
        <>
          <ProductList products={items} />
          <div className='control-box'>
            <PrevBtn />
            <PageLinks />
            <NextBtn />
          </div>
        </>
      )}
    </>
  )
}
