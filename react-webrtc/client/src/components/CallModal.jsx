import { BsCameraVideo, BsPhone } from 'react-icons/bs'
import { FiPhoneOff } from 'react-icons/fi'

export const CallModal = ({ callFrom, startCall, rejectCall }) => {
  const acceptWithVideo = (video) => {
    const config = { audio: true, video }
    startCall(false, callFrom, config)
  }

  return (
    <div className='call-modal'>
      <div className='inner'>
        <p>{`${callFrom} is calling`}</p>
        <div className='control'>
          <button onClick={() => acceptWithVideo(true)}>
            <BsCameraVideo />
          </button>
          <button onClick={() => acceptWithVideo(false)}>
            <BsPhone />
          </button>
          <button onClick={rejectCall} className='reject'>
            <FiPhoneOff />
          </button>
        </div>
      </div>
    </div>
  )
}
