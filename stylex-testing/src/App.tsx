import stylex from '@stylexjs/stylex'
import Button from './components/Button'
import { colors, spacing } from './tokens.stylex'

const styles = stylex.create({
  app: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.medium,
  },
  customButton: {
    backgroundColor: colors.success,
    color: colors.light,
  },
})

// const stylesForLog = stylex.create({
//   root: {
//     display: 'flex',
//     flexDirection: 'column',
//   },
// })
// const stylesForLog2 = stylex.create({
//   root2: {
//     display: 'flex',
//   },
// })

// const stringify = (obj: Record<string, unknown>) => JSON.stringify(obj, null, 2)

export default function App() {
  // console.log('result of create:', stringify(stylesForLog))
  // console.log('result of create 2:', stringify(stylesForLog2))
  // console.log(stylesForLog.root.display === stylesForLog2.root2.display)
  // console.log(
  //   'result of props:',
  //   stringify(stylex.props(stylesForLog.root, stylesForLog2.root2)),
  // )
  // console.log(
  //   'result of props 2:',
  //   stringify(
  //     // @ts-ignore
  //     stylex.props(stylesForLog.root, stylesForLog2.root2, { display: 'flex' }),
  //   ),
  // )

  return (
    <div {...stylex.props(styles.app)}>
      <Button>Default</Button>
      <Button variant='dark'>Dark</Button>
      <Button variant='primary'>Primary</Button>
      <Button customStyles={styles.customButton}>Custom</Button>
    </div>
  )
}
