import { Box, BoxProps } from '@mui/material'

type Props = BoxProps & {
  children: React.ReactNode
  handleSubmit?: React.FormEventHandler<HTMLFormElement>
  handleInput?: React.FormEventHandler<HTMLFormElement>
}

export default function FormFieldsWrapper({
  children,
  handleSubmit,
  handleInput,
  ...otherProps
}: Props) {
  return (
    <Box
      component='form'
      display='flex'
      flexDirection='column'
      gap={3}
      p={2}
      onSubmit={handleSubmit}
      onInput={handleInput}
      {...otherProps}
    >
      {children}
    </Box>
  )
}
