import { useUser } from '@/utils/swr'
import { Box, Button } from '@mui/material'

type Props = {
  closeModal?: () => void
}

export default function LogoutButton({ closeModal }: Props) {
  const { accessToken, mutate } = useUser()

  const onClick = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        throw response
      }

      mutate({ user: undefined, accessToken: undefined })

      if (closeModal) {
        closeModal()
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Box display='flex' justifyContent='flex-end' pt={2} pr={2}>
      <Button color='error' variant='contained' onClick={onClick}>
        Logout
      </Button>
    </Box>
  )
}
