# React: пример использования Auth0 для разработки сервиса аутентификации/авторизации

Let's build web app auth service using [`Auth0`](https://auth0.com/).

`Auth0` - это платформа, предоставляющая готовые решения для разработки сервисов любого уровня сложности. `Auth0` поддерживается командой, стоящей за разработкой [`JWT`](https://jwt.io/) (JSON Web Token/веб-токен в формате `JSON`). Это вселяет определенную уверенность в безопасности `Auth0-сервисов`.

Бесплатная версия `Auth0` позволяет регистрировать до 7000 пользователей.

В [этой статье](https://habr.com/ru/company/timeweb/blog/593063/) я писал о том, что такое `JWT`, и как разработать собственный сервис с нуля.

Знакомство с `Auth0` можно начать [отсюда](https://auth0.com/docs/get-started).

Исходный код `Auth0 SDK`, который мы будем использовать для разработки приложения, можно найти [здесь](https://github.com/auth0/auth0-react).

В статье я расскажу только о самых основных возможностях, предоставляемых `Auth0`.

В примерах и на скриншотах ниже вы увидите реальные `чувствительные данные/sensitive data`. Это не означает, что вы сможете их использовать.

## Подготовка и настройка проекта

Создаем директорию, переходим в нее и создаем клиента - шаблон `React/TypeScript-приложения` с помощью [`Create React App`](https://create-react-app.dev/):

```bash
mkdir react-auth0
cd react-auth0 # cd !$

yarn create react-app client --template typescript
# or
npx create-react-app ...
```

Создаем директорию для сервера, переходим в нее и инициализируем `Node.js-приложение`:

```bash
mkdir server
cd server

yarn init -yp
# or
npm init -y
```

Создаем аккаунт `Auth0`:

<img src="https://habrastorage.org/webt/5i/5f/ql/5i5fqlahehtnx1jsft1crjddthq.png" />
<br />

Создаем `tenant/арендатора`:

<img src="https://habrastorage.org/webt/sb/rk/1r/sbrk1rvpiehuekqa-hbhsxfnnpu.png" />
<br />

Создаем `одностраничное приложение/single page application` на вкладке `Applications/Applications`:

<img src="https://habrastorage.org/webt/l0/bz/pj/l0bzpjs4f5z57freyy3njnlhuva.png" />
<br />

<img src="https://habrastorage.org/webt/px/1z/7u/px1z7upqylxmjizp3x_6hkphoam.png" />
<br />

Переходим в раздел `Settings`:

<img src="https://habrastorage.org/webt/3x/pj/l2/3xpjl22zirt03a0g32p0om1ub3g.png" />
<br />

Создаем файл `.env` в директории `client` и записываем в него значения полей `Domain` и `Client ID`:

```bash
REACT_APP_AUTH0_DOMAIN = auth0-test-app.eu.auth0.com
REACT_APP_AUTH0_CLIENT_ID = Ykv47YaNC3naGvfljFt8LyhzVPRPZCJY
```

Прописываем `URL` клиента в полях `Allowed Callback URLs`, `Allowed Logout URLs` и `Allowed Web Origins`:

<img src="https://habrastorage.org/webt/7m/hp/ka/7mhpka12ziyvz_rycyipobultmu.png" />
<br />

Сохраняем изменения.

Создаем `API` на вкладке `Applications/API`:

<img src="https://habrastorage.org/webt/r9/ft/re/r9ftreme8ttk7g-kyndnl-ypwks.png" />
<br />

<img src="https://habrastorage.org/webt/pl/bu/gg/plbuggvxf-9qphw5ftrao6hrzeu.png" />
<br />

Переходим в раздел `Settings`:

<img src="https://habrastorage.org/webt/kh/ck/or/khckorhccaxme5qgbkasstggmim.png" />
<br />


Записываем значение поля `Identifier` и `URL` сервера в файл `.env`:

```bash
REACT_APP_AUTH0_AUDIENCE='https://auth0-test-app'
REACT_APP_SERVER_URI='http://localhost:4000/api'
```

Создаем файл `.env` в директории `server` следующего содержания:

```bash
AUTH0_DOMAIN='auth0-test-app.eu.auth0.com'
AUTH0_AUDIENCE='https://auth0-test-app'
CLIENT_URI='http://localhost:3000'
```

## Клиент

Переходим в директорию `client` и устанавливаем дополнительные зависимости:

```bash
cd client

# зависимости для продакшна
yarn add @auth0/auth0-react react-router-dom react-loader-spinner
# зависимость для разработки
yarn add -D sass
```

- [@auth0/auth0-react](https://www.npmjs.com/package/@auth0/auth0-react) - `Auth0 SDK` для `React-приложений`
- [react-router-dom](https://www.npmjs.com/package/react-router-dom) - библиотека для маршрутизации
- [react-loader-spinner](https://www.npmjs.com/package/react-loader-spinner) - индикатор загрузки
- [sass](https://sass-lang.com/) - `CSS-препроцессор`

Структура директории `src`:

```
- api
 - messages.ts
- components
 - AuthButton
   - LoginButton
     - LoginButton.tsx
   - LogoutButton
     - LogoutButton.tsx
   - AuthButton.tsx
 - Boundary
   - Error
     - error.scss
     - Error.tsx
   - Spinner
     - Spinner.tsx
   - Boundary.tsx
 - Navbar
   - Navbar.tsx
- pages
 - AboutPage
   - AboutPage.tsx
 - HomePage
   - HomePage.tsx
 - MessagePage
   - message.scss
   - MessagePage.tsx
 - ProfilePage
   - profile.scss
   - ProfilePage.tsx
- providers
 - AppProvider.tsx
 - Auth0ProviderWithNavigate.tsx
- router
 - AppRoutes.tsx
 - AppLinks.tsx
- styles
 - _mixins.scss
 - _variables.scss
- types
 - index.d.ts
- utils
 - createStore.tsx
- App.scss
- App.tsx
- index.tsx
...
```

Логика работы приложения:

- в панели для навигации имеется кнопка для авторизации;
- кнопка рендерится условно в зависимости от статуса авторизации пользователя;
- если пользователь не авторизован, при нажатии кнопки он перенаправляется в `Auth0` для выполнения входа в систему;
- если пользователь авторизован, при нажатии кнопки выполняется выход из системы;
- в приложении имеется 4 страницы: `HomePage`, `AboutPage`, `ProfilePage` и `MessagePage`;
- первые две страницы находятся в открытом доступе;
- последние две - требуют авторизации;
- при переходе неавторизованного пользователя на страницу `ProfilePage`, он перенаправляется в `Auth0`;
- после входа в систему пользователь возвращается на страницу `ProfilePage`, где видит информацию о своем профиле;
- на странице `MessagePage` пользователь может отправить два запроса к серверу: на получение открытого сообщения и на получение защищенного сообщения;
- если пользователь не авторизован, при отправке запроса на получение защищенного сообщения возвращается ошибка.

Дальше я буду рассказывать только о том, что касается непосредственно `Auth0`.

__Интеграция приложения с `Auth0`__

Для интеграции приложения с `Auth0` используется провайдер `Auth0Provider`.

Для того, чтобы иметь возможность переправлять пользователя на кастомную страницу после входа в систему, дефолтный провайдер необходимо апгрейдить следующим образом (`providers/Auth0ProviderWithNavigate`):

```js
// импортируем дефолтный провайдер
import { Auth0Provider } from '@auth0/auth0-react'
// хук для выполнения программной навигации
import { useNavigate } from 'react-router-dom'
import { Children } from 'types'

const domain = process.env.REACT_APP_AUTH0_DOMAIN as string
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID as string
const audience = process.env.REACT_APP_AUTH0_AUDIENCE as string

const Auth0ProviderWithNavigate = ({ children }: Children) => {
 const navigate = useNavigate()

 // функция, вызываемая после авторизации
 const onRedirectCallback = (appState: { returnTo?: string }) => {
   // путь для перенаправления указывается в свойстве `returnTo`
   // по умолчанию пользователь возвращается на текущую страницу
   navigate(appState?.returnTo || window.location.pathname)
 }

 return (
   <Auth0Provider
     domain={domain}
     clientId={clientId}
     // данная настройка нужна для взаимодействия с сервером
     audience={audience}
     redirectUri={window.location.origin}
     onRedirectCallback={onRedirectCallback}
   >
     {children}
   </Auth0Provider>
 )
}

export default Auth0ProviderWithNavigate
```

С сигнатурой провайдера можно ознакомиться [здесь](https://github.com/auth0/auth0-react/blob/master/src/auth0-provider.tsx).

Оборачиваем компоненты приложения в провайдер (`index.tsx`):

```js
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import Auth0ProviderWithNavigate from 'providers/Auth0ProviderWithNavigate'
import { AppProvider } from 'providers/AppProvider'
import App from './App'

ReactDOM.render(
 <React.StrictMode>
   {/* провайдер маршрутизации */}
   <BrowserRouter>
     {/* провайдер авторизации */}
     <Auth0ProviderWithNavigate>
       {/* провайдер состояния */}
       <AppProvider>
         <App />
       </AppProvider>
     </Auth0ProviderWithNavigate>
   </BrowserRouter>
 </React.StrictMode>,
 document.getElementById('root')
)
```

__Вход и выход из системы__

Для входа в систему используется метод `loginWithRedirect`, а для выхода - метод `logout`. Оба метода возвращаются хуком `useAuth0`. `useAuth0` также возвращает логическое значение `isAuthenticated` (и много чего еще) - статус авторизации, который можно использовать для условного рендеринга кнопок.

Вот как реализована кнопка для аутентификации (`components/AuthButton/AuthButton.tsx`):

```js
// импортируем хук
import { useAuth0 } from '@auth0/auth0-react'
import { LoginButton } from './LoginButton/LoginButton'
import { LogoutButton } from './LogoutButton/LogoutButton'

export const AuthButton = () => {
 // получаем статус авторизации
 const { isAuthenticated } = useAuth0()

 return isAuthenticated ? <LogoutButton /> : <LoginButton />
}
```

Кнопка для входа в систему (`components/AuthButton/LoginButton/LoginButton.tsx`):

```js
// импортируем хук
import { useAuth0 } from '@auth0/auth0-react'

export const LoginButton = () => {
 // получаем метод для входа в систему
 const { loginWithRedirect } = useAuth0()

 return (
   <button className='auth login' onClick={loginWithRedirect}>
     Log In
   </button>
 )
}
```

Кнопка для выхода из системы (`components/AuthButton/LogoutButton/LogoutButton.tsx`):

```js
// импортируем хук
import { useAuth0 } from '@auth0/auth0-react'

export const LogoutButton = () => {
 // получаем метод для выхода из системы
 const { logout } = useAuth0()

 return (
   <button
     className='auth logout'
     // после выхода из системы, пользователь перенаправляется на главную страницу
     onClick={() => logout({ returnTo: window.location.origin })}
   >
     Log Out
   </button>
 )
}
```

С сигнатурой хука можно ознакомиться [здесь](https://github.com/auth0/auth0-react/blob/master/src/use-auth0.tsx).

__Состояние авторизации__

Состояние авторизации пользователя сохраняется на протяжении времени жизни `id_token/токена идентификации`. Время жизни токена устанавливается на вкладке `Settings` приложения в поле `ID Token Expiration` раздела `ID Token` и по умолчанию составляет `36 000` секунд или `10` часов:

<img src="https://habrastorage.org/webt/xp/35/_i/xp35_i4pfioforsubevgbnncwva.png" />
<br />

Токен записывается в куки, которые можно найти в разделе `Storage/Cookies` вкладки `Application` инструментов разработчика в браузере:

<img src="https://habrastorage.org/webt/kq/rd/i8/kqrdi8x1q2fwojxs6wec0bxg9cg.png" />
<br />

Это означает, что статус авторизации пользователя сохраняется при перезагрузке страницы, закрытии/открытии вкладки браузера и т.д.

При выходе из системы куки вместе с `id_token` удаляется.

<img src="https://habrastorage.org/webt/d_/o7/qw/d_o7qwb9ya8jnehkxbw-jeicw1g.png" />
<br />

__Создание защищенной страницы__

Для защиты страницы от доступа неавторизованных пользователей предназначена утилита `withAuthenticationRequired`. Хук `useAuth0`, кроме прочего, возвращает объект `user` с нормализованными данными пользователя.

Страница `ProfilePage` реализована следующим образом (`pages/ProfilePage/ProfilePage.tsx`):

```js
import './profile.scss'
import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react'
import { Spinner } from 'components/index.components'

// оборачиваем код компонента в утилиту
export const ProfilePage = withAuthenticationRequired(
 () => {
   // получаем данные пользователя
   const { user } = useAuth0()

   return (
     <>
       <h1>Profile Page</h1>
       <div className='profile'>
         <img src={user?.picture} alt={user?.name} />
         <div>
           <h2>{user?.name}</h2>
           <p>{user?.email}</p>
         </div>
       </div>
     </>
   )
 },
 {
   // обе настройки являются опциональными
   returnTo: '/profile',
   onRedirecting: () => <Spinner />
 }
)
```

С сигнатурой утилиты можно ознакомиться [здесь](https://github.com/auth0/auth0-react/blob/master/src/with-authentication-required.tsx).

__Проверка работоспособности клиента__

Находясь в директории `client`, выполняем команду `yarn start` или `npm start` для запуска сервера для разработки:

<img src="https://habrastorage.org/webt/pg/yc/kb/pgyckb5mcyibw4-oad_hciyzshm.png" />
<br />

Нажимаем на кнопку `Log In`. Попадаем на страницу регистрации/авторизации `Auth0`:

<img src="https://habrastorage.org/webt/bb/h-/17/bbh-17pwf7igs-vuang03zopvfg.png" />
<br />

По умолчанию предоставляется возможность входа в систему с помощью аккаунта `Google` (`Google OAuth 2.0`). Позже мы добавим возможность авторизации с помощью аккаунта `GitHub`.

Входим в систему. Возвращаемся на главную страницу. Видим, что кнопка `Log In` сменилась кнопкой `Log Out`.

<img src="https://habrastorage.org/webt/pm/2y/2m/pm2y2mrvzrk1udoe8fpl0j8mfwc.png" />
<br />

Выходим из системы. Пробуем перейти на страницу `Profile`. Снова попадаем на страницу `Auth0`. Входим в систему. Возвращаемся на страницу профиля:

<img src="https://habrastorage.org/webt/eq/rl/vb/eqrlvbavghkwelyjinezduf1kwm.png" />
<br />

_Подключение `GitHub`_

Переходим на вкладку `Authentication/Social` и нажимаем кнопку `Create Connection`:

<img src="https://habrastorage.org/webt/ir/qv/g2/irqvg29ro93oowiiob88izp9vao.png" />
<br />

Выбираем `GitHub` из предложенного списка:

<img src="https://habrastorage.org/webt/ro/lc/dl/rolcdlcrkbajuczyg8e0umedbsg.png" />
<br />

Заходим в профиль `GitHub`. Переходим в раздел `Settings/Developer settings/OAuth Apps` и нажимаем на кнопку `Register a new application`:

<img src="https://habrastorage.org/webt/7g/-y/ca/7g-ycakozleshazjilnlot-6vok.png" />
<br />

Заполняем поля `Application name`, `Homepage URL` (`https://ВАШ-ДОМЕН.auth0.com`) и `Authorization callback URL` (`https://ВАШ-ДОМЕН/login/callback`):

<img src="https://habrastorage.org/webt/kq/uy/sj/kquysjugt9hh-tegqd00vtilm4k.png" />
<br />

Нажимаем на кнопку `Generate a new client secret`. Копируем значения полей `Client ID` и `Client secret` и вставляем их в соответствующие поля `Auth0`:

<img src="https://habrastorage.org/webt/gn/lj/xf/gnljxfh_fdsi0pxk-vwgimaleag.png" />
<br />

<img src="https://habrastorage.org/webt/jr/aj/yc/jrajycahagf5etp7sumeftnabng.png" />
<br />

В разделе `Attributes` в дополнение к `Basic Profile` выбираем `Email address`, а в разделе `Permissions` - `read:user`.

Нажимаем на кнопку `Create`. Подключаем клиентское приложение и `API`.

<img src="https://habrastorage.org/webt/pg/-5/nk/pg-5nkmgvqsgvp874mdwb2rpw0k.png" />
<br />

Нажимаем на кнопку `Try Connection` для проверки соединения.

Нажимаем на кнопку `Authorize ВАШЕ_ИМЯ`.

<img src="https://habrastorage.org/webt/8d/jv/g9/8djvg9lxanbqkuy67y757ll2l8q.png" />
<br />

Получаем сообщение о том, что соединение работает:

<img src="https://habrastorage.org/webt/mq/ze/lh/mqzelh57zqadbvfqma5eeaemxos.png" />
<br />

Теперь если мы нажмем `Log In` в приложении, то увидим, что у нас появилась возможность авторизоваться через `GitHub`:

<img src="https://habrastorage.org/webt/y8/pw/aw/y8pwaw6qmfzxoozjllx5qqh0zt8.png" />
<br />

Что касается `Google`, то `Auth0` предоставляет тестовые ключи, которые должны быть заменены настоящими перед выпуском приложения в продакшн.

Займемся страницей `MessagePage` и сервером.

## Интеграция клиента с сервером

__API__

Начнем с `API` (`api/messages.ts`):

```js
// адрес сервера
const SERVER_URI = process.env.REACT_APP_SERVER_URI

// сервис для получения открытого сообщения
export async function getPublicMessage() {
 let data = { message: '' }
 try {
   const response = await fetch(`${SERVER_URI}/messages/public`)
   if (!response.ok) throw response
   data = await response.json()
 } catch (e) {
   throw e
 } finally {
   return data.message
 }
}

// сервис для получения защищенного сообщения
// функция принимает `access_token/токен доступа`
export async function getProtectedMessage(token: string) {
 let data = { message: '' }
 try {
   const response = await fetch(`${SERVER_URI}/messages/protected`, {
     headers: {
       // добавляем заголовок авторизации с токеном
       Authorization: `Bearer ${token}`
     }
   })
   if (!response.ok) throw response
   data = await response.json()
 } catch (e) {
   throw e
 } finally {
   return data.message
 }
}
```

Страница `MessagePage` (`pages/MessagePage/MessagePage.tsx`).

Импортируем хуки, компонент, провайдер, сервисы и стили:

```js
import { useAuth0 } from '@auth0/auth0-react'
import { getProtectedMessage, getPublicMessage } from 'api/messages'
import { Boundary } from 'components/Boundary/Boundary'
import { useAppSetter } from 'providers/AppProvider'
import { useState } from 'react'
import './message.scss'
```

Получаем сеттеры, определяем состояние для сообщения и его типа:

```js
export const MessagePage = () => {
 const { setLoading, setError } = useAppSetter()
 const [message, setMessage] = useState('')
 const [type, setType] = useState('')

 // TODO
}
```

Для генерации токена доступа (`access_token`) предназначен метод `getAccessTokenSilently`, возвращаемый хуком `useAuth0`:

```js
const { getAccessTokenSilently } = useAuth0()
```

Определяем функцию для запроса открытого сообщения:

```js
function onGetPublicMessage() {
   setLoading(true)
   getPublicMessage()
     .then(setMessage)
     .catch(setError)
     .finally(() => {
       setType('public')
       setLoading(false)
     })
 }
```

Определяем функцию для получения защищенного сообщения:

```js
function onGetProtectedMessage() {
   setLoading(true)
   // генерируем токен и передаем его сервису `getProtectedMessage`
   getAccessTokenSilently()
     .then(getProtectedMessage)
     .then(setMessage)
     .catch(setError)
     .finally(() => {
       setType('protected')
       setLoading(false)
     })
 }
```

Наконец, возвращаем разметку:

```js
return (
 <Boundary>
   <h1>Message Page</h1>
   <div className='message'>
     <button onClick={onGetPublicMessage}>Get Public Message</button>
     <button onClick={onGetProtectedMessage}>Get Protected Message</button>
     {message && <h2 className={type}>{message}</h2>}
   </div>
 </Boundary>
)
```

__Сервер__

Переходим в директорию `server` и устанавливаем зависимости:

```bash
# зависимости для продакшна
yarn add express helmet cors dotenv express-jwt jwks-rsa
# зависимости для разработки
yarn add -D nodemon
```

- [`express`](https://expressjs.com/ru/): `Node.js-фреймворк` для разработки веб-серверов;
- [`helmet`](https://www.npmjs.com/package/helmet): утилита для установки `HTTP-заголовков`, связанных с безопасностью. Об этих заголовках можно почитать [здесь](https://github.com/harryheman/React-Total/blob/main/md/security/security.md);
- [`cors`](https://www.npmjs.com/package/cors): утилита для установки `HTTP-заголовков`, связанных с [`CORS`](https://developer.mozilla.org/ru/docs/Web/HTTP/CORS);
- [`dotenv`](https://www.npmjs.com/package/dotenv): утилита для работы с переменными среды окружения;
- [`express-jwt`](https://www.npmjs.com/package/express-jwt): `посредник/middleware` для валидации `JWT` через модуль [`jsonwebtoken`](https://github.com/auth0/node-jsonwebtoken/);
- [`jwks-rsa`](https://www.npmjs.com/package/jwks-rsa): утилита для извлечения `ключей подписания/signing keys` из `JWKS` (JSON Web Key Set/набор веб-ключей в формате `JSON`);
- [`nodemon`](https://www.npmjs.com/package/nodemon): утилита для запуска сервера для разработки.

О том, что такое `JWKS` и для чего он используется, можно почитать [здесь](https://auth0.com/docs/security/tokens/json-web-tokens/json-web-key-sets).

Пример интеграции `jwks-rsa` с `express-jwt` можно найти [здесь](https://github.com/auth0/node-jwks-rsa/tree/61b5740b3846f74fa6d631be6712405700d9c163/examples/express-demo).

Структура сервера:

```
- routes
 - api.routes.js
 - messages.routes.js
- utils
 - checkJwt.js
- .env
- index.js
- ...
```

Здесь нас интересуют 2 файла: `messages.routes.js` и `checkJwt.js`.

`messages.routes.js`:

```js
import { Router } from 'express'
import { checkJwt } from '../utils/checkJwt.js'

const router = Router()

router.get('/public', (req, res) => {
 res.status(200).json({ message: 'Public message' })
})

router.get('/protected', checkJwt, (req, res) => {
 res.status(200).json({ message: 'Protected message' })
})

export default router
```

При запросе к `api/messages/public` возвращается сообщение `Public message`. При запросе к `api/messages/protected` выполняется проверка `JWT`. Данный маршрут (роут) является защищенным. Когда проверка прошла успешно, возвращается сообщение `Protected message`. В противном случае, утилита возвращает ошибку.

Рассмотрим этого посредника (`utils/checkJwt.js`).

Импортируем утилиты:

```js
import jwt from 'express-jwt'
import jwksRsa from 'jwks-rsa'
import dotenv from 'dotenv'
```

Получаем доступ к переменным среды окружения, хранящимся в файле `.env`, и извлекаем их значения:

```js
dotenv.config()

const domain = process.env.AUTH0_DOMAIN
const audience = process.env.AUTH0_AUDIENCE
```

`audience` - простыми словами, это аудитория токена, т.е. те, для кого предназначен токен.

Определяем утилиту:

```js
export const checkJwt = jwt({
 secret: jwksRsa.expressJwtSecret({
   cache: true,
   // ограничение максимального количества запросов
   rateLimit: true,
   // 10 запросов в минуту
   jwksRequestsPerMinute: 10,
   // обратите внимание на сигнатуру пути
   jwksUri: `https://${domain}/.well-known/jwks.json`
 }),
 // аудитория
 audience,
 // тот, кто подписал токен
 issuer: `https://${domain}/`,
 // алгоритм, использованный для подписания токена
 algorithms: ['RS256']
})
```

Определяем тип кода сервера (модуль) и команды для запуска сервера в режиме для разработки и в производственном режиме в `package.json`:

```json
"type": "module",
"scripts": {
 "start": "node index.js",
 "dev": "nodemon index.js"
}
```

Запускаем сервер для разработки с помощью команды `yarn dev` или `npm run dev` и возвращаемся в браузер.

Выходим из системы. Переходим на страницу `MessagePage` и пытаемся получить открытое сообщение:

<img src="https://habrastorage.org/webt/gh/lp/oq/ghlpoqtwx920dagspr0rosnkqqk.png" />
<br />

Работает.

Теперь пробуем получить защищенное сообщение:

<img src="https://habrastorage.org/webt/7w/95/tc/7w95tcucx8yulctvu0xrnuh9sno.png" />
<br />

Получаем сообщение об ошибке, которое говорит о необходимости авторизации.

Авторизуемся и пробуем снова:

<img src="https://habrastorage.org/webt/bi/vt/qz/bivtqzqyhxthnii0f5vtchcgyhq.png" />
<br />

Получилось!

Кажется, что наш сервис аутентификации/авторизации работает, как ожидается.

Согласитесь, что `Auth0` существенно облегчает выполнение нетривиальной задачи по разработке сервиса аутентификации/авторизации веб-приложения.

The End.