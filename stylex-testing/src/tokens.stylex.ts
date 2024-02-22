import stylex from '@stylexjs/stylex'

const DARK = '@media (prefers-color-scheme: dark)'

export const colors = stylex.defineVars({
  light: { default: '#FBFBFB', [DARK]: '#332D2D' },
  dark: { default: '#332D2D', [DARK]: '#FBFBFB' },
  primary: '#3B71CA',
  success: '#14A44D',
})

export const spacing = stylex.defineVars({
  none: '0px',
  xsmall: '4px',
  small: '8px',
  medium: '12px',
  large: '16px',
})
