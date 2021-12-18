/** @jsx h */
const ITEMS = 'hello there people'.split(' ')

const list = (items) => items.map((p) => <li class='list-item'>{p}</li>)

const vdom = (
  <section>
    <h1 class='title'>List</h1>
    <ul class='list' id='list'>
      {list(ITEMS)}
    </ul>
  </section>
)

const dom = render(vdom)

document.body.append(dom)

const json = JSON.stringify(vdom, null, 2)

document.body.append(render(<pre>{json}</pre>))

function render(vnode) {
  if (typeof vnode === 'string') {
    return document.createTextNode(vnode)
  }

  const n = document.createElement(vnode.nodeName)

  Object.keys(vnode.attributes).forEach((k) =>
    n.setAttribute(k, vnode.attributes[k])
  )

  vnode.children.forEach((c) => n.append(render(c)))

  return n
}

function h(nodeName, attrs, ...args) {
  const attributes = attrs ? attrs : {}
  const children = args.length ? [].concat(...args) : []

  return { nodeName, attributes, children }
}
