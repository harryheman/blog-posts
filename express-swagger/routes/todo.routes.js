import { Router } from 'express'
import db from '../db/index.js'

const router = Router()

router.get('/', async (req, res, next) => {
  // #swagger.description = 'Get all todos'
  /* #swagger.responses[200] = {
      description: 'Array of all todos',
      schema: { $ref: '#/definitions/Todos' }
  } */
  try {
    await db.read()

    if (db.data.length) {
      res.status(200).json(db.data)
    } else {
      res.status(200).json({ message: 'There are no todos.' })
    }
  } catch (e) {
    console.log('*** Get all todos')
    next(e)
  }
})

router.get('/:id', async (req, res, next) => {
  // #swagger.description = 'Get todo by ID'
  /* #swagger.parameters['id'] = {
    description: 'Existing todo ID',
    type: 'string',
    required: true
  } */
  /* #swagger.responses[200] = {
      description: 'Todo with provided ID',
      schema: { $ref: '#/definitions/Todo' }
  } */
  const id = req.params.id

  try {
    await db.read()

    if (!db.data.length) {
      return res.status(400).json({ message: 'There are no todos' })
    }

    const todo = db.data.find((t) => t.id === id)

    if (!todo) {
      return res
        .status(400)
        .json({ message: 'There is no todo with provided ID' })
    }

    res.status(200).json(todo)
  } catch (e) {
    console.log('*** Get todo by ID')
    next(e)
  }
})

router.post('/', async (req, res, next) => {
  // #swagger.description = 'Create new todo'
  /* #swagger.parameters['text'] = {
    in: 'body',
    description: 'New todo text',
    type: 'object',
    required: true,
    schema: { $ref: '#/definitions/Text' }
  } */
  /* #swagger.responses[201] = {
      description: 'Array of new todos',
      schema: { $ref: '#/definitions/Todos' }
  } */
  const text = req.body.text

  if (!text) {
    return res.status(400).json({ message: 'New todo text must be provided' })
  }

  try {
    await db.read()

    const newTodo = {
      id: String(db.data.length + 1),
      text,
      done: false
    }

    db.data.push(newTodo)

    await db.write()

    res.status(201).json(db.data)
  } catch (e) {
    console.log('*** Create todo')
    next(e)
  }
})

router.put('/:id', async (req, res, next) => {
  // #swagger.description = 'Update existing todo'
  /* #swagger.parameters['id'] = {
    description: 'Existing todo ID',
    type: 'string',
    required: true
  } */
  /* #swagger.parameters['changes'] = {
    in: 'body',
    description: 'Existing todo changes',
    type: 'object',
    required: true,
    schema: { $ref: '#/definitions/Changes' }
  } */
  /* #swagger.responses[201] = {
    description: 'Array of new todos',
    schema: { $ref: '#/definitions/Todos' }
  } */
  const id = req.params.id

  if (!id) {
    return res
      .status(400)
      .json({ message: 'Existing todo ID must be provided' })
  }

  const changes = req.body.changes

  if (!changes) {
    return res.status(400).json({ message: 'Changes must be provided' })
  }

  try {
    await db.read()

    const todo = db.data.find((t) => t.id === id)

    if (!todo) {
      return res
        .status(400)
        .json({ message: 'There is no todo with provided ID' })
    }

    const updatedTodo = { ...todo, ...changes }

    const newTodos = db.data.map((t) => (t.id === id ? updatedTodo : t))

    db.data = newTodos

    await db.write()

    res.status(201).json(db.data)
  } catch (e) {
    console.log('*** Update todo')
    next(e)
  }
})

router.delete('/:id', async (req, res, next) => {
  // #swagger.description = 'Remove existing todo'
  /* #swagger.parameters['id'] = {
    description: 'Existing todo ID',
    type: 'string',
    required: true
  } */
  /* #swagger.responses[201] = {
    description: 'Array of new todos or empty array',
    schema: { $ref: '#/definitions/Todos' }
  } */
  const id = req.params.id

  if (!id) {
    return res
      .status(400)
      .json({ message: 'Existing todo ID must be provided' })
  }

  try {
    await db.read()

    const todo = db.data.find((t) => t.id === id)

    if (!todo) {
      return res
        .status(400)
        .json({ message: 'There is no todo with provided ID' })
    }

    const newTodos = db.data.filter((t) => t.id !== id)

    db.data = newTodos

    await db.write()

    res.status(201).json(db.data)
  } catch (e) {
    console.log('*** Remove todo')
    next(e)
  }
})

export default router
