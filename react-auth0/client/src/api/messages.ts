const SERVER_URI = process.env.REACT_APP_SERVER_URI

export async function getPublicMessage() {
  let data = { message: '' }
  try {
    const response = await fetch(`${SERVER_URI}/messages/public`)
    if (!response.ok) throw response
    data = await response.json()
  } catch (e) {
    throw e
  } finally {
    return data.message
  }
}

export async function getProtectedMessage(token: string) {
  let data = { message: '' }
  try {
    const response = await fetch(`${SERVER_URI}/messages/protected`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if (!response.ok) throw response
    data = await response.json()
  } catch (e) {
    throw e
  } finally {
    return data.message
  }
}
