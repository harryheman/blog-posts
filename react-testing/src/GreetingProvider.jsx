import { createContext, useContext, useReducer } from 'react'

const initialState = {
  error: null,
  greeting: null
}

const SUCCESS = 'SUCCESS'
const ERROR = 'ERROR'

function greetingReducer(state, action) {
  switch (action.type) {
    case SUCCESS:
      return {
        error: null,
        greeting: action.payload
      }
    case ERROR:
      return {
        error: action.payload,
        greeting: null
      }
    default:
      return state
  }
}

const createGreetingActions = (dispatch) => ({
  setSuccess(success) {
    dispatch({
      type: SUCCESS,
      payload: success
    })
  },
  setError(error) {
    dispatch({
      type: ERROR,
      payload: error
    })
  }
})

const GreetingContext = createContext()

export const GreetingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(greetingReducer, initialState)

  const actions = createGreetingActions(dispatch)

  return (
    <GreetingContext.Provider value={{ state, actions }}>
      {children}
    </GreetingContext.Provider>
  )
}

export const useGreetingContext = () => useContext(GreetingContext)
