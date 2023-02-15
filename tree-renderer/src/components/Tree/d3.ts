import { hierarchy, tree } from 'd3-hierarchy'
import { TreeProps } from '.'

type Props = Pick<
  TreeProps,
  'data' | 'getChildren' | 'direction' | 'margins'
> & {
  width: number
  height: number
}

export default function getTreeData(props: Props) {
  // дефолтные отступы
  const margins = props.margins || {
    bottom: 10,
    left: props.direction !== 'rtl' ? 20 : 150,
    right: props.direction !== 'rtl' ? 150 : 20,
    top: 10,
  }

  // ширина дерева
  const contentWidth = props.width - margins.left - margins.right
  // высота дерева
  const contentHeight = props.height - margins.top - margins.bottom

  // обрабатываем данные
  const data = hierarchy<any>(props.data, props.getChildren)
  // формируем элементы дерева
  const root = tree<any>().size([contentHeight, contentWidth])(data)

  // d3 генерирует дерево сверху вниз
  // для того, чтобы изменить направление дерева нужно поменять `x` и `y` местами
  // пути
  const links = root.links().map((link) => ({
    ...link,
    source: {
      ...link.source,
      x:
        props.direction !== 'rtl'
          ? link.source.y
          : contentWidth - link.source.y,
      y: link.source.x,
    },
    target: {
      ...link.target,
      x:
        props.direction !== 'rtl'
          ? link.target.y
          : contentWidth - link.target.y,
      y: link.target.x,
    },
  }))

  // узлы
  const nodes = root.descendants().map((node) => ({
    ...node,
    x: props.direction !== 'rtl' ? node.y : contentWidth - node.y,
    y: node.x,
  }))

  return {
    margins,
    links,
    nodes,
  }
}
