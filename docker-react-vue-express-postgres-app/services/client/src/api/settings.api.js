const API_URI = 'http://localhost:5000/api/settings'

const fetchSettings = async () => {
  try {
    const response = await fetch(API_URI)
    if (!response.ok) throw response
    return await response.json()
  } catch (e) {
    throw e
  }
}

const settingsApi = { fetchSettings }

export default settingsApi
