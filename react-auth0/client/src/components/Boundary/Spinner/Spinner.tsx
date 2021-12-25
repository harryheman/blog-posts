import Loader from 'react-loader-spinner'

export const Spinner = ({ width = 50 }: { width?: string | number }) => (
  <Loader type='Oval' color='#0275d8' width={width} />
)
