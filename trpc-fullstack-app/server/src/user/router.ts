import { z } from 'zod'
import { router, publicProcedure } from '../trpc.js'
import { users } from './db.js'
import type { User } from './types'
import { TRPCError } from '@trpc/server'

const userRouter = router({
  getUsers: publicProcedure.query(() => {
    return users
  }),
  getUserById: publicProcedure
    .input((val: unknown) => {
      if (typeof val === 'string') return val

      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Invalid input: ${typeof val}`,
      })
    })
    .query((req) => {
      const { input } = req

      const user = users.find((u) => u.id === input)

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `User with ID ${input} not found`,
        })
      }

      return user
    }),
  createUser: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation((req) => {
      const { input } = req

      const user: User = {
        id: `${Date.now().toString(36).slice(2)}`,
        name: input.name,
      }

      users.push(user)

      return user
    }),
})

export default userRouter
