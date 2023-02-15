import { TreeProps } from '.'
import wrapHandlers from './wrapHandlers'

function diagonal(x1: number, y1: number, x2: number, y2: number) {
  return `M${x1},${y1}C${(x1 + x2) / 2},${y1} ${
    (x1 + x2) / 2
  },${y2} ${x2},${y2}`
}

type Props = Pick<TreeProps, 'pathFunc' | 'pathProps' | 'keyProp'> & {
  source: any
  target: any
} & {
  x1: number
  x2: number
  y1: number
  y2: number
}

// компонент ссылки/пути
export default function Link(props: Props) {
  const key = props.keyProp as string

  const wrappedProps = wrapHandlers(
    props.pathProps as Record<string, any>,
    props.source.data[key],
    props.target.data[key],
  )

  const d = props.pathFunc
    ? props.pathFunc(props.x1, props.y1, props.x2, props.y2)
    : diagonal(props.x1, props.y1, props.x2, props.y2)

  return <path {...wrappedProps} d={d} />
}
