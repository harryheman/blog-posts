import type { UserResponseData } from '@/types'
import storageLocal from '@/utils/storageLocal'
import { useUser } from '@/utils/swr'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import {
  Button,
  FormControl,
  FormHelperText,
  Input,
  InputLabel,
  Typography
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { User } from '@prisma/client'
import { useState } from 'react'
import FormFieldsWrapper from './Wrapper'

type Props = {
  closeModal?: () => void
}

export default function LoginForm({ closeModal }: Props) {
  const theme = useTheme()
  const { mutate } = useUser()

  const [errors, setErrors] = useState<{
    email?: boolean
    password?: boolean
  }>({})

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    const formData = Object.fromEntries(
      new FormData(e.target as HTMLFormElement)
    ) as unknown as Pick<User, 'email' | 'password'>

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        switch (res.status) {
          case 404:
            return setErrors({ email: true })
          case 403:
            return setErrors({ password: true })
          default:
            throw res
        }
      }

      const data = (await res.json()) as UserResponseData
      mutate(data)

      if (!storageLocal.get('user_has_been_registered')) {
        storageLocal.set('user_has_been_registered', true)
      }

      if (closeModal) {
        closeModal()
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <FormFieldsWrapper handleSubmit={handleSubmit}>
      <Typography variant='h4'>Login</Typography>
      <FormControl required error={errors.email}>
        <InputLabel htmlFor='email'>Email</InputLabel>
        <Input
          sx={{ gap: theme.spacing(1) }}
          id='email'
          type='email'
          name='email'
          startAdornment={<MailOutlineIcon />}
        />
        {errors.email && (
          <FormHelperText>
            Пользователь с указанным email не найден
          </FormHelperText>
        )}
      </FormControl>
      <FormControl required error={errors.password}>
        <InputLabel htmlFor='password'>Password</InputLabel>
        <Input
          sx={{ gap: theme.spacing(1) }}
          id='password'
          type='password'
          name='password'
          startAdornment={<VpnKeyIcon />}
        />
        {errors.password && <FormHelperText>Wrong credentials</FormHelperText>}
      </FormControl>
      <Button type='submit' variant='contained' color='success'>
        Login
      </Button>
    </FormFieldsWrapper>
  )
}
