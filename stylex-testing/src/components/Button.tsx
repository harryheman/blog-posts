import stylex, { type StyleXStyles } from '@stylexjs/stylex'
import type { HTMLAttributes, PropsWithChildren } from 'react'
import { colors, spacing } from '../tokens.stylex'

const styles = stylex.create({
  default: {
    padding: `${spacing.small} ${spacing.large}`,
    backgroundColor: colors.light,
    border: `1px solid ${colors.dark}`,
    outline: 'none',
    borderRadius: spacing.small,
    boxShadow: {
      default: '0 2px 3px rgba(0, 0, 0, 0.25)',
      ':active': 'none',
    },
    cursor: 'pointer',
    transition: 'all 0.25s ease-in-out',
    ':hover': {
      backgroundColor: colors.dark,
      color: colors.light,
    },
  },
  primary: {
    backgroundColor: colors.primary,
    color: colors.light,
    ':hover': {
      backgroundColor: null,
      color: null,
    },
  },
  dark: {
    backgroundColor: colors.dark,
    color: colors.light,
    ':hover': {
      backgroundColor: colors.light,
      color: colors.dark,
    },
  },
})

type Props = PropsWithChildren<
  HTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'dark'
    customStyles?: StyleXStyles<{
      backgroundColor?: string
      color?: string
    }>
  }
>

export default function Button({
  children,
  variant,
  customStyles,
  ...rest
}: Props) {
  return (
    <button
      {...stylex.props(
        styles.default,
        variant && styles[variant],
        customStyles,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
