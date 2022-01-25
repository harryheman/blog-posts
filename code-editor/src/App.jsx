import './App.scss'
import { useState } from 'react'
import { Tabs } from './components/Tabs'
import { CodeEditor } from './components/CodeEditor'
import { CodeExecutor } from './components/CodeExecutor'

const initialHTML = '<h1>hi</h1>'
const initialCSS = `
h1 {
  color: green;
}
`
const initialJavaScript = `
document.querySelector("h1").addEventListener('click', function () {
  this.textContent = "bye"
  this.style.color = "red"
}, { once: true })
`

export default function App() {
  const [mode, setMode] = useState('html')
  const [html, setHtml] = useState(initialHTML)
  const [css, setCss] = useState(initialCSS.trim())
  const [js, setJs] = useState(initialJavaScript.trim())
  const [srcDoc, setSrcDoc] = useState('')

  const runCode = () => {
    setSrcDoc(
      `<html>
        <style>${css}</style>
        <body>${html}</body>
        <script>${js}</script>
      </html>`
    )
  }

  const propsByMode = {
    html: {
      mode: 'xml',
      value: html,
      setValue: setHtml
    },
    css: {
      mode: 'css',
      value: css,
      setValue: setCss
    },
    js: {
      mode: 'javascript',
      value: js,
      setValue: setJs
    }
  }

  return (
    <div className='app'>
      <h1>React Code Editor</h1>
      <Tabs mode={mode} setMode={setMode} />
      <CodeEditor {...propsByMode[mode]} />
      <CodeExecutor srcDoc={srcDoc} runCode={runCode} />
    </div>
  )
}
