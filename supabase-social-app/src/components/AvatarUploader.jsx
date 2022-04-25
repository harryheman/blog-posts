import { useState, useEffect } from 'react'
import userApi from 'a/user'
import useStore from 'h/useStore'

export const AvatarUploader = () => {
  const { setUser, setLoading, setError } = useStore(
    ({ setUser, setLoading, setError }) => ({
      setUser,
      setLoading,
      setError
    })
  )
  const [file, setFile] = useState('')
  const [disabled, setDisabled] = useState(true)

  useEffect(() => {
    setDisabled(!file)
  }, [file])

  const upload = (e) => {
    e.preventDefault()
    if (disabled) return
    setLoading(true)
    userApi.uploadAvatar(file).then(setUser).catch(setError)
  }

  return (
    <div className='avatar-uploader'>
      <form className='avatar-uploader' onSubmit={upload}>
        <label htmlFor='avatar'>Avatar:</label>
        <input
          type='file'
          accept='image/*'
          onChange={(e) => {
            if (e.target.files) {
              setFile(e.target.files[0])
            }
          }}
        />
        <button disabled={disabled}>Upload</button>
      </form>
    </div>
  )
}
