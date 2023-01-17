import { CSSProperties, FC, PropsWithChildren, useRef } from 'react'
import useOnScreen from '../hooks/useOnScreen'

const AnimateIn: FC<
  PropsWithChildren<{ from: CSSProperties; to: CSSProperties }>
> = ({ from, to, children }) => {
  const ref = useRef<HTMLDivElement>(null)
  const onScreen = useOnScreen(ref)
  const defaultStyles: CSSProperties = {
    transition: '0.6s'
  }

  return (
    <div
      ref={ref}
      style={
        onScreen
          ? {
              ...defaultStyles,
              ...to
            }
          : {
              ...defaultStyles,
              ...from
            }
      }
    >
      {children}
    </div>
  )
}

const FadeIn: FC<PropsWithChildren> = ({ children }) => (
  <AnimateIn from={{ opacity: 0 }} to={{ opacity: 1 }}>
    {children}
  </AnimateIn>
)

const ScaleIn: FC<PropsWithChildren> = ({ children }) => (
  <AnimateIn from={{ transform: 'scale(0.4)' }} to={{ transform: 'scale(1)' }}>
    {children}
  </AnimateIn>
)

export enum SLIDE_DIRECTION {
  UP = 'translateY(-50%)',
  DOWN = 'translateY(50%)',
  LEFT = 'translateX(-50%)',
  RIGHT = 'translateX(50%)'
}

const SlideIn: FC<PropsWithChildren<{ direction: SLIDE_DIRECTION }>> = ({
  direction,
  children
}) => (
  <AnimateIn
    from={{ transform: direction }}
    to={{ transform: 'translate(0, 0)' }}
  >
    {children}
  </AnimateIn>
)

const Animate = {
  FadeIn,
  ScaleIn,
  SlideIn
}

export default Animate
