// установка и активация СВ нас не интересуют
// self.addEventListener('install', (e) => {})
// self.addEventListener('activate', (e) => {})

// глобальная переменная для хранения токена доступа
let accessToken

// обработка запросов
self.addEventListener('fetch', async (e) => {
  // объект запроса
  const { request } = e
  // адрес запроса
  const { url } = request

  // если выполняется запрос к нашему серверу
  if (url.startsWith(self.location.origin) && url.includes('api')) {
    // регистрируем запрос на выход из системы
    if (url.includes('logout')) {
      // удаляем токен
      accessToken = null

      // перехватываем запрос на регистрацию/авторизацию
    } else if (url.includes('auth')) {
      e.respondWith(
        (async () => {
          // выполняем запрос
          const res = await fetch(request)
          // если возникла ошибка
          if (!res.ok) {
            // просто возвращаем ответ
            return res
          }
          // обратите внимание, что мы клонируем объект ответа
          const data = await res.clone().json()
          // обновляем значение токена
          accessToken = data.accessToken
          // извлекаем дополнительную информацию об ответе
          const { headers, status, statusText } = res.clone()
          // возвращаем ответ без токена и дополнительную информацию
          return new Response(JSON.stringify(data.user), {
            headers,
            status,
            statusText
          })
        })()
      )
    }

    // перехватываем запрос на создание/удаление задачи
    if (url.includes('todo')) {
      e.respondWith(
        (async () => {
          // выполняем запрос
          // обратите внимание, что мы клонируем объект запроса
          res = await fetch(request.clone(), {
            headers: {
              // добавляем заголовок авторизации
              Authorization: `Bearer ${accessToken}`
            }
          })

          // если срок действия токена истек
          if (res.status === 418) {
            // получаем новый токен
            res = await fetch(`${self.location.origin}/api/auth/user`, {
              // прикрепляем к запросу куки
              credentials: 'include'
            })
            const data = await res.json()
            // обновляем значение токена
            accessToken = data.accessToken

            // повторяем оригинальный запрос с новым токеном
            res = await fetch(request.clone(), {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            })
          }

          // возвращаем ответ
          return res
        })()
      )
    }
  }
})
