import { useUser } from '@/utils/swr'
import { CssVarsProvider } from '@mui/joy/styles'
import Textarea from '@mui/joy/Textarea'
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Input,
  InputLabel,
  Typography
} from '@mui/material'
import { red } from '@mui/material/colors'
import { useTheme } from '@mui/material/styles'
import { Post } from '@prisma/client'
import { useRouter } from 'next/router'
import { useState } from 'react'
import FormFieldsWrapper from './Wrapper'

type Props = {
  closeModal?: () => void
}

export default function CreatePostForm({ closeModal }: Props) {
  const theme = useTheme()
  const { user, accessToken } = useUser()
  const router = useRouter()

  const [errors, setErrors] = useState<{
    content?: number
  }>({})

  if (!user) return null

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    if (!user) return
    e.preventDefault()
    const formData = Object.fromEntries(
      new FormData(e.target as HTMLFormElement)
    ) as unknown as Pick<Post, 'title' | 'content' | 'authorId'>

    if (formData.content.length < 50) {
      return setErrors({ content: formData.content.length })
    }

    try {
      const response = await fetch('/api/post', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        throw response
      }

      const post = await response.json()

      router.push(`/posts/${post.id}`)

      if (closeModal) {
        closeModal()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const onInput = () => {
    setErrors({ content: undefined })
  }

  return (
    <FormFieldsWrapper handleSubmit={handleSubmit}>
      <Typography variant='h4'>Create post</Typography>
      <input type='hidden' name='authorId' defaultValue={user.id} />
      <FormControl required>
        <InputLabel htmlFor='title'>Title</InputLabel>
        <Input
          sx={{ gap: theme.spacing(1) }}
          id='title'
          type='text'
          name='title'
          inputProps={{
            minLength: 3
          }}
        />
      </FormControl>
      <Box>
        <InputLabel>
          Content * <Typography variant='body2'>(50 symbols min)</Typography>
          <CssVarsProvider>
            <Textarea
              name='content'
              required
              minRows={5}
              sx={{ mt: 1 }}
              onInput={onInput}
              defaultValue='Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta sed dicta eos ratione dolores doloribus magni repellendus aliquid sit dolor harum nemo porro voluptate incidunt quidem, molestias quia cum sequi minima debitis quae magnam est eius quas! Similique, enim non ad facilis dolores nulla corrupti assumenda, harum, ipsa consequuntur pariatur!'
            />
          </CssVarsProvider>
        </InputLabel>
        {errors.content && (
          <FormHelperText sx={{ color: red[500] }}>
            {50 - errors.content} symbols left
          </FormHelperText>
        )}
      </Box>
      <Button type='submit' variant='contained' color='success'>
        Create
      </Button>
    </FormFieldsWrapper>
  )
}
