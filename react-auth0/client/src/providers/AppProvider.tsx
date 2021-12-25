import { Store } from 'types'
import { createStore } from 'utils/createStore'

const store: Store = {
  state: {
    loading: false,
    error: null
  },
  setters: {
    setLoading: (_, loading: boolean) => ({ loading }),
    setError: (_, error: any) => ({ error })
  }
}

export const [AppProvider, useAppStore, useAppSetter] = createStore(store)
