import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Typography
} from '@mui/material'

type Props = {
  error: Error
  resetErrorBoundary: (...args: Array<unknown>) => void
}

export default function ErrorFallback({ error, resetErrorBoundary }: Props) {
  return (
    <Card
      role='alert'
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: 320,
        mt: 2,
        mx: 'auto',
        pb: 2
      }}
    >
      <CardHeader title='Something went wrong' />
      <CardContent>
        <Typography variant='body1' color='error'>
          {error.message || 'Unknown error'}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          variant='contained'
          color='success'
          onClick={resetErrorBoundary}
        >
          Reload
        </Button>
      </CardActions>
    </Card>
  )
}
