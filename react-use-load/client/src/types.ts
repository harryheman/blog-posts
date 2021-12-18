import React from 'react'

export type TRoute = {
  path: string
  component: React.ReactNode
  name?: string
  exact?: boolean
}

export type Item = {
  id: string
  title: string
  description: string
  price: number
  image: string
}

export type AllItems = {
  items: Item[]
}

export type ItemsAndPages = AllItems & {
  totalPages: number
}

export type FetchItems = (page: number) => Promise<ItemsAndPages>
