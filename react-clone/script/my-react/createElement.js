const createTextElement = (nodeValue) => ({
  type: 'TEXT_ELEMENT',
  props: {
    nodeValue,
    children: []
  }
})

export const createElement = (type, props, ...children) => ({
  type,
  props: {
    ...props,
    children: children
      .flat()
      .map((child) =>
        typeof child === 'object' ? child : createTextElement(child)
      )
  }
})
