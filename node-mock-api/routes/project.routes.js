import { Router } from 'express'
import {
  getFileNames,
  createFile,
  readFile,
  removeFile,
  uploadFile
} from '../utils.js'

export default Router()
  .get('/', async (req, res, next) => {
    const { project_name } = req.query

    if (!project_name) return next()

    try {
      const project = await readFile(project_name)

      res.status(200).send(project)
    } catch (e) {
      next(e)
    }
  })
  .get('/', async (req, res, next) => {
    try {
      const projects = (await getFileNames()) || []

      res.status(200).json(projects)
    } catch (e) {
      next(e)
    }
  })
  .post('/create', async (req, res, next) => {
    const { project_name, project_data } = req.body

    try {
      await createFile(project_data, project_name)

      res.status(201).json({ message: `Project "${project_name}" created` })
    } catch (e) {
      next(e)
    }
  })
  .post(
    '/upload',
    uploadFile.single('project_data_upload'),
    (req, res, next) => {
      res.status(201).json({
        message: `Project "${req.body.project_name}" uploaded`
      })
    }
  )
  .delete('/', async (req, res, next) => {
    const { project_name } = req.query

    try {
      await removeFile(project_name)

      res.status(201).json({ message: `Project "${project_name}" removed` })
    } catch (e) {
      next(e)
    }
  })
