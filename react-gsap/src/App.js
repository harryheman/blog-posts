import './App.css'
import { useState, useCallback, useRef, useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { Selector } from './components/Selector'
import { componentMap } from './components'

const componentKeys = Object.keys(componentMap)
const defaultComponentKey = componentKeys[0]

export default function App() {
  // force update hook version
  const [state, updateState] = useState()
  const forceUpdate = useCallback(() => updateState({}), [])

  // state for selected component
  const [selectedComponent, setSelectedComponent] =
    useState(defaultComponentKey)

  const selectComponent = useCallback(({ selectedItem }) => {
    setSelectedComponent(selectedItem)
  }, [])

  // link to animating element
  const el = useRef()

  useLayoutEffect(() => {
    gsap.from(el.current, {
      opacity: 0,
      scale: 0.75,
      duration: 0.75
    })
  }, [selectedComponent])

  const ComponentToRender = componentMap[selectedComponent]

  return (
    <>
      <Selector
        items={componentKeys}
        initialSelectedItem={defaultComponentKey}
        onSelectedItemChange={selectComponent}
      />
      <div ref={el} className='col'>
        <ComponentToRender update={state} />
      </div>
      <button className='btn reload' onClick={forceUpdate}>
        Reload
      </button>
    </>
  )
}
