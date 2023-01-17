import Link, { LinkProps } from 'next/link'
import { useRouter } from 'next/router'

type Props = {
  activeClassName: string
  children: React.ReactNode
} & LinkProps

export default function ActiveLink({
  activeClassName,
  children,
  ...props
}: Props) {
  const { asPath } = useRouter()

  const className =
    asPath === props.href || asPath === props.as ? activeClassName : ''

  return (
    <Link className={className} {...props}>
      {children}
    </Link>
  )
}
