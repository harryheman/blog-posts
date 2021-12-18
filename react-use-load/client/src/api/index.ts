import { AllItems, FetchItems } from 'types'

const SERVER_URL = 'http://localhost:4000'

export const fetchAllItems = async (): Promise<AllItems> => {
  let data = { items: [] }
  try {
    const res = await fetch(`${SERVER_URL}/all-items`)
    if (res.ok) {
      data = await res.json()
    }
  } catch (e) {
    console.error(e)
  } finally {
    return data
  }
}

export const fetchItemsAndPages: FetchItems = async (page: number) => {
  let data = { items: [], totalPages: 0 }
  try {
    const res = await fetch(`${SERVER_URL}/more-items?page=${page}`)
    if (res.ok) {
      data = await res.json()
    }
  } catch (e) {
    console.error(e)
  } finally {
    return data
  }
}

export const fetchItemsByPage: FetchItems = async (page: number) => {
  let data = { items: [], totalPages: 0 }
  try {
    const res = await fetch(`${SERVER_URL}/items-by-page?page=${page}`)
    if (res.ok) {
      data = await res.json()
    }
  } catch (e) {
    console.error(e)
  } finally {
    return data
  }
}
