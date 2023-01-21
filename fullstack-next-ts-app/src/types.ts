import { CookieSerializeOptions } from 'cookie'
import { NextApiRequest, NextApiResponse } from 'next'

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

export type NextApiMiddleware<H, R> = (
  handler: H
) => (req: NextApiRequest, res: R) => void

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
