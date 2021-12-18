export const isJson = (item) => {
  try {
    item = JSON.parse(item)
  } catch (e) {
    return false
  }

  if (typeof item === 'object' && item !== null) {
    return true
  }

  return false
}
