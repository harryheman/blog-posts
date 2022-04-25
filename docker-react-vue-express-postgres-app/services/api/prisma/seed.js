import Prisma from '@prisma/client'
const { PrismaClient } = Prisma

const prisma = new PrismaClient()

const initialSettings = {
  greetings: 'Welcome to Docker Test App',
  theme: 'light',
  base_font_size: '16px'
}

const initialTodos = [
  {
    text: 'Eat',
    done: true
  },
  {
    text: 'Code',
    done: true
  },
  {
    text: 'Sleep',
    done: false
  },
  {
    text: 'Repeat',
    done: false
  }
]

async function main() {
  try {
    if (!(await prisma.settings.findFirst())) {
      await prisma.settings.create({ data: initialSettings })
    }
    if (!(await (await prisma.todo.findMany()).length)) {
      await prisma.todo.createMany({ data: initialTodos })
    }
    console.log('Database has been successfully seeded 🚀 ')
  } catch (e) {
    console.log(e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
