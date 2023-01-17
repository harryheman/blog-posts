import { useUser } from '@/utils/swr'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Typography
} from '@mui/material'
import { Like, Post } from '@prisma/client'
import Link from 'next/link'
import EditPostButton from './Buttons/EditPost'
import LikePostButton from './Buttons/LikePost'
import RemovePostButton from './Buttons/RemovePost'

type Props = {
  post: Omit<Post, 'createdAt' | 'updatedAt'> & {
    likes: Like[]
    createdAt: string
  }
}

export default function PostPreview({ post }: Props) {
  const { user } = useUser()
  const isPostBelongsToUser = user?.id === post.authorId

  return (
    <Card>
      <CardHeader title={post.title} subheader={post.createdAt} />
      <CardContent>
        <Typography variant='body2' color='text.secondary'>
          {post.content}
        </Typography>
      </CardContent>
      <CardActions>
        <Box display='flex' justifyContent='space-between' width='100%'>
          <Link href={`posts/${post.id}`}>
            <Button>
              <Typography variant='body2'>More</Typography>
              <ArrowForwardIosIcon fontSize='small' />
            </Button>
          </Link>

          <Box display='flex' gap={1}>
            <LikePostButton post={post} />
            {isPostBelongsToUser && (
              <>
                <EditPostButton post={post} />
                <RemovePostButton postId={post.id} authorId={post.authorId} />
              </>
            )}
          </Box>
        </Box>
      </CardActions>
    </Card>
  )
}
