export const isEvent = (key) => key.startsWith('on')
export const isProperty = (key) => key !== 'children' && !isEvent(key)
export const wasAdded = (prev, next) => (key) => prev[key] !== next[key]
export const wasRemoved = (next) => (key) => !(key in next)
