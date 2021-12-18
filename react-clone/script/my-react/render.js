export function render(element, container) {
  MyReact.workingRoot = {
    node: container,
    props: {
      children: [element]
    },
    alternate: MyReact.currentRoot
  }
  MyReact.nodesToRemove = []
  MyReact.nextUnitOfWork = MyReact.workingRoot
}
