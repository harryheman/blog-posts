import { cloneElement, useEffect, useRef } from 'react'
import { TreeProps } from '.'
import { useWindowSize } from '../../hooks/useWindowSize'
import wrapHandlers from './wrapHandlers'

type Props = Pick<
  TreeProps,
  'direction' | 'keyProp' | 'nodeShape' | 'nodeProps' | 'gProps' | 'textProps'
> & {
  x: number
  y: number
  depth: number
  widthByDepth: Record<string, number>
  setWidthByDepth: React.Dispatch<React.SetStateAction<Record<string, number>>>
  marginLeft: number
}

// дополнительные отступы
const WIDTH_OFFSET = 20
const HEIGHT_OFFSET = 5

// компонент узла/фигуры
export default function Node(props: Props) {
  const key = props.keyProp as keyof Props

  const { width: windowWidth } = useWindowSize()

  // ссылки на фигуру и `text`
  const shapeRef = useRef<SVGElement>()
  const textRef = useRef<SVGTextElement>()

  useEffect(() => {
    if (!shapeRef.current || !textRef.current) return

    // вычисляем размеры `text`
    const textRect = textRef.current.getBoundingClientRect()

    if (!textRect) return

    // узлы на одинаковой глубине должна иметь одинаковую ширину
    props.setWidthByDepth((prev) => {
      const prevWidth = prev[props.depth] || 0

      if (prevWidth < textRect.width) {
        return { ...prev, [props.depth]: textRect.width }
      }

      return prev
    })

    // ширина узла
    const width = props.widthByDepth[props.depth] || 0

    // устанавливаем ширину фигуры
    shapeRef.current.setAttribute('width', String(width + WIDTH_OFFSET))
    // устанавливаем высоту фигуры
    shapeRef.current.setAttribute(
      'height',
      String(textRect.height + HEIGHT_OFFSET),
    )
    // `depth === 0` - корневой узел
    if (props.depth > 0) {
      // сдвигаем фигуру по оси Х
      shapeRef.current.setAttribute('x', String(-width / 2 - WIDTH_OFFSET / 2))
      // сдвигаем текст по оси Х
      textRef.current.setAttribute('x', String(-textRect.width / 2))
    } else {
      textRef.current.setAttribute(
        'x',
        String(
          WIDTH_OFFSET / 2 -
            Math.abs(Number(shapeRef.current.getAttribute('x'))),
        ),
      )
    }
    // сдвигаем фигуру по оси Y
    shapeRef.current.setAttribute(
      'y',
      String(-(textRect.height + HEIGHT_OFFSET) / 2),
    )
    // сдвигаем текст по оси Y
    textRef.current.setAttribute(
      'y',
      String((textRect.height - HEIGHT_OFFSET) / 2 - 1),
    )

    // последние (крайние справа) узлы могут выходить за пределы области просмотра

    // вычисляем размеры фигуры
    const shapeRect = shapeRef.current.getBoundingClientRect()

    // вычисляем общую ширину
    const fullWidth =
      Number(shapeRect.x) + Number(shapeRect.width) + props.marginLeft

    // определяем, есть ли переполнение
    const isOverflow = fullWidth > windowWidth

    if (props.depth > 0 && isOverflow) {
      // вычисляем величину переполнения
      const diff = fullWidth - windowWidth + props.marginLeft
      // сдвигаем фигуру по оси Х
      shapeRef.current.setAttribute(
        'x',
        String(Number(shapeRef.current.getAttribute('x')) - diff),
      )
      // сдвигаем текст по оси Х
      textRef.current.setAttribute(
        'x',
        String(Number(textRef.current.getAttribute('x')) - diff),
      )
    }
  })

  function getTransform() {
    return `translate(${props.x}, ${props.y})`
  }

  let nodePropsWithDefaults = props.nodeProps as Record<string, any>

  // @q нужны ли разные фигуры?
  // @q нужны ли дефолтные настройки?
  // switch (props.nodeShape) {
  //   case 'circle':
  //     nodePropsWithDefaults = { r: 5, ...nodePropsWithDefaults }
  //     break
  //   case 'image':
  //   case 'rect':
  //     nodePropsWithDefaults = {
  //       height: 10,
  //       width: 10,
  //       ...nodePropsWithDefaults,
  //     }
  //     nodePropsWithDefaults = {
  //       x: -nodePropsWithDefaults.width / 2,
  //       y: -nodePropsWithDefaults.height / 2,
  //       ...nodePropsWithDefaults,
  //     }
  //     break
  // }

  const wrappedGProps = wrapHandlers(
    props.gProps as Record<string, any>,
    props[key],
  )

  const wrappedNodeProps = wrapHandlers(nodePropsWithDefaults, props[key])

  const wrappedTextProps = wrapHandlers(
    props.textProps as Record<string, any>,
    props[key],
  )

  // подпись/текст
  const label =
    typeof props[key] === 'string' ? (
      <text ref={textRef} {...wrappedTextProps}>
        {props[key]}
      </text>
    ) : (
      <g {...wrappedTextProps}>{props[key]}</g>
    )

  // фигура
  const shape = cloneElement({ type: props.nodeShape } as React.ReactElement, {
    ref: shapeRef,
    ...wrappedNodeProps,
  })

  return (
    <g
      {...wrappedGProps}
      transform={getTransform()}
      direction={props.direction === 'rtl' ? 'rtl' : null}
    >
      {shape}
      {label}
    </g>
  )
}
