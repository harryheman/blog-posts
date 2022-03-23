import { unlink } from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import onError from './onError.js'

const _dirname = dirname(fileURLToPath(import.meta.url))

const fileDir = join(_dirname, '../files')

export const getFilePath = (filePath) => join(fileDir, filePath)

export const removeFile = async (filePath) => {
  try {
    await unlink(join(fileDir, filePath))
  } catch (e) {
    onError(e)
  }
}
