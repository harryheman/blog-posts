import { Divider } from '@mui/material'
import LogoutButton from './Buttons/Logout'
import UploadForm from './Forms/Upload'

type Props = {
  closeModal?: () => void
}

export default function UserPanel({ closeModal }: Props) {
  return (
    <>
      <UploadForm closeModal={closeModal} />
      <Divider />
      <LogoutButton closeModal={closeModal} />
    </>
  )
}
