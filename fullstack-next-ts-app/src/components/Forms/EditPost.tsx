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
import type { Post } from '@prisma/client'
import { useRouter } from 'next/router'
import { useState } from 'react'
import FormFieldsWrapper from './Wrapper'

type Props = {
  closeModal?: () => void
  post: Omit<Post, 'createdAt' | 'updatedAt'> & {
    createdAt: string
  }
}

export default function EditPostForm({ closeModal, post }: Props) {
  const theme = useTheme()
  const { user, accessToken } = useUser()
  const router = useRouter()

  const [errors, setErrors] = useState<{
    content?: number
  }>({})

  if (!user || user.id !== post.authorId) return null

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    const formData = Object.fromEntries(
      new FormData(e.target as HTMLFormElement)
    ) as unknown as Pick<Post, 'title' | 'content'> & {
      postId: string
    }

    if (formData.content.length < 50) {
      return setErrors({ content: formData.content.length })
    }

    try {
      const response = await fetch('/api/post', {
        method: 'PUT',
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
    if (Object.keys(errors).length) {
      setErrors({ content: undefined })
    }
  }

  return (
    <FormFieldsWrapper handleSubmit={handleSubmit}>
      <Typography variant='h4'>Edit post</Typography>
      <input type='hidden' name='postId' defaultValue={post.id} />
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
          defaultValue={post.title}
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
              defaultValue={post.content}
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
        Update
      </Button>
    </FormFieldsWrapper>
  )
}
