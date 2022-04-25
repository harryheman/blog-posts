import { Router } from 'express'
import { prisma } from '../index.js'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    const todos = (await prisma.todo.findMany()).sort(
      (a, b) => a.created_at - b.created_at
    )
    res.status(200).json(todos)
  } catch (e) {
    next(e)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const newTodo = await prisma.todo.create({
      data: req.body
    })
    res.status(201).json(newTodo)
  } catch (e) {
    next(e)
  }
})

router.put('/:id', async (req, res, next) => {
  const id = Number(req.params.id)
  try {
    const updatedTodo = await prisma.todo.update({
      data: req.body,
      where: { id }
    })
    res.status(201).json(updatedTodo)
  } catch (e) {
    next(e)
  }
})

router.delete('/:id', async (req, res, next) => {
  const id = Number(req.params.id)
  try {
    await prisma.todo.delete({
      where: { id }
    })
    res.sendStatus(201)
  } catch (e) {
    next(e)
  }
})

export default router
