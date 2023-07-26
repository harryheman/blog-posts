import useSyncExternalStoreExports from 'use-sync-external-store/shim/with-selector'
import { createStore } from './vanilla.js'

const { useSyncExternalStoreWithSelector } = useSyncExternalStoreExports

export function useStore(api, selector = api.getState, equalityFn) {
  // получаем часть (срез) состояния
  const slice = useSyncExternalStoreWithSelector(
    api.subscribe,
    api.getState,
    api.getServerState || api.getState,
    selector,
    equalityFn,
  )
  // и возвращаем его
  return slice
}

const createImpl = (createState) => {
  // получаем методы
  const api =
    typeof createState === 'function' ? createStore(createState) : createState

  // определяем хук
  const useBoundStore = (selector, equalityFn) =>
    useStore(api, selector, equalityFn)

  // не понял, зачем это нужно
  // контекст выполнения не теряется,
  // если закомментировать эту строку,
  // код продолжает работать, как ожидается
  Object.assign(useBoundStore, api)

  return useBoundStore
}

export const create = (createState) =>
  createState ? createImpl(createState) : createImpl
