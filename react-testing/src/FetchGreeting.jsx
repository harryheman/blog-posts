import { useState } from 'react'
import axios from 'axios'
import { useGreetingContext } from './GreetingProvider'

const FetchGreeting = ({ url }) => {
  const { state, actions } = useGreetingContext()
  const [btnClicked, setBtnClicked] = useState(false)

  const fetchGreeting = (url) =>
    axios
      .get(url)
      .then((res) => {
        const { data } = res
        const { greeting } = data
        actions.setSuccess(greeting)
        setBtnClicked(true)
      })
      .catch((e) => {
        actions.setError(e)
      })

  const btnText = btnClicked ? 'Готово' : 'Получить приветствие'

  return (
    <div>
      <button onClick={() => fetchGreeting(url)} disabled={btnClicked}>
        {btnText}
      </button>
      {state.greeting && <h1 data-cy='heading'>{state.greeting}</h1>}
      {state.error && <p role='alert'>Не удалось получить приветствие</p>}
    </div>
  )
}

export default FetchGreeting
