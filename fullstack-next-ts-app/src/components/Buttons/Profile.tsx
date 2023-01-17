import { useUser } from '@/utils/swr'
import { Avatar, ListItemButton } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import AuthTabs from '../AuthTabs'
import Modal from '../Modal'
import UserPanel from '../UserPanel'

export default function ProfileButton() {
  const { user } = useUser()
  const theme = useTheme()

  const modalContent = user ? <UserPanel /> : <AuthTabs />

  return (
    <Modal
      triggerComponent={
        <ListItemButton sx={{ borderRadius: '50%', px: theme.spacing(1) }}>
          <Avatar
            src={user && user.avatarUrl ? user.avatarUrl : '/img/user.png'}
          />
        </ListItemButton>
      }
      modalContent={modalContent}
    />
  )
}
