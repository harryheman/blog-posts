import { NextApiHandlerWithCookie } from '@/types'
import cookies from '@/utils/cookies'
import prisma from '@/utils/prisma'
import { User } from '@prisma/client'
import argon2 from 'argon2'
import { readFileSync } from 'fs'
import jwt from 'jsonwebtoken'

// читаем содержимое закрытого ключа
const PRIVATE_KEY = readFileSync('./keys/private_key.pem', 'utf8')

const registerHandler: NextApiHandlerWithCookie = async (req, res) => {
  // извлекаем данные пользователя из тела запроса
  const data: Pick<User, 'email' | 'password'> = JSON.parse(req.body)

  try {
    // получаем данные пользователя
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    // если данные имеются
    // значит, пользователь уже зарегистрирован
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' })
    }

    // хэшируем пароль
    const passwordHash = await argon2.hash(data.password)
    // заменяем оригинальный пароль на хэш
    data.password = passwordHash

    // создаем и получаем пользователя
    const newUser = await prisma.user.create({
      data,
      // без пароля
      select: {
        id: true,
        email: true
      }
    })

    // генерируем токен идентификации с помощью закрытого ключа
    const idToken = await jwt.sign({ userId: newUser.id }, PRIVATE_KEY, {
      // срок действия - 7 дней
      expiresIn: '7d',
      algorithm: 'RS256'
    })

    // генерируем токен доступа с помощью секретного значения из переменной среды окружения
    const accessToken = await jwt.sign(
      { userId: newUser.id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        // срок действия - 1 час
        expiresIn: '1h'
      }
    )

    // записываем токен идентификации в куки,
    // которая недоступна на клиенте
    res.cookie({
      name: process.env.COOKIE_NAME,
      value: idToken,
      options: {
        // обязательно
        httpOnly: true,
        secure: true,
        // настоятельно рекомендуется
        sameSite: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        path: '/'
      }
    })

    // возвращаем данные пользователя и токен доступа
    res.status(200).json({
      user: newUser,
      accessToken
    })
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'User register error' })
  }
}

export default cookies(registerHandler)
