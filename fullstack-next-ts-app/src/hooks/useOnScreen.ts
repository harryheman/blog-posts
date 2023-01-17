import { useEffect, useState } from 'react'

const useOnScreen = (
  ref: React.RefObject<HTMLElement | null>,
  observerOptions?: IntersectionObserverInit
) => {
  const [isIntersecting, setIsIntersection] = useState(false)

  useEffect(() => {
    const observable = ref.current as HTMLElement

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersection(entry.isIntersecting)
    }, observerOptions)

    observer.observe(observable)

    return () => observer.unobserve(observable)
  }, [])

  return isIntersecting
}

export default useOnScreen
