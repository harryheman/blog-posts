import { Button } from './Button'

const tabs = ['HTML', 'CSS', 'JS']

export const Tabs = ({ mode, setMode }) => {
  const changeMode = ({ target: { textContent } }) => {
    setMode(textContent.toLowerCase())
  }

  return (
    <div className='tabs'>
      {tabs.map((m) => (
        <Button
          key={m}
          title={m}
          onClick={changeMode}
          className={m.toLowerCase() === mode ? 'current' : ''}
        />
      ))}
    </div>
  )
}
