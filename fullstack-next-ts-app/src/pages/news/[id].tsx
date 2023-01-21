import CustomHead from '@/components/Head'
import type { News, NewsArr } from '@/types'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Typography
} from '@mui/material'
import { blue, red } from '@mui/material/colors'
import type {
  GetStaticPathsContext,
  GetStaticPropsContext,
  InferGetStaticPropsType
} from 'next'
import Link from 'next/link'

export default function ArticlePage({
  news
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <CustomHead title={news.title} description={news.text.slice(0, 10)} />
      <Box py={2}>
        <Card>
          <CardHeader
            avatar={
              <Avatar
                sx={{ bgcolor: news.id % 2 === 0 ? red[500] : blue[500] }}
                aria-label='author avatar'
              >
                {news.author.slice(0, 1)}
              </Avatar>
            }
            action={
              <Link href='/about'>
                <Button aria-label='return to about page'>
                  <ArrowBackIosNewIcon fontSize='small' />
                  <Typography variant='body2'>Back</Typography>
                </Button>
              </Link>
            }
            title={news.title}
            subheader={new Date(news.datePublished).toDateString()}
          />
          <CardMedia
            component='img'
            height='300'
            image={news.imgSrc}
            alt={news.imgAlt}
          />
          <CardContent>
            <Typography variant='body1'>{news.text}</Typography>
          </CardContent>
        </Card>
      </Box>
    </>
  )
}

export async function getStaticPaths(ctx: GetStaticPathsContext) {
  let data = {
    news: [] as NewsArr
  }

  try {
    const response = await fetch(
      `https://api.jsonbin.io/v3/b/${process.env.JSONBIN_BIN_ID}?meta=false`,
      {
        headers: {
          'X-Master-Key': process.env.JSONBIN_X_MASTER_KEY
        }
      }
    )
    if (!response.ok) {
      throw response
    }
    data = await response.json()
  } catch (e) {
    console.error(e)
  }

  const paths = data.news.map((n) => ({
    params: { id: String(n.id) }
  }))

  return {
    paths,
    fallback: 'blocking'
  }
}

export async function getStaticProps({
  params
}: GetStaticPropsContext<{ id: string }>) {
  let news = {} as News

  try {
    const response = await fetch(
      `https://api.jsonbin.io/v3/b/${process.env.JSONBIN_BIN_ID}?meta=false`,
      {
        headers: {
          'X-Master-Key': process.env.JSONBIN_X_MASTER_KEY,
          'X-JSON-Path': `news[${Number(params?.id) - 1}]`
        }
      }
    )
    if (!response.ok) {
      throw response
    }
    const data = await response.json()
    news = data[0]
    if (!news) {
      return {
        notFound: true
      }
    }
  } catch (e) {
    console.error(e)
  }

  return {
    props: {
      news
    },
    revalidate: 60 * 60 * 12
  }
}
