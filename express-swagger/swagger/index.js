import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import swaggerAutogen from 'swagger-autogen'

const _dirname = dirname(fileURLToPath(import.meta.url))

const doc = {
  info: {
    title: 'Todo API',
    description: 'My todo API'
  },
  definitions: {
    Todo: {
      id: '1',
      text: 'test',
      done: false
    },
    Todos: [
      {
        $ref: '#/definitions/Todo'
      }
    ],
    Text: {
      text: 'test'
    },
    Changes: {
      changes: {
        text: 'test',
        done: true
      }
    }
  },
  host: 'localhost:3000',
  schemes: ['http']
}

const outputFile = join(_dirname, 'output.json')
const endpointsFiles = [join(_dirname, '../server.js')]

swaggerAutogen(/*options*/)(outputFile, endpointsFiles, doc).then(
  ({ success }) => {
    console.log(`Generated: ${success}`)
  }
)
