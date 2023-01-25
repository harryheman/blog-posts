import { NextApiRequestWithUserId } from '@/types'
import authGuard from '@/utils/authGuard'
import checkFields from '@/utils/checkFields'
import prisma from '@/utils/prisma'
import { Like, Prisma } from '@prisma/client'
import { NextApiResponse } from 'next'
import nextConnect from 'next-connect'

const likeHandler = nextConnect<NextApiRequestWithUserId, NextApiResponse>()

likeHandler.post(async (req, res) => {
  const data = JSON.parse(req.body) as Pick<Like, 'postId'>

  if (!checkFields(data, ['postId'])) {
    return res.status(400).json({ message: 'Some required fields are missing' })
  }

  try {
    const like = await prisma.like.create({
      data: {
        postId: data.postId,
        userId: req.userId
      }
    })
    res.status(201).json(like)
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Like create error' })
  }
})

likeHandler.delete(async (req, res) => {
  const { likeId, postId } = req.query as Record<string, string>

  if (!likeId || !postId) {
    return res
      .status(400)
      .json({ message: 'Some required queries are missing' })
  }

  try {
    const like = await prisma.like.delete({
      where: {
        id_userId_postId: {
          id: likeId,
          userId: req.userId,
          postId
        }
      }
    })
    res.status(200).json(like)
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Like remove error' })
  }
})

export default authGuard(likeHandler)
