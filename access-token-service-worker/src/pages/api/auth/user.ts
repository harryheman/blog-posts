import prisma from '@/utils/prisma'
import { readFileSync } from 'fs'
import jwt from 'jsonwebtoken'
import { NextApiHandler } from 'next'

// читаем содержимое открытого ключа
const PUBLIC_KEY = readFileSync('./keys/public_key.pem', 'utf8')

const userHandler: NextApiHandler = async (req, res) => {
  // извлекаем токен идентификации из куки
  const idToken = req.cookies[process.env.COOKIE_NAME]
  // если токен отсутствует
  if (!idToken) {
    return res.status(401).json({ message: 'ID token must be provided' })
  }

  try {
    // декодируем токен с помощью открытого ключа
    const decodedToken = (await jwt.verify(idToken, PUBLIC_KEY)) as unknown as {
      userId: string
    }

    // если полезная нагрузка отсутствует
    if (!decodedToken || !decodedToken.userId) {
      return res.status(403).json({ message: 'Invalid token' })
    }

    // получаем данные пользователя на основе id из куки
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.userId },
      // без пароля
      select: {
        id: true,
        email: true
      }
    })

    // если данные отсутствуют
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // генерируем токен доступа
    const accessToken = await jwt.sign(
      { userId: user.id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: '1h'
      }
    )

    // возвращаем данные пользователя и токен доступа
    res.status(200).json({ user, accessToken })
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'User get error' })
  }
}

export default userHandler
