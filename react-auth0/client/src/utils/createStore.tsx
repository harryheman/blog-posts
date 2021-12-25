import React, { createContext, useContext, useMemo, useState } from 'react'
import { State, InitialSetters, ProxySetters, Store, Children } from 'types'

const createSetters = (
  setters: InitialSetters,
  setState: React.Dispatch<(prevState: State) => State>
) => {
  const _setters = {} as ProxySetters

  for (const key in setters) {
    _setters[key] = (...args) => {
      setState((state) => {
        const newState = setters[key](state, ...args)

        return { ...state, ...newState }
      })
    }
  }

  return _setters
}

export function createStore(store: Store) {
  const StateContext = createContext<State>(store.state)
  const SetterContext = createContext<ProxySetters>(store.setters)

  const Provider = ({ children }: Children) => {
    const [state, setState] = useState(store.state)
    const setters = useMemo(() => createSetters(store.setters, setState), [])

    return (
      <StateContext.Provider value={state}>
        <SetterContext.Provider value={setters}>
          {children}
        </SetterContext.Provider>
      </StateContext.Provider>
    )
  }

  const useStore = () => useContext(StateContext)
  const useSetter = () => useContext(SetterContext)

  return [Provider, useStore, useSetter] as const
}
