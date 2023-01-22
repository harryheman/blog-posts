import { useUser } from '@/utils/swr'
import { Avatar, Box, Button, Typography } from '@mui/material'
import { useRef, useState } from 'react'
import FormFieldsWrapper from './Wrapper'

type Props = {
  closeModal?: () => void
}

export default function UploadForm({ closeModal }: Props) {
  const previewRef = useRef<HTMLImageElement | null>(null)
  const [file, setFile] = useState<File>()
  const { user, accessToken, mutate } = useUser()

  if (!user) return null

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    if (!file) return

    e.preventDefault()

    const formData = new FormData()

    const _file = new File([file], `${user.id}.${file.type.split('/')[1]}`, {
      type: file.type
    })
    formData.append('avatar', _file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (!res.ok) {
        throw res
      }

      const user = await res.json()
      mutate({ user })

      if (closeModal) {
        closeModal()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files && previewRef.current) {
      const _file = e.target.files[0]
      setFile(_file)
      const img = previewRef.current.children[0] as HTMLImageElement
      img.src = URL.createObjectURL(_file)
      img.onload = () => {
        URL.revokeObjectURL(img.src)
      }
    }
  }

  return (
    <FormFieldsWrapper handleSubmit={handleSubmit}>
      <Typography variant='h4'>Avatar</Typography>
      <Box display='flex' alignItems='center' gap={2}>
        <input
          accept='image/*'
          style={{ display: 'none' }}
          id='avatar'
          name='avatar'
          type='file'
          onChange={handleChange}
        />
        <label htmlFor='avatar'>
          <Button component='span'>Choose file</Button>
        </label>
        <Avatar alt='preview' ref={previewRef} src='/img/user.png' />
        <Button
          type='submit'
          variant='contained'
          color='success'
          disabled={!file}
        >
          Upload
        </Button>
      </Box>
    </FormFieldsWrapper>
  )
}
