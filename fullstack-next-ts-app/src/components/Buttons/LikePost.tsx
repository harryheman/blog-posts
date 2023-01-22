import { useUser } from '@/utils/swr'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { Badge, IconButton } from '@mui/material'
import type { Like, Post } from '@prisma/client'
import { useRouter } from 'next/router'

type Props = {
  post: Omit<Post, 'createdAt' | 'updatedAt'> & {
    likes: Like[]
    createdAt: string
  }
}

export default function LikePostButton({ post }: Props) {
  const router = useRouter()
  const { user, accessToken } = useUser()
  if (!user) return null
  const like = post.likes.find((l) => l.userId === user.id)
  const isLiked = Boolean(like)

  const likePost = async () => {
    let res: Response
    try {
      if (isLiked) {
        res = await fetch(`/api/like?id=${like?.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
      } else {
        res = await fetch('/api/like', {
          method: 'POST',
          body: JSON.stringify({ postId: post.id, userId: user.id }),
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
      }
      if (!res.ok) throw res
      router.push(router.asPath)
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <Badge
      badgeContent={post.likes.length}
      color='error'
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left'
      }}
    >
      <IconButton onClick={likePost}>
        {isLiked ? <FavoriteIcon color='error' /> : <FavoriteBorderIcon />}
      </IconButton>
    </Badge>
  )
}
