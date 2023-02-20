import { faker } from '@faker-js/faker'

const range = (len: number) => {
  const arr = []
  for (let i = 0; i < len; i++) {
    arr.push(i)
  }
  return arr
}

let _id = 1
const id = () => _id++

const randInt = (min: number, max: number) =>
  Math.floor(min + Math.random() * (max - min + 1))

export type User = ReturnType<typeof createUser>

const createUser = () => {
  const statusChance = Math.random()

  return {
    id: id(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    age: randInt(18, 65),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    address: {
      city: faker.address.cityName(),
      street: faker.address.streetAddress()
    },
    job: {
      position: faker.name.jobTitle(),
      company: faker.company.name()
    },
    visits: Math.floor(Math.random() * 100),
    progress: Math.floor(Math.random() * 100),
    status:
      statusChance > 0.66
        ? 'relationship'
        : statusChance > 0.33
        ? 'complicated'
        : 'single'
  }
}

const getData = (len: number) => range(len).map(createUser)

export default getData
