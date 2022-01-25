import { useState, useRef } from 'react'
import { Controlled } from 'react-codemirror2'
import { Button } from './Button'
import { ThemeSelector } from './ThemeSelector'

import 'codemirror/lib/codemirror.css'

import 'codemirror/mode/xml/xml'
import 'codemirror/mode/css/css'
import 'codemirror/mode/javascript/javascript'

import 'codemirror/addon/edit/closetag'
import 'codemirror/addon/edit/closebrackets'
import 'codemirror/addon/edit/matchtags'
import 'codemirror/addon/edit/matchbrackets'

export const CodeEditor = ({ mode, value, setValue }) => {
  const [theme, setTheme] = useState('dracula')
  const fileInputRef = useRef()

  const changeCode = (editor, data, value) => {
    setValue(value)
  }

  const isFileValid = (file) =>
    (mode === 'xml' && file.type === 'text/html') || file.type.includes(mode)

  const readFile = (file) => {
    if (!isFileValid(file)) return

    const reader = new FileReader()

    reader.onloadend = () => {
      setValue(reader.result)
    }

    reader.readAsText(file)
  }

  const loadFile = (e) => {
    const file = e.target.files[0]

    readFile(file)
  }

  const onDrop = (editor, e) => {
    e.preventDefault()

    const file = e.dataTransfer.items[0].getAsFile()

    readFile(file)
  }

  return (
    <div className='code-editor'>
      <ThemeSelector setTheme={setTheme} />
      <Button
        className='btn file'
        title='Load file'
        onClick={() => {
          fileInputRef.current.click()
        }}
      />
      <input
        type='file'
        accept='text/html, text/css, text/javascript'
        style={{ display: 'none' }}
        aria-hidden='true'
        ref={fileInputRef}
        onChange={loadFile}
      />
      <Controlled
        value={value}
        onBeforeChange={changeCode}
        onDrop={onDrop}
        options={{
          mode,
          theme,
          lint: true,
          lineNumbers: true,
          lineWrapping: true,
          spellcheck: true,
          autoCloseTags: true,
          autoCloseBrackets: true,
          matchTags: true,
          matchBrackets: true
        }}
      />
    </div>
  )
}
