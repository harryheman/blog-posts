import type { User } from '@prisma/client'
import type { CookieSerializeOptions } from 'cookie'
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'

export type CookieArgs = {
  name: string
  value: any
  options?: CookieSerializeOptions
}

export type NextApiResponseWithCookie = NextApiResponse & {
  cookie: (args: CookieArgs) => void
}

export type NextApiHandlerWithCookie = (
  req: NextApiRequest,
  res: NextApiResponseWithCookie
) => unknown | Promise<unknown>

export type CookiesMiddleware = (
  handler: NextApiHandlerWithCookie
) => (req: NextApiRequest, res: NextApiResponseWithCookie) => void

export type NextApiRequestWithUserId = NextApiRequest & {
  userId: string
}

export type NextApiHandlerWithUserId = (
  req: NextApiRequestWithUserId,
  res: NextApiResponse
) => unknown | Promise<unknown>

export type AuthGuardMiddleware = (
  handler: NextApiHandlerWithUserId
) => (req: NextApiRequestWithUserId, res: NextApiResponse) => void

export type Block = {
  id: number
  imgSrc: string
  imgAlt: string
  title: string
  description: string
}

export type Blocks = Block[]

export type News = {
  id: number
  imgSrc: string
  imgAlt: string
  author: string
  datePublished: string
  title: string
  description: string
  text: string
}

export type NewsArr = News[]

export type UserResponseData = {
  user: Omit<User, 'password'>
  accessToken: string
}
