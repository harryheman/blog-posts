export function reconcileChildren(workingFiber, elements) {
  let index = 0
  let oldFiber = workingFiber.alternate && workingFiber.alternate.child
  let prevSibling = null

  while (index < elements.length || oldFiber) {
    const element = elements[index]
    let newFiber = null

    const sameType = oldFiber && element && element.type === oldFiber.type

    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        node: oldFiber.node,
        parent: workingFiber,
        alternate: oldFiber,
        action: 'UPDATE'
      }
    }

    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        node: null,
        parent: workingFiber,
        alternate: null,
        action: 'ADD'
      }
    }

    if (oldFiber && !sameType) {
      oldFiber.action = 'REMOVE'
      MyReact.nodesToRemove.push(oldFiber)
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if (index === 0) {
      workingFiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index += 1
  }
}
