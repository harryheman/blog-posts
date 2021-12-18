export function useState(initialState) {
  const oldHook =
    MyReact.workingFiber.alternate &&
    MyReact.workingFiber.alternate.hooks &&
    MyReact.workingFiber.alternate.hooks[MyReact.hookIndex]

  const hook = {
    state: oldHook
      ? oldHook.state
      : initialState instanceof Function
      ? initialState()
      : initialState,
    queue: []
  }

  const actions = oldHook ? oldHook.queue : []
  actions.forEach((action) => {
    hook.state = action instanceof Function ? action(hook.state) : action
  })

  const setState = (action) => {
    hook.queue.push(action)

    MyReact.workingRoot = {
      node: MyReact.currentRoot.node,
      props: MyReact.currentRoot.props,
      alternate: MyReact.currentRoot
    }

    MyReact.nextUnitOfWork = MyReact.workingRoot
    MyReact.nodesToRemove = []
  }

  MyReact.workingFiber.hooks.push(hook)
  MyReact.hookIndex += 1

  return [hook.state, setState]
}
