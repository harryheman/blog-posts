import { commitRoot } from './commitRoot'
import { updateFunctionComponent, updateHostComponent } from './updateComponent'

// shim
window.requestIdleCallback =
  window.requestIdleCallback ||
  function (handler) {
    const start = Date.now()

    return setTimeout(() => {
      handler({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
      })
    }, 1)
  }

export function workLoop(deadline) {
  while (MyReact.nextUnitOfWork && deadline.timeRemaining() > 0) {
    MyReact.nextUnitOfWork = performUnitOfWork(MyReact.nextUnitOfWork)
  }

  if (!MyReact.nextUnitOfWork && MyReact.workingRoot) {
    requestAnimationFrame(commitRoot)
  }

  requestIdleCallback(workLoop)
}

function performUnitOfWork(fiber) {
  if (fiber.type instanceof Function) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }

  if (fiber.child) {
    return fiber.child
  }

  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}
