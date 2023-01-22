import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Typography
} from '@mui/material'
import { blue, red } from '@mui/material/colors'
import Link from 'next/link'
import type { News } from '../types'

type Props = {
  news: News
}

export default function NewsPreview({ news }: Props) {
  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: news.id % 2 === 0 ? red[500] : blue[500] }}>
            {news.author.slice(0, 1)}
          </Avatar>
        }
        title={news.title}
        subheader={new Date(news.datePublished).toDateString()}
      />
      <CardMedia
        component='img'
        height='200'
        image={news.imgSrc}
        alt={news.imgAlt}
      />
      <CardContent>
        <Typography variant='body2' color='text.secondary'>
          {news.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Link href={`news/${news.id}`}>
          <Button>
            <Typography variant='body2'>More</Typography>
            <ArrowForwardIosIcon fontSize='small' />
          </Button>
        </Link>
      </CardActions>
    </Card>
  )
}
