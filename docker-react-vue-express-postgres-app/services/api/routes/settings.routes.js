import { Router } from 'express'
import { prisma } from '../index.js'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    const settings = await prisma.settings.findFirst()
    res.status(200).json(settings)
  } catch (e) {
    next(e)
  }
})

router.put('/:id', async (req, res, next) => {
  const id = Number(req.params.id)
  try {
    const settings = await prisma.settings.update({
      data: req.body,
      where: { id }
    })
    res.status(201).json(settings)
  } catch (e) {
    next(e)
  }
})

export default router
