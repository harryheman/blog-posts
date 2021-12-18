import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { Low, JSONFile } from 'lowdb'

const _dirname = dirname(fileURLToPath(import.meta.url))

const file = join(_dirname, 'data.json')
const adapter = new JSONFile(file)
const db = new Low(adapter)

export default db
