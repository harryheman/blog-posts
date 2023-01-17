import authGuard from '@/utils/authGuard'
import checkFields from '@/utils/checkFields'
import prisma from '@/utils/prisma'
import { Post } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import nextConnect from 'next-connect'

const postsHandler = nextConnect<NextApiRequest, NextApiResponse>()

postsHandler.post(async (req, res) => {
  const data: Pick<Post, 'title' | 'content' | 'authorId'> = JSON.parse(
    req.body
  )

  if (!checkFields(data, ['title', 'content', 'authorId'])) {
    res.status(400).json({ message: 'Some required fields are missing' })
  }

  try {
    const post = await prisma.post.create({
      data
    })
    res.status(200).json(post)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Post create error' })
  }
})

postsHandler.put(async (req, res) => {
  const data: Pick<Post, 'title' | 'content'> & {
    postId: string
  } = JSON.parse(req.body)

  if (!checkFields(data, ['title', 'content'])) {
    res.status(400).json({ message: 'Some required fields are missing' })
  }

  try {
    const post = await prisma.post.update({
      where: { id: data.postId },
      data: {
        title: data.title,
        content: data.content
      }
    })
    res.status(200).json(post)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Update post error' })
  }
})

postsHandler.delete(async (req, res) => {
  const id = req.query.id as string

  if (!id) {
    return res.status(400).json({
      message: 'Post ID is missing'
    })
  }

  try {
    const post = await prisma.post.delete({
      where: {
        id
      }
    })
    res.status(200).json(post)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Post remove error' })
  }
})

export default authGuard(postsHandler)
