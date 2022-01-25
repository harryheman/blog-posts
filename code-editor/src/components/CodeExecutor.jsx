import { Button } from './Button'

export const CodeExecutor = ({ srcDoc, runCode }) => (
  <div className='code-executor'>
    <Button className='btn run' title='Run code' onClick={runCode} />
    <iframe
      srcDoc={srcDoc}
      title='output'
      sandbox='allow-scripts'
      className='code-frame'
    />
  </div>
)
