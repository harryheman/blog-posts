# `React + GSAP` Examples :metal:

[Песочница](https://codesandbox.io/s/react-gsap-p2ntz)

__Что такое `GSAP`?__

Если в двух словах, то `GSAP` (The GreenSock Animation Platform) - это набор инструментов для реализации анимации любого уровня сложности с помощью `JavaScript`.

- [Начало работы с GSAP](https://greensock.com/get-started/)

<cut />

__Использование__

_Установка_

```bash
cd react-gsap

yarn add gsap
```

_Импорт_

```javascript
import { gsap } from 'gsap'
```

- [Ядро `GSAP`](https://greensock.com/docs/v3/GSAP)

_Пример_

```javascript
gsap.to('#logo', { duration: 1, x: 100 })
// or
gsap.from("#logo", { duration: 1, x: 100 })
// or
gsap.fromTo("#logo", { width: 0, height: 0 }, { duration: 1.5, width: 100, height: 200 })
```

Методы `gsap.to` и `gsap.from` принимают 2 параметра:

- `targets` - анимируемый объект (или объекты). Это может быть один объект, массив объектов, ссылка на `DOM-элемент` или `CSS-селектор` типа `'.myClass'` (в последнем случае `GSAP` использует метод `document.querySelectorAll` для получения ссылок на анимируемые объекты)
- `vars` - объект с настройками анимации (`opacity: 0.5, rotation: 45, duration: 1, onComplete: (message) => console.log(message), onCompleteParams: ['потрачено']` и т.д.)

Метод `gsap.fromTo` принимает 3 параметра: `targets`, `startVars`, `endVars`.

- [Tween](https://greensock.com/docs/v3/GSAP/Tween)
- [Timeline](https://greensock.com/docs/v3/GSAP/Timeline)

__Как организован проект?__

Проект включает в себя `16` примеров, упакованных в одно приложение. Примеры условно можно можно разделить на простые и продвинутые. Переключение между примерами осуществляется с помощью селектора, реализованного с помощью хука `useSelector` из [`Downshift`](https://www.downshift-js.com/). По каждому примеру имеется краткое описание (см. ниже). Для максимального эффекта рекомендую следующий алгоритм:

- хотя бы кратко знакомимся с материалами по ссылкам, приведенным выше
- читаем описание примера
- смотрим, как работает соответствующий компонент
- изучаем исходный код компонента
- воспроизводим компонент в своем приложении

# Простые примеры

## Применение анимации к одному (целевому) элементу

`gsap` требуется доступ к анимируемому `DOM-элементу`. Для предоставления такого доступа используется хук `useRef`. Разумеется, в момент анимирования элемент должен быть отрендерен, поэтому `gsap` должен запускаться в хуке `useEffect`:

```javascript
export default function App() {
  // ссылка на элемент
  const el = useRef()

  // запускаем `gsap` после рендеринга
  useEffect(() => {
    gsap.to(el.current, {
      // полный поворот
      rotation: '+=360'
    })
  })

  return (
    <div className='shape square green' ref={el}>
      Square
    </div>
  )
}
```

См. компонент `AnimatingTargetElement`.

## Применение анимации ко всем потомкам

Для применения анимации к дочерним элементам (компонентам) используется вспомогательная функция `utils.selector(el)`, где `el` - предок анимируемых элементов:

```javascript
const el = useRef()
const q = gsap.utils.selector(el)

useEffect(() => {
   // применяем анимацию ко всем потомкам элемента с CSS-классом `shape`
  gsap.to(q('.shape'), { x: 100 })
}, [])
```

См. компонент `AnimatingAllDescendantElements`.

## Применение анимации к некоторым потомкам

Для применения анимации к некоторым дочерним элементам используется техника под названием перенаправление или передача ссылки (Ref Forwarding):

```javascript
const el1 = useRef()
const el2 = useRef()

useEffect(() => {
  // ссылки на анимируемые элементы
  const squares = [el1.current, el2.current]

  gsap.to(squares, {
    x: 120,
    repeat: 3,
    repeatDelay: 1,
    yoyo: true
  })
}, [])
```

См. компонент `AnimatingSomeDescendantElements`.

## Создание и управление состоянием анимации

Хук `useRef` может использоваться не только для получения доступа к `DOM-элементу`, но и для сохранения состояния между рендерингами компонента, такого как состояние анимации:

```javascript
export default function App() {
  const el = useRef()
  const q = gsap.utils.selector(el)
  // состояние анимации
  const tl = useRef()

  useEffect(() => {
    tl.current = gsap.timeline()
      // сначала анимируем квадрат
      .to(q(".square"), {
        rotate: 360
      })
      // затем анимируем круг
      .to(q(".circle"), {
        x: 100
      })

  }, [])

  return (
    <div ref={el}>
      <Square>Square</Square>
      <Circle>Circle</Circle>
    </div>
  )
}
```

См. компонент `ControllingAnimationTimeline`.

## Управление запуском анимации

По умолчанию хук `useEffect` запускается после первого и каждого последующего рендеринга. Вызов `useEffect` означает запуск анимации. Для управления запуском `useEffect` (и анимации) используется массив зависимостей, когда отсутствие массива означает запуск после первого и каждого последующего рендеринга, пустой массив - запуск только после первого рендеринга, массив с зависимостями - запуск после первого рендеринга и при каждом изменении (любой) зависимости:

```javascript
// запускается только после первого рендеринга
useEffect(() => {
  gsap.to(q(".square.red"), { rotation: "+=360" })
}, [])

// запускается после первого рендеринга и после каждого изменения зависимости `someProp`
useEffect(() => {
  gsap.to(q(".square.green"), { rotation: "+=360" })
}, [someProp])

// запускается после первого и каждого последующего рендеринга
useEffect(() => {
  gsap.to(q(".square.blue"), { rotation: "+=360" })
})
```

См. компонент `ControllingAnimationStart`.

## Запуск анимации в ответ на изменение состояния

Пример запуска анимации в ответ на изменение пропа, передаваемого дочернему компоненту:

```javascript
const Square = ({ children, randomX }) => {
  const el = useRef()

  // запускается при каждом изменении пропа `randomX`
  useEffect(() => {
    gsap.to(el.current, {
      x: randomX
    })
  }, [randomX])

  return (
    <div className="shape square green" ref={el}>{children}</div>
  )
}
```

См. компонент `AnimationStartPropChange`.

## Запуск анимации в ответ на действие пользователя

Пример запуска анимации в ответ на действие пользователя (наведение курсора на элемент):

```javascript
// вызывается при наведении курсора
const onEnter = ({ currentTarget }) => {
  gsap.to(currentTarget, { backgroundColor: "#e77614" })
}

// вызывается при "снятии" курсора
const onLeave = ({ currentTarget }) => {
  gsap.to(currentTarget, { backgroundColor: "#28a92b" })
}

return (
  <div
    className="shape square green pointer"
    onMouseEnter={onEnter}
    onMouseLeave={onLeave}
  >
    Square
  </div>
)
```

См. компонент `AnimationStartUserAction`.

## Предотвращение "вспышек"

Во избежание вспышек (мигания или мерцания) вместо хука `useEffect` следует использовать хук `useLayoutEffect`. Как вы знаете, последний запускается синхронно, т.е. перед отрисовкой `DOM`:

```javascript
useLayoutEffect(() => {
  // код выполняется только в том случае,
  // если `state` имеет значение `complete`
  if (state !== 'complete') return

  // анимируем дочерние компоненты
  // перед отрисовкой `DOM`
  gsap.fromTo(
    q('.square'),
    {
      opacity: 0
    },
    {
      opacity: 1,
      duration: 1,
      stagger: 0.33
    }
  )
}, [state])
```

См. компонент `AnimationWithoutFlash`.

Не забывайте об отключении анимации и удалении обработчиков событий при размонтировании компонента, особенно, если речь идет о длительной анимации, использовании плагинов вроде `ScrollTrigger` или изменении состояния компонента:

```javascript
useEffect(() => {
  const anim1 = gsap.to('.box1', { rotation: '+=360' })

  const anim2 = gsap.to('.box2', {
    scrollTrigger: {
      // ...
    }
  })

  const onMove = () => {
    // ...
  }
  window.addEventListener('pointermove', onMove)

  // очистка при размонтировании компонента
  return () => {
    anim1.kill()
    anim2.scrollTrigger.kill()
    window.removeEventListener('pointermove', onMove)
  }
})
```

# Продвинутые примеры

## Взаимодействие компонентов

Порой требуется распределить жизненный цикл анимации (`timeline`) между несколькими компонентами. Также иногда анимация зависит от элементов, находящихся в разных компонентах.

Для решения подобных задач существует 2 подхода:

- передача `timeline` от родительского компонента дочерним через пропы
- передача колбека, вызываемого дочерними компонентами для добавления анимации в `timeline`

### Передача `timeline` через пропы

```javascript
function Square({ children, timeline, index }) {
  const el = useRef()
  // добавляем анимацию в `timeline`
  useEffect(() => {
    timeline.to(el.current, { x: -100 }, index * 0.1)
  }, [timeline])

  return <div className="shape square green" ref={el}>{children}</div>
}

function Circle({ children, timeline, index, rotation }) {
  const el = useRef()
  // добавляем анимацию в `timeline`
  useEffect(() => {
    timeline.to(el.current, {  rotate: rotation, x: 100 }, index * 0.1)
  }, [timeline, rotation])

  return <div className="shape circle blue" ref={el}>{children}</div>
}

export default function App() {
  // жизненный цикл анимации
  const [tl, setTl] = useState(() => gsap.timeline())

  return (
    <>
      {/* передаем `timeline` в качестве пропа */}
      <Square timeline={tl} index={0}>Square</Square>
      <Circle timeline={tl} rotation={360} index={1}>Circle</Circle>
    </>
  )
}
```

См. компонент `PassingTimelineThroughProps`.

### Передача колбека для добавления анимации в `timeline`

```javascript
function Square({ children, addAnimation, index }) {
  const el = useRef()
  // создаем анимацию и добавляем ее в `timeline`
  useEffect(() => {
    const animation = gsap.to(el.current, { x: -100 })
    addAnimation(animation, index)

    return () => animation.progress(0).kill()
  }, [addAnimation, index])

  return <div className="shape square green" ref={el}>{children}</div>
}

function Circle({ children, addAnimation, index, rotation }) {
  const el = useRef()
  // создаем анимацию и добавляем ее в `timeline`
  useEffect(() => {
    const animation = gsap.to(el.current, { rotate: rotation, x: 100 })
    addAnimation(animation, index)

    return () => animation.progress(0).kill()
  }, [addAnimation, index, rotation])

  return <div className="shape circle blue" ref={el}>{children}</div>
}

export default function App() {
  // жизненный цикл анимации
  const [tl, setTl] = useState(() => gsap.timeline())
  // передаем дочерним компонентам колбек
  // для добавления анимации в `timeline`
  const addAnimation = useCallback((animation, index) => {
    tl.add(animation, index * 0.1)
  }, [tl])

  return (
    <>
      <Square addAnimation={addAnimation} index={0}>Square</Square>
      <Circle addAnimation={addAnimation} index={1} rotation="360">Circle</Circle>
    </>
  )
}
```

См. компонент `PassingCallbackThroughProps`.

### Передача `timeline` через контекст

Передавать `timeline` или колбек для добавления анимации в `timeline` не всегда удобно. Что если нам нужно передать `timeline` компоненту, глубоко вложенному в другие компоненты? В этом случае не обойтись без контекста.

```javascript
const SelectedContext = createContext()

function Square({ children, id }) {
  const el = useRef()
  const selected = useContext(SelectedContext)

  useEffect(() => {
    gsap.to(el.current, {
      // сдвигаем элемент на `200px` влево, если его `id`
      // совпадает со значением `selected` из контекста
      x: selected === id ? 200 : 0
    })
  }, [selected, id])

  return <div className="shape square green" ref={el}>{children}</div>
}

export default function App() {
  // любой компонент может читать значения из контекста,
  // независимо от уровня его вложенности
  // в данном случае мы передаем `2` в качестве начального значения
  return (
    <SelectedContext.Provider value="2">
      <Square id="1">Square 1</Square>
      <Square id="2">Square 2</Square>
      <Square id="3">Square 3</Square>
    </SelectedContext.Provider>
  )
}
```

См. компонент `PassingTimelineThroughContext`.

## Императивное взаимодействие

Передача пропов или использование контекста в большинстве случаев работает хорошо, но эти механизмы приводят к повторной отрисовке компонентов, что может оказать негативное влияние на производительность при постоянном изменении значения, например, при отслеживании позиции курсора.

Для пропуска рендеринга мы можем использовать хук `useImperativeHandle` и создать `API` для компонента. Любое значение, возвращаемое хуком, будет передаваться компоненту в виде ссылки:

```javascript
const Circle = forwardRef((props, ref) => {
  const el = useRef()

  useImperativeHandle(ref, () => {
    // возвращаем `API`
    return {
      moveTo(x, y) {
        gsap.to(el.current, { x, y })
      }
    }
  }, [])

  return <div className="shape circle blue" ref={el}></div>
})

export default function App() {
  const circleRef = useRef()

  useEffect(() => {
    // повторный рендеринг не запускается!
    circleRef.current.moveTo(300, 100)
  }, [])

  return (
    <>
      <Circle ref={circleRef} />
    </>
  )
}
```

См. компонент `ImperativeHandleMousePosition`.

## Создание переиспользуемых анимаций

Создание переиспользуемых анимаций - отличный способ сохранения чистоты кода и уменьшения его количества. Простейшим способом это сделать является вызов функции для создания анимации:

```javascript
const fadeIn = (target, args) => gsap.from(target, { opacity: 0, ...args })

function App() {
  const el = useRef()

  useLayoutEffect(() => {
    fadeIn(el.current, { x: 100 })
  }, [])

  return <div className="shape square green" ref={el}>Square</div>
}
```

Более декларативный подход предполагает создание компонента-обертки для обработки анимации:

```javascript
function FadeIn({ children, args }) {
  const el = useRef()

  useLayoutEffect(() => {
    gsap.from(el.current.children, {
      opacity: 0,
      ...args
    })
  }, [])

  return <span ref={el}>{children}</span>
}

function App() {
  return (
    <FadeIn args={{ x: 100 }}>
      <div className="shape square green">Square</div>
    </FadeIn>
  )
}
```

См. компонент `ReusableAnimationWrapper`.

## Использование `gsap.effects`

Рекомендуемым способом создания переиспользуемых анимаций является метод `registerEffect()`:

```javascript
function GsapEffect({ children, targetRef, effect, args }) {
  useLayoutEffect(() => {
    if (gsap.effects[effect]) {
      gsap.effects[effect](targetRef.current, args)
    }
  }, [effect])

  return <>{children}</>
}

function App() {
  const el = useRef()

  return (
    <GsapEffect targetRef={el} effect="spin">
      <Square ref={el}>Square</Square>
    </GsapEffect>
  )
}
```

См. компонент `ReusableAnimationRegisterEffect`.

## Выход из анимации

Как анимировать удаление элемента из `DOM`? Одним из способов это сделать является изменение состояния компонента после завершения анимации:

```javascript
function App() {
  const el = useRef()
  const [active, setActive] = useState(true)

  const remove = () => {
    gsap.to(el.current, {
      opacity: 0,
      onComplete: () => setActive(false)
    })
  }

  return (
    <div>
      <button onClick={remove}>Remove</button>
      { active ? <div ref={el}>Square</div> : null }
    </div>
  )
}
```

См. компонент `RemovingSingleElementFromDom`.

Точно такой же подход применим в отношении нескольких элементов:

```javascript
function App() {
  const [items, setItems] = useState([
    { id: 0 },
    { id: 1 },
    { id: 2 }
  ])

  const removeItem = (value) => {
    setItems(prev => prev.filter(item => item !== value))
  }

  const remove = (item, target) => {
    gsap.to(target, {
      opacity: 0,
      onComplete: () => removeItem(item)
    })
  }

  return (
    <div>
      {items.map((item) => (
        <div key={item.id} onClick={(e) => remove(item, e.currentTarget)}>
          Click Me
        </div>
      ))}
    </div>
  )
}
```

См. компонент `RemovingMultipleElementsFromDom`.

## Кастомные хуки

Кастомные хуки позволяют извлекать логику анимации в переиспользуемые функции.

Вот как можно реализовать пример с `registerEffect` с помощью кастомного хука:

```javascript
function useGsapEffect(target, effect, vars) {
  const [animation, setAnimation] = useState()

  useLayoutEffect(() => {
    setAnimation(gsap.effects[effect](target.current, vars))
  }, [effect])

  return animation
}

function App() {
  const el = useRef()
  const animation = useGsapEffect(el, "spin")

  return <Square ref={el}>Square</Square>
}
```

### `useSelector`

Хук для выборки дочерних компонентов.

_Сигнатура_

```javascript
 function useSelector() {
  const ref = useRef()
  const q = useMemo(() => gsap.utils.selector(ref), [])
  return [q, ref]
}
```

_Использование_

```javascript
function App() {
  const [q, ref] = useSelector()

  useEffect(() => {
    gsap.to(q(".square"), { x: 200 })
  }, [])

  return (
    <div ref={ref}>
      <div className="shape square">Square</div>
    </div>
  )
}
```

### `useArrayRef`

Хук для добавления ссылок в массив.

_Сигнатура_

```javascript
function useArrayRef() {
  const refs = useRef([])
  refs.current = []
  return [refs, (ref) => ref && refs.current.push(ref)]
}
```

_Использование_

```javascript
function App() {
  const [refs, setRef] = useArrayRef()

  useEffect(() => {
    gsap.to(refs.current, { x: 200 })
  }, [])

  return (
    <div>
      <div className="shape square green" ref={setRef}>Square 1</div>
      <div className="shape square blue" ref={setRef}>Square 2</div>
      <div className="shape square red" ref={setRef}>Square 3</div>
    </div>
  )
}
```

### `useStateRef`

Данный хук решает проблему доступа к значениям состояния в колбеках. Он похож на `useState`, но возвращает третье значение - ссылку на текущее состояние.

_Сигнатура_

```javascript
function useStateRef(defaultValue) {
  const [state, setState] = useState(defaultValue)
  const ref = useRef(state)

  const dispatch = useCallback((value) => {
    ref.current = typeof value === "function" ? value(ref.current) : value
    setState(ref.current)
  }, [])

  return [state, dispatch, ref]
}
```

_Использование_

```javascript
const [count, setCount, countRef] = useStateRef(5)
const [gsapCount, setGsapCount] = useState(0)

useEffect(() => {
  gsap.to(box.current, {
    x: 200,
    repeat: -1,
    onRepeat: () => setGsapCount(countRef.current)
  })
}, [])
```

The End.
