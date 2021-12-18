import '../style.scss'
import MyReact from './my-react'

const buttonStyles = {
  border: 'none',
  outline: 'none',
  padding: '0.3rem 0.5rem',
  marginLeft: '0.5rem',
  backgroundImage: 'linear-gradient(yellow, orange)',
  borderRadius: '2px',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
  cursor: 'pointer'
}

/** @jsx MyReact.createElement */
function Counter() {
  const [value, setValue] = MyReact.useState(1)
  const [count, setCount] = MyReact.useState(1)

  return (
    <section>
      <h1 className='title'>Hello from MyReact!</h1>
      <div className='box'>
        <input
          style='width: 80px; padding: 0.15rem 0.5rem;'
          type='number'
          value={value}
          onInput={(e) => {
            setValue(Number(e.target.value))
          }}
        />
        <button
          style={buttonStyles}
          onClick={() => {
            setCount((count) => count + value)
          }}
        >
          Increment
        </button>
      </div>
      <h2 className='subtitle'>
        Count: <span className='count-value'>{count}</span>
      </h2>
      <ul className='list'>
        {['React', 'from', 'scratch'].map((item) => (
          <li>{item}</li>
        ))}
      </ul>
    </section>
  )
}

MyReact.render(<Counter />, document.getElementById('app'))
