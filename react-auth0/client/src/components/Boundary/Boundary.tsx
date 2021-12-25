import { useAppStore } from 'providers/AppProvider'
import { Children } from 'types'
import { Error, Spinner } from 'components/index.components'

export const Boundary = ({ children }: Children) => {
  const { loading, error } = useAppStore()

  if (loading) return <Spinner />
  if (error) return <Error error={error} />

  return <div>{children}</div>
}
