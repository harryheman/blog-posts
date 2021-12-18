import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { promises as fs } from 'fs'
import faker from 'faker'

const __dirname = dirname(fileURLToPath(import.meta.url))

const dirPath = `${__dirname}/data`

export const filePath = `${dirPath}/fake.json`

const fakeData = JSON.stringify(
  Array.from({ length: 100 }, () => ({
    id: faker.datatype.uuid(),
    title: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: faker.commerce.price(),
    image: faker.image.imageUrl(640, 480, 'tech', true)
  }))
)

try {
  await fs.open(filePath)
  console.log('exists')
} catch {
  await fs.mkdir(dirPath, { recursive: true })
  await fs.writeFile(filePath, fakeData)
  console.log('created')
}
