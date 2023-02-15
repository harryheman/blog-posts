import { useState } from 'react'
import { TreeProps } from '.'
import getTreeData from './d3'
import Link from './Link'
import Node from './Node'

type Props = Pick<
  TreeProps,
  | 'width'
  | 'height'
  | 'children'
  | 'direction'
  | 'keyProp'
  | 'margins'
  | 'nodeShape'
  | 'nodeProps'
  | 'pathFunc'
  | 'pathProps'
  | 'svgProps'
  | 'gProps'
  | 'textProps'
> &
  ReturnType<typeof getTreeData>

export default function Container(props: Props) {
  const key = props.keyProp as string
  // { [глубина]: максимальная ширина }
  const [widthByDepth, setWidthByDepth] = useState<Record<string, number>>({})

  return (
    <div className='tree-box'>
      <svg width={props.width} height={props.height} {...props.svgProps}>
        {props.children}
        <g transform={`translate(${props.margins.left}, ${props.margins.top})`}>
          {/* пути */}
          {props.links.map((link) => {
            return (
              <Link
                key={link.target.data[key]}
                keyProp={key}
                pathFunc={props.pathFunc}
                pathProps={{
                  ...props.pathProps,
                  ...link.target.data.pathProps,
                }}
                source={link.source}
                target={link.target}
                x1={link.source.x}
                x2={link.target.x}
                y1={link.source.y}
                y2={link.target.y}
              />
            )
          })}
          {/* узлы */}
          {props.nodes.map((node) => {
            return (
              <Node
                direction={props.direction}
                key={node.data[key]}
                keyProp={key}
                nodeShape={props.nodeShape}
                nodeProps={{ ...props.nodeProps, ...node.data.nodeProps }}
                gProps={{ ...props.gProps, ...node.data.gProps }}
                textProps={{ ...props.textProps, ...node.data.textProps }}
                depth={node.depth}
                widthByDepth={widthByDepth}
                setWidthByDepth={setWidthByDepth}
                marginLeft={props.margins.left}
                x={node.x}
                y={node.y}
                {...node.data}
              />
            )
          })}
        </g>
      </svg>
    </div>
  )
}
