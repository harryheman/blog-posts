import 'codemirror/theme/dracula.css'
import 'codemirror/theme/material.css'
import 'codemirror/theme/mdn-like.css'

const themes = ['dracula', 'material', 'mdn-like']

export const ThemeSelector = ({ setTheme }) => {
  const selectTheme = ({ target: { value } }) => {
    setTheme(value)
  }

  return (
    <div className='theme-selector'>
      <label htmlFor='theme'>Theme: </label>
      <select id='theme' name='theme' onChange={selectTheme}>
        {themes.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
  )
}
