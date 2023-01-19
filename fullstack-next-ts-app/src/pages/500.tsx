import CustomHead from '@/components/Head'
import { Box, Typography } from '@mui/material'
import Image from 'next/image'

export default function Custom500() {
  return (
    <>
      <CustomHead title='500 Error Page' description='This is 500 Error Page' />
      <Typography variant='h4' textAlign='center' mt={2} mb={4}>
        Server error occurred
      </Typography>
      <Image
        width={256}
        height={256}
        src='/img/500.png'
        alt='Server error'
        style={{ margin: '0 auto' }}
      />
    </>
  )
}
