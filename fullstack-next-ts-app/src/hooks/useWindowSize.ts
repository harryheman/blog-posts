import { useTheme } from '@mui/material/styles'
import { useEffect, useState } from 'react'

export function useWindowSize() {
  const theme = useTheme()
  const [width, setWidth] = useState(0)
  const [isTablet, setTablet] = useState(false)
  const [isMobile, setMobile] = useState(false)

  useEffect(() => {
    function onResize() {
      const width = window.innerWidth
      setWidth(width)
      setTablet(width < theme.breakpoints.values.md)
      setMobile(width < theme.breakpoints.values.sm)
    }

    window.addEventListener('resize', onResize)

    onResize()

    return () => window.removeEventListener('resize', onResize)
  }, [])

  return { width, isTablet, isMobile }
}
