import './globals'
import { createElement } from './createElement'
import { render } from './render'
import { useState } from './useState'
import { workLoop } from './workLoop'

requestIdleCallback(workLoop)

export default {
  createElement,
  render,
  useState
}
