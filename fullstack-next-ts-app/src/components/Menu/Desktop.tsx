import { List, ListItem } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import ActiveLink from '../ActiveLink'
import ProfileButton from '../Buttons/Profile'
import type { PageLinks } from '../Header'

type Props = {
  links: PageLinks
}

export default function DesktopMenu({ links }: Props) {
  const theme = useTheme()

  return (
    <List
      sx={{
        display: { xs: 'none', sm: 'flex' },
        justifyContent: 'flex-end',
        paddingInline: theme.spacing(1)
      }}
    >
      {links.map((link, i) => (
        <ListItem key={i}>
          <ActiveLink href={link.href} activeClassName='current'>
            {link.title}
          </ActiveLink>
        </ListItem>
      ))}
      <ProfileButton />
    </List>
  )
}
