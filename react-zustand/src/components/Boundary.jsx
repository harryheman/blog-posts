import React from 'react'
import shallow from 'zustand/shallow'
import useStore from '../store'
import { Error } from './Error'
import { Loader } from './Loader'

export const Boundary = ({ children }) => {
  const { loading, error } = useStore(
    ({ loading, error }) => ({ loading, error }),
    shallow
  )

  if (loading) return <Loader width={50} />

  if (error) return <Error error={error} />

  return <>{children}</>
}
