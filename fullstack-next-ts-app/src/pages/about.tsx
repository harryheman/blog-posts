import Animate from '@/components/AnimateIn'
import CustomHead from '@/components/Head'
import NewsPreview from '@/components/NewsPreview'
import type { NewsArr } from '@/types'
import { Grid, Typography } from '@mui/material'
import type { GetStaticPropsContext, InferGetStaticPropsType } from 'next'

export default function About({
  data
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { news } = data

  return (
    <>
      <CustomHead title='About Page' description='This is About Page' />
      <Typography variant='h4' textAlign='center' py={2}>
        About
      </Typography>
      <Typography variant='body1'>
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Doloribus,
        obcaecati necessitatibus! Doloremque numquam magni culpa atque omnis
        ipsa sequi, nostrum, provident repudiandae sint aperiam temporibus nulla
        minima quas rem ex autem dolores consequuntur! Officia laborum autem ex
        eius cumque non aspernatur blanditiis commodi quae magnam ipsa qui sunt
        dolor quos dolorum eveniet, nobis excepturi voluptatum quasi, dicta sit
        aut, corporis hic. Magni numquam, accusamus, quasi consectetur facere
        quod consequuntur aliquid illo commodi ducimus id tenetur ea molestiae
        suscipit itaque assumenda ex. Expedita rem architecto itaque, ad
        voluptate nesciunt nisi veniam modi cupiditate, amet id velit deserunt
        soluta? Ex, voluptate libero.
      </Typography>
      <Typography variant='h5' textAlign='center' py={2}>
        News
      </Typography>
      <Grid container spacing={2} pb={2}>
        {news.map((n) => (
          <Grid item md={6} lg={4} key={n.id}>
            <Animate.FadeIn>
              <NewsPreview news={n} />
            </Animate.FadeIn>
          </Grid>
        ))}
      </Grid>
    </>
  )
}

export async function getStaticProps(ctx: GetStaticPropsContext) {
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

  return {
    props: {
      data
    },
    revalidate: 60 * 60 * 12
  }
}
