import React, { createContext, useContext, useMemo, useState } from 'react'

const createSetters = (setters, setState) => {
  const _setters = {}

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

export function createStore(store) {
  const StateContext = createContext(store.state)
  const SetterContext = createContext(store.setters)

  const Provider = ({ children }) => {
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

  return [Provider, useStore, useSetter]
}
