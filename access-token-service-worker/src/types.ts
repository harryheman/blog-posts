import type { CookieSerializeOptions } from 'cookie'
import type { NextApiRequest, NextApiResponse } from 'next'

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
