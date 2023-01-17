import authGuard from '@/utils/authGuard'
import checkFields from '@/utils/checkFields'
import prisma from '@/utils/prisma'
import { Like } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import nextConnect from 'next-connect'

const likeHandler = nextConnect<NextApiRequest, NextApiResponse>()

likeHandler.post(async (req, res) => {
  const data = JSON.parse(req.body) as Omit<Like, 'id'>

  if (!checkFields(data, ['postId', 'userId'])) {
    return res.status(400).json({ message: 'Some required fields are missing' })
  }

  try {
    const like = await prisma.like.create({
      data
    })
    res.status(201).json(like)
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Like create error' })
  }
})

likeHandler.delete(async (req, res) => {
  const id = req.query.id as string

  if (!id) {
    return res.status(400).json({ message: 'Like ID is missing' })
  }

  try {
    const like = await prisma.like.delete({
      where: {
        id
      }
    })
    res.status(200).json(like)
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Like remove error' })
  }
})

export default authGuard(likeHandler)
