import { useUser } from '@/utils/swr'
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline'
import { Button, IconButton } from '@mui/material'
import type { Post } from '@prisma/client'
import EditPostForm from '../Forms/EditPost'
import Modal from '../Modal'

type Props = {
  post: Omit<Post, 'createdAt' | 'updatedAt'> & {
    createdAt: string
  }
  icon?: boolean
}

export default function EditPostButton({ post, icon = true }: Props) {
  const { user } = useUser()

  if (!user || user.id !== post.authorId) return null

  return (
    <Modal
      triggerComponent={
        icon ? (
          <IconButton color='info'>
            <DriveFileRenameOutlineIcon />
          </IconButton>
        ) : (
          <Button variant='contained' color='info'>
            Edit
          </Button>
        )
      }
      modalContent={<EditPostForm post={post} />}
      size='M'
    />
  )
}
