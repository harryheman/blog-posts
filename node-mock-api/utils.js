import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { promises as fs } from 'fs'
import multer from 'multer'

export const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT_PATH = `${__dirname}/projects`

const notExist = (e) => e.code === 'ENOENT'
const truncPath = (p) => p.split('/').slice(0, -1).join('/')

export async function createFile(fileData, filePath, fileExt = 'json') {
  const fileName = `${ROOT_PATH}/${filePath}.${fileExt}`

  try {
    if (fileExt === 'json') {
      await fs.writeFile(fileName, JSON.stringify(fileData, null, 2))
    } else {
      await fs.writeFile(fileName, fileData)
    }
  } catch (err) {
    if (notExist(err)) {
      await fs.mkdir(truncPath(`${ROOT_PATH}/${filePath}`), {
        recursive: true
      })
      return createFile(fileData, filePath, fileExt)
    }
    throw err
  }
}

export async function readFile(filePath, fileExt = 'json') {
  const fileName = `${ROOT_PATH}/${filePath}.${fileExt}`

  let fileHandler = null
  try {
    fileHandler = await fs.open(fileName)

    const fileContent = await fileHandler.readFile('utf-8')

    return fileExt === 'json' ? JSON.parse(fileContent) : fileContent
  } catch (err) {
    if (notExist(err)) {
      throw { status: 404, message: 'Not found' }
    }
    throw err
  } finally {
    fileHandler?.close()
  }
}

export async function removeFile(filePath, fileExt = 'json') {
  const fileName = `${ROOT_PATH}/${filePath}.${fileExt}`

  try {
    await fs.unlink(fileName)

    await removeDir(truncPath(`${ROOT_PATH}/${filePath}`))
  } catch (err) {
    if (notExist(err)) {
      throw { status: 404, message: 'Not found' }
    }
    throw err
  }
}

async function removeDir(dirPath, rootPath = ROOT_PATH) {
  if (dirPath === rootPath) return

  const isEmpty = (await fs.readdir(dirPath)).length < 1

  if (isEmpty) {
    await fs.rmdir(dirPath)

    removeDir(truncPath(dirPath))
  }
}

export async function getFileNames(path = ROOT_PATH) {
  let fileNames = []

  try {
    const files = await fs.readdir(path)

    if (files.length < 1) return fileNames

    for (let file of files) {
      file = `${path}/${file}`

      const isDir = (await fs.stat(file)).isDirectory()

      if (isDir) {
        fileNames = fileNames.concat(await getFileNames(file))
      } else {
        fileNames.push(file)
      }
    }

    return fileNames
  } catch (err) {
    if (notExist(err)) {
      throw { status: 404, message: 'Not found' }
    }
    throw err
  }
}

export const uploadFile = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dirPath = `${ROOT_PATH}/${req.body.project_name.replace(
        file.originalname.replace('.json', ''),
        ''
      )}`
      fs.mkdir(dirPath, { recursive: true }).then(() => {
        cb(null, dirPath)
      })
    },
    filename: (_, file, cb) => {
      cb(null, file.originalname)
    }
  })
})

const strCollator = new Intl.Collator()
const numCollator = new Intl.Collator([], { numeric: true })

export const queryMap = {
  offset: (items, count) => items.slice(count),
  limit: (items, count) => items.slice(0, count),
  sort(items, field = 'id', order = 'asc') {
    const isString =
      typeof items[0][field] === 'string' && Number.isNaN(items[0][field])

    const collator = isString ? strCollator : numCollator

    return items.sort((a, b) =>
      order.toLowerCase() === 'asc'
        ? collator.compare(a[field], b[field])
        : collator.compare(b[field], a[field])
    )
  }
}

export function areEqual(a, b) {
  if (a === b) return true

  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()

  if (!a || !b || (typeof a !== 'object' && typeof b !== 'object'))
    return a === b

  if (a.prototype !== b.prototype) return false

  const keys = Object.keys(a)

  if (keys.length !== Object.keys(b).length) return false

  return keys.every((k) => areEqual(a[k], b[k]))
}

export function isJson(item) {
  try {
    item = JSON.parse(item)
  } catch (e) {
    return false
  }

  if (typeof item === 'object' && item !== null) {
    return true
  }

  return false
}
