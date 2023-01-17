import { useUser } from '@/utils/swr'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { Button, IconButton } from '@mui/material'
import { useRouter } from 'next/router'

type Props = {
  postId: string
  authorId: string
  icon?: boolean
}

export default function RemovePostButton({
  postId,
  authorId,
  icon = true
}: Props) {
  const router = useRouter()
  const { user, accessToken } = useUser()

  if (!user || user.id !== authorId) return null

  const removePost = async () => {
    try {
      await fetch(`/api/post?id=${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      router.push('/posts')
    } catch (e: unknown) {
      console.error(e)
    }
  }

  return icon ? (
    <IconButton onClick={removePost} color='error'>
      <DeleteOutlineIcon />
    </IconButton>
  ) : (
    <Button variant='contained' color='error' onClick={removePost}>
      Remove
    </Button>
  )
}
