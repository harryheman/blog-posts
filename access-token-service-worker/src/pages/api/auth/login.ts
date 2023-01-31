import { NextApiHandlerWithCookie } from '@/types'
import cookies from '@/utils/cookies'
import prisma from '@/utils/prisma'
import { User } from '@prisma/client'
import argon2 from 'argon2'
import { readFileSync } from 'fs'
import jwt from 'jsonwebtoken'

const PRIVATE_KEY = readFileSync('./keys/private_key.pem', 'utf8')

const loginHandler: NextApiHandlerWithCookie = async (req, res) => {
  // извлекаем данные пользователя из строки запроса
  const data: Pick<User, 'email' | 'password'> = JSON.parse(req.body)

  try {
    // получаем данные пользователя
    const user = await prisma.user.findUnique({
      where: {
        email: data.email
      },
      // включая пароль
      select: {
        id: true,
        email: true,
        password: true
      }
    })

    // если данные отсутствуют
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // сравниваем пароли
    const isPasswordCorrect = await argon2.verify(user.password, data.password)

    // если пользователем введен неправильный пароль
    if (!isPasswordCorrect) {
      return res.status(403).json({ message: 'Wrong password' })
    }

    // генерируем токен идентификации
    const idToken = await jwt.sign({ userId: user.id }, PRIVATE_KEY, {
      expiresIn: '7d',
      algorithm: 'RS256'
    })

    // генерируем токен доступа
    const accessToken = await jwt.sign(
      { userId: user.id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: '1h'
      }
    )

    // записываем токен идентификации в куки,
    // которая недоступна на клиенте
    res.cookie({
      name: process.env.COOKIE_NAME,
      value: idToken,
      options: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        path: '/',
        sameSite: true,
        secure: true
      }
    })

    // возвращаем данные пользователя без пароля и токен доступа
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email
      },
      accessToken
    })
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'User login error' })
  }
}

export default cookies(loginHandler)
