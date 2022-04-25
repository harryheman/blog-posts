import { Oval } from 'react-loader-spinner'

export const Loader = ({ width = 50 }) => (
  <div className='loader'>
    <Oval
      width={width}
      color='#0275d8'
      secondaryColor='#5bc0de'
      ariaLabel='loading'
    />
  </div>
)
