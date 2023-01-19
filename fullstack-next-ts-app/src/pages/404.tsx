import CustomHead from '@/components/Head'
import { Box, Typography } from '@mui/material'
import Image from 'next/image'

export default function Custom404() {
  return (
    <>
      <CustomHead title='404 Error Page' description='This is 404 Error Page' />
      <Typography variant='h4' textAlign='center' mt={2} mb={4}>
        Page not found
      </Typography>
      <Image
        width={256}
        height={256}
        src='/img/404.png'
        alt='Not found error'
        style={{ margin: '0 auto' }}
      />
    </>
  )
}
