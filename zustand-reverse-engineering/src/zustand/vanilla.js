const createStoreImpl = (createState) => {
  // состояние
  let state
  // обработчики
  const listeners = new Set()

  // функция обновления состояния
  const setState = (partial, replace) => {
    // следующее состояние
    const nextState = typeof partial === 'function' ? partial(state) : partial
    // если состояние изменилось
    if (!Object.is(nextState, state)) {
      // предыдущее/текущее состояние
      const previousState = state
      // обновляем состояние с помощью `nextState` (если `replace === true` или значением `nextState` является примитив) или нового объекта, объединяющего `state` и `nextState`
      state =
        replace ?? typeof nextState !== 'object'
          ? nextState
          : Object.assign({}, state, nextState)
      // запускаем обработчики
      listeners.forEach((listener) => listener(state, previousState))
    }
  }

  // функция извлечения состояния
  const getState = () => state

  // функция подписки
  // `listener` - обработчик `onStoreChange`
  // см. код хука `useSyncExternalStoreWithSelector`
  const subscribe = (listener) => {
    // добавляем/регистрируем обработчик
    listeners.add(listener)
    // отписка
    return () => listeners.delete(listener)
  }

  // функция удаления всех обработчиков
  const destroy = () => {
    listeners.clear()
  }

  const api = { setState, getState, subscribe, destroy }
  // инициализируем состояние
  state = createState(setState, getState, api)
  // возвращаем методы
  return api
}

export const createStore = (createState) =>
  createState ? createStoreImpl(createState) : createStoreImpl
