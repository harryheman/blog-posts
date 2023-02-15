const regex = /on[A-Z]/

function wrapper(func: Function, args: any) {
  return (event: Event) => func(event, ...args)
}

type Props = Record<string, Function>

export default function wrapHandlers(props: Props, ...args: any[]) {
  const handlers = Object.keys(props).filter(
    (propName) => regex.test(propName) && typeof props[propName] === 'function',
  )
  const wrappedHandlers = handlers.reduce((acc, handler) => {
    acc[handler] = wrapper(props[handler], args)
    return acc
  }, {} as any)
  return { ...props, ...wrappedHandlers }
}
