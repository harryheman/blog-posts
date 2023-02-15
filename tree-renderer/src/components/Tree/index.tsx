import getTreeData from './d3'
import Container from './Container'
import { useWindowSize } from '../../hooks/useWindowSize'

// направление дерева
// @q нужны ли нам направления?
export enum DIRECTION {
  LTR = 'ltr',
  RTL = 'rtl',
}

// фигура узла
// @q нужны ли нам разные фигуры?
export enum SHAPE {
  CIRCLE = 'circle',
  IMAGE = 'image',
  POLYGON = 'polygon',
  RECT = 'rect',
}

export type TreeProps = {
  // объект данных
  data: any
  // ширина дерева
  width?: number
  // высота дерева
  height?: number
  // направление дерева
  direction?: DIRECTION
  // потомки
  children?: React.ReactNode
  // функция для получения дочерних узлов
  getChildren?: (d: { children?: React.ReactNode }) =>
    | Iterable<{
        children?: React.ReactNode
      }>
    | null
    | undefined
  // ключ объекта
  keyProp?: string
  // отступы
  margins?: {
    bottom: number
    left: number
    right: number
    top: number
  }
  // функция рисования пути
  pathFunc?: Function
  // пропы для `path`
  pathProps?: Record<string, any>
  // фигура узла
  nodeShape?: SHAPE
  // пропы для фигуры
  nodeProps?: Record<string, any>
  // пропы для `svg`
  svgProps?: Record<string, any>
  // пропы для `g`
  gProps?: object
  // пропы для `text`
  textProps?: Record<string, any>
}

export default function Tree(props: TreeProps) {
  // по умолчанию размеры дерева совпадают с размерами области просмотра
  const { width: windowWidth, height: windowHeight } = useWindowSize()

  // @q нужно ли ограничивать ширину областью просмотра?
  const width = props.width || windowWidth
  const height = props.height || windowHeight

  return (
    <Container
      width={width}
      height={height}
      direction={props.direction || DIRECTION.LTR}
      keyProp={props.keyProp || 'name'}
      nodeShape={props.nodeShape || SHAPE.RECT}
      nodeProps={props.nodeProps || {}}
      pathFunc={props.pathFunc}
      pathProps={{ className: 'link', ...props.pathProps }}
      svgProps={props.svgProps || {}}
      gProps={{ className: 'node', ...props.gProps }}
      textProps={props.textProps || {}}
      {...getTreeData({ ...props, width, height })}
    >
      {props.children}
    </Container>
  )
}
