import storageLocal from '@/utils/storageLocal'
import { useUser } from '@/utils/swr'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
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
import { useRouter } from 'next/router'
import { useState } from 'react'
import FormFieldsWrapper from './Wrapper'

type Props = {
  closeModal?: () => void
}

export default function RegisterForm({ closeModal }: Props) {
  const theme = useTheme()
  const router = useRouter()
  const { mutate } = useUser()

  const [errors, setErrors] = useState<{
    email?: boolean
    password?: boolean
    passwordConfirm?: boolean
  }>({})

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    const formData = Object.fromEntries(
      new FormData(e.target as HTMLFormElement)
    ) as unknown as Pick<User, 'username' | 'email' | 'password'> & {
      passwordConfirm?: string
    }
    const _errors: typeof errors = {}
    if (formData.password.length < 6) {
      _errors.password = true
    }
    if (formData.password !== formData.passwordConfirm) {
      _errors.passwordConfirm = true
    }
    if (Object.keys(_errors).length) {
      return setErrors({ ..._errors })
    }

    delete formData.passwordConfirm

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        return setErrors({ email: true })
      }

      const user = await res.json()
      mutate({ user })

      storageLocal.set('user_has_been_registered', true)

      if (closeModal) {
        closeModal()
      }

      if (router.pathname !== '/') {
        router.push('/')
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleInput: React.FormEventHandler<HTMLFormElement> = () => {
    if (Object.keys(errors).length) {
      setErrors({})
    }
  }

  return (
    <FormFieldsWrapper handleSubmit={handleSubmit} handleInput={handleInput}>
      <Typography variant='h4'>Register</Typography>
      <FormControl>
        <InputLabel htmlFor='username'>Username</InputLabel>
        <Input
          sx={{ gap: theme.spacing(1) }}
          id='username'
          name='username'
          startAdornment={<PersonOutlineIcon />}
        />
      </FormControl>
      <FormControl required error={errors.email}>
        <InputLabel htmlFor='email'>Email</InputLabel>
        <Input
          sx={{ gap: theme.spacing(1) }}
          id='email'
          type='email'
          name='email'
          startAdornment={<MailOutlineIcon />}
        />
        {errors.email && <FormHelperText>Email already in use</FormHelperText>}
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
        <FormHelperText>
          Password must be at least 6 characters long
        </FormHelperText>
      </FormControl>
      <FormControl required error={errors.passwordConfirm}>
        <InputLabel htmlFor='password-confirm'>Confirm password</InputLabel>
        <Input
          sx={{ gap: theme.spacing(1) }}
          id='password-confirm'
          type='password'
          name='passwordConfirm'
          startAdornment={<VpnKeyIcon />}
        />
        {errors?.passwordConfirm && (
          <FormHelperText>Passwords must be the same</FormHelperText>
        )}
      </FormControl>
      <Button type='submit' variant='contained' color='success'>
        Register
      </Button>
    </FormFieldsWrapper>
  )
}
