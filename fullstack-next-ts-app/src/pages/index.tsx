import Animate, { SLIDE_DIRECTION } from '@/components/AnimateIn'
import CustomHead from '@/components/Head'
import Slider from '@/components/Slider'
import type { Blocks } from '@/types'
import { useUser } from '@/utils/swr'
import { Box, Grid } from '@mui/material'
import Typography from '@mui/material/Typography'
import type { GetStaticPropsContext, InferGetStaticPropsType } from 'next'
import Image from 'next/image'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export default function Home({
  data
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { blocks } = data
  const { user } = useUser()

  return (
    <>
      <CustomHead title='Home Page' description='This is Home Page' />
      <Typography variant='h4' textAlign='center' py={2}>
        Welcome, {user ? user.username || user.email : 'stranger'}
      </Typography>
      <Slider slides={blocks} />
      <Box my={2}>
        {blocks.map((block, i) => (
          <Animate.SlideIn
            key={block.id}
            direction={i % 2 ? SLIDE_DIRECTION.RIGHT : SLIDE_DIRECTION.LEFT}
          >
            <Grid container spacing={2} my={4}>
              {i % 2 ? (
                <>
                  <Grid item md={6}>
                    <Typography variant='h5'>{block.title}</Typography>
                    <Typography variant='body1' mt={2}>
                      {block.description}
                    </Typography>
                  </Grid>
                  <Grid item md={6}>
                    <Image
                      width={1024}
                      height={320}
                      src={block.imgSrc}
                      alt={block.imgAlt}
                      style={{
                        borderRadius: '6px'
                      }}
                    />
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item md={6}>
                    <Image
                      width={1024}
                      height={320}
                      src={block.imgSrc}
                      alt={block.imgAlt}
                      style={{
                        borderRadius: '6px'
                      }}
                    />
                  </Grid>
                  <Grid item md={6}>
                    <Typography variant='h5'>{block.title}</Typography>
                    <Typography variant='body1' mt={2}>
                      {block.description}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </Animate.SlideIn>
        ))}
      </Box>
    </>
  )
}

export async function getStaticProps(ctx: GetStaticPropsContext) {
  let data = {
    blocks: [] as Blocks
  }

  const dataPath = join(process.cwd(), 'public/data/home.json')

  try {
    const dataJson = await readFile(dataPath, 'utf-8')
    if (dataJson) {
      data = JSON.parse(dataJson)
    }
  } catch (e) {
    console.error(e)
  }

  return {
    props: {
      data
    }
  }
}
