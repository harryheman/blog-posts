import { router } from './trpc.js'
import userRouter from './user/router.js'

const appRouter = router({
  user: userRouter,
})

export default appRouter
