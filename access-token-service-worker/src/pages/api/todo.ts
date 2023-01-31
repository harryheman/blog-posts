import { NextApiRequestWithUserId } from '@/types'
import authGuard from '@/utils/authGuard'
import prisma from '@/utils/prisma'
import { Todo } from '@prisma/client'
import { NextApiResponse } from 'next'
import nextConnect from 'next-connect'

const todoHandler = nextConnect<NextApiRequestWithUserId, NextApiResponse>()

// роут для получения задач пользователя
todoHandler.get(async (req, res) => {
  try {
    // получаем задачи из БД
    const todos = await prisma.todo.findMany({
      where: {
        userId: req.userId
      }
    })

    // возвращаем их
    res.status(200).json(todos)
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Todos get error' })
  }
})

// роут для создания задачи
todoHandler.post(async (req, res) => {
  // извлекаем данные задачи из тела запроса
  const data: Pick<Todo, 'title' | 'content' | 'userId'> = JSON.parse(req.body)
  // добавляем в данные id пользователя
  data.userId = req.userId

  try {
    // создаем задачу
    const todo = await prisma.todo.create({
      data
    })
    // возвращаем ее
    res.status(200).json(todo)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Todo create error' })
  }
})

// роут для удаления задачи
todoHandler.delete(async (req, res) => {
  // извлекаем id задачи из строки запроса
  const id = req.query.id as string

  try {
    // удаляем задачу
    const todo = await prisma.todo.delete({
      where: {
        id_userId: {
          id,
          userId: req.userId
        }
      }
    })
    // возвращаем ее
    res.status(200).json(todo)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Todo remove error' })
  }
})

// все роуты являются защищенными
export default authGuard(todoHandler)
