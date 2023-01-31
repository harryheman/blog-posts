import jwt from 'jsonwebtoken'
import { AuthGuardMiddleware } from '../types'

const authGuard: AuthGuardMiddleware = (handler) => async (req, res) => {
  // извлекаем токен доступа из заголовка авторизации - `Authorization: 'Bearer <accessToken>'`
  const accessToken = req.headers.authorization?.split(' ')[1]

  // если токен отсутствует
  if (!accessToken) {
    return res.status(403).json({ message: 'Access token must be provided' })
  }

  try {
    // декодируем токен
    const decodedToken = (await jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    )) as unknown as {
      userId: string
    }

    // если полезная нагрузка отсутствует
    if (!decodedToken || !decodedToken.userId) {
      return res.status(403).json({ message: 'Invalid token' })
    }

    // записываем id пользователя в объект запроса
    req.userId = decodedToken.userId
  } catch (e: any) {
    console.log(e)
    // если истек срок действия токена
    if (e.name === 'TokenExpiredError') {
      // сервер сообщает о том, что он - чайник :)
      return res.status(418).json({ message: 'Access token has been expired' })
    }
    return res.status(403).json({ message: 'Invalid token' })
  }

  // передаем управление следующему обработчику
  return handler(req, res)
}

export default authGuard
