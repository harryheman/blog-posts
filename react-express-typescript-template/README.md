# `React + Express + TypeScript` Template :metal:

Let's build [`React.js`](https://ru.reactjs.org/) + [`Express.js`](https://expressjs.com/ru/) + [`TypeScript`](https://www.typescriptlang.org/) app template/boilerplate.

Обоснование используемых технологий (сугубо личное мнение, которое не обязательно должно совпадать с вашим):

- `React` - далеко не идеальный, но лучший на сегодняшний день фреймворк для фронтенда (или, согласно официальной документации, "для создания пользовательских интерфейсов");
- `Express` - несмотря на наличие большого количества альтернативных решений, по-прежнему лучший `Node.js-фреймворк` для разработки веб-серверов;
- `TypeScript` - система типов для `JavaScript` (и еще кое-что), фактический стандарт современной веб-разработки.

[Исходный код проекта](https://github.com/harryheman/react-express-typescript-template).

Если вам это интересно, прошу под кат.
<cut />

[Здесь](https://github.com/harryheman/React-Total/blob/main/md/express-api.md) вы найдете шпаргалку по `Express API`, а [здесь](https://typescript-handbook.ru/) - Карманную книгу по `TypeScript` в формате [`PWA`](https://ru.wikipedia.org/wiki/%D0%9F%D1%80%D0%BE%D0%B3%D1%80%D0%B5%D1%81%D1%81%D0%B8%D0%B2%D0%BD%D0%BE%D0%B5_%D0%B2%D0%B5%D0%B1-%D0%BF%D1%80%D0%B8%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5).

Несмотря на то, что в мире сборщиков модулей доминирующее положение по-прежнему занимает [`Webpack`](https://webpack.js.org/), для сборки `React-приложения`, мы будем использовать [`Snowpack`](https://www.snowpack.dev/). Он не такой кастомизируемый, зато проще в настройке и быстрее как при запуске и перезапуске сервера для разработки, так и при сборке проекта.

Для установки зависимостей и выполнения команд я буду использовать [`Yarn`](https://yarnpkg.com/). Установить его можно так:

```bash
npm i -g yarn
```

Наши сервисы (имеется в виду клиент и сервер) будут полностью автономными, но, вместе с тем, они будут иметь доступ к общим типам.

Функционал нашего приложения будет следующим:

- клиент может отправить серверу либо неправильное сообщение, либо правильное;
- сервер проверяет сообщение, полученное от клиента, и если оно правильное, отправляет приветствие в ответ;
- если сообщение от клиента неправильное, сервер возвращает сообщение об ошибке.

Структурно сообщение будет состоять из заголовка (`title`) и тела (`body`). Синоним типа (type alias) сообщения будет общим для клиента и сервера.

Рекомендую вкратце ознакомиться с [`флагами tsc`](https://www.typescriptlang.org/docs/handbook/compiler-options.html) (`CLI` для сборки `TS-проектов`) и [`настройками tsconfig.json`](https://www.typescriptlang.org/tsconfig).

## Подготовка и настройка проекта

Создаем новую директорию, переходим в нее и инициализируем `Node.js-проект`:

```bash
# ret - react + express + typescript
mkdir ret-template
cd ret-template # cd !$

# -y | --yes - пропускаем вопросы о структуре и назначении проекта
# -p | --private - частный/закрытый проект (не для публикации в реестре npm, не является библиотекой)
yarn init -yp
```

На верхнем уровне нам потребуется две зависимости:

```bash
yarn add concurrently
# -D | --save-dev - зависимость для разработки
yarn add -D typescript
```

- [`concurrently`](https://www.npmjs.com/package/concurrently) - утилита, позволяющая одновременно выполнять несколько команд, определенных в `package.json`
- [`typescript`](https://www.npmjs.com/package/typescript) - компилятор `TypeScript`

Общими командами для запуска серверов мы займемся чуть позже.

Создаем директорию `shared`, в которой будут храниться общие типы, а также файлы `index.d.ts` и `tsconfig.json`:

```bash
mkdir shared
cd shared

touch index.d.ts
touch tsconfig.json
```

Файлы с расширением `d.ts` - это так называемые [файлы деклараций](https://en.wikipedia.org/wiki/TypeScript#Declaration_files). Их основное отличие от обычных `TS-файлов` (с расширением `ts`) состоит в том, что декларации могут содержать только объявления типов (но не выполняемый код), и не компилируются в `JS`. Если мы создадим файл `types.ts`, то после компиляции получим файл `types.js` с `export {}` внутри. Нам это ни к чему.

Наличие файла `tsconfig.json` в директории сообщает компилятору, что он имеет дело с `TS-проектом`.

Определяем общий синоним типа сообщения в `index.d.ts`:

```javascript
export type Message = {
 title: string
 body: string
}
```

Типы в декларациях часто объявляются с помощью ключевого слова [`declare`](https://www.typescriptlang.org/docs/handbook/declaration-files/by-example.html), но в нашем случае это не имеет принципиального значения.

Определяем единственную настройку в `tsconfig.json`:

```javascript
{
 "compilerOptions": {
   "composite": true
 }
}
```

[Эта настройка](https://www.typescriptlang.org/docs/handbook/project-references.html#composite) сообщает `TypeScript`, что данный проект является частью другого проекта.

Создаем файл `.gitignore` следующего содержания:

```bash
node_modules
# настройки, вместо переменных среды окружения (.env)
config
# директория сборки
build
yarn-error.log*

.snowpack
# mac
.DS_Store
```

Осталось определить команды для запуска проекта в режиме для разработки и производственном режиме. Режим для разработки предполагает запуск 2 серверов для разработки: одного для клиента и еще одного для сервера. Производственный режим предполагает сборку клиента, сборку сервера и запуск сервера (сборка клиента будет обслуживаться сервером в качестве директории со статическими файлами). Поэтому для определения названных команд придется сначала разобраться с клиентом и сервером.

## Клиент

Создаем шаблон `React + TypeScript-приложения` с помощью [`create-snowpack-app`](https://github.com/withastro/snowpack/blob/main/create-snowpack-app/cli/README.md):

```bash
# client - название проекта
# --template @snowpack/app-template-react-typescript - название используемого шаблона
# --use-yarn - использовать yarn вместо npm для установки зависимостей
yarn create snowpack-app client --template @snowpack/app-template-react-typescript --use-yarn
```

Переходим в созданную директорию (`cd client`) и приводим ее к такой структуре:

```
- public
 - index.html
 - favicon.ico
- src
 - api
   - index.ts
 - config
   - index.ts
 - App.scss
 - App.tsx
 - index.tsx
- types
 - static.d.ts
- .prettierrc
- package.json
- snowpack.config.mjs
- tsconfig.json
```

Отредактируем несколько файлов. Начнем с `.prettierrc`:

```json
{
 "singleQuote": true,
 "trailingComma": "none",
 "jsxSingleQuote": true,
 "semi": false
}
```

Разбираемся с зависимостями в `package.json`:

```json
{
 "scripts": {
   "start": "snowpack dev",
   "build": "snowpack build",
   "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx}\"",
   "lint": "prettier --check \"src/**/*.{js,jsx,ts,tsx}\""
 },
 "dependencies": {
   "react": "^17.0.2",
   "react-dom": "^17.0.2"
 },
 "devDependencies": {
   "@snowpack/plugin-react-refresh": "^2.5.0",
   "@snowpack/plugin-sass": "^1.4.0",
   "@snowpack/plugin-typescript": "^1.2.1",
   "@types/react": "^17.0.4",
   "@types/react-dom": "^17.0.3",
   "@types/snowpack-env": "^2.3.4",
   "prettier": "^2.2.1",
   "snowpack": "^3.3.7",
   "typescript": "^4.5.2"
 }
}
```

Выполняем команду `yarn` для переустановки зависимостей.

Редактируем настройки в `tsconfig.json`:

```json
{
 "compilerOptions": {
   "allowJs": true,
   "esModuleInterop": true,
   "forceConsistentCasingInFileNames": true,
   "jsx": "preserve",
   "module": "esnext",
   "moduleResolution": "node",
   "noEmit": true,
   "resolveJsonModule": true,
   "skipLibCheck": true,
   "strict": true
 },
 "include": [
   "src",
   "types"
 ],
 "references": [
   {
     "path": "../shared"
   }
 ]
}
```

Здесь:

- `"noEmit": true` означает, что `TS` в проекте используется только для проверки типов (type checking). Это объясняется тем, что компиляция кода в `JS` выполняется `snowpack`;
- этим же объясняется настройка `"jsx": "preserve"`, которая означает, что `TS` оставляет [`JSX`](https://ru.reactjs.org/docs/introducing-jsx.html) как есть;
- этим же объясняется отсутствие настройки `target` (эта настройка содержится в `snowpack.config.mjs`);
- `references` позволяет указать ссылку на другой `TS-проект`. В нашем случае этим "проектом" является директория `shared` с общим типом сообщения.

Редактируем настройки в `snowpack.config.mjs`:

```javascript
/** @type {import("snowpack").SnowpackUserConfig } */
export default {
 mount: {
   public: { url: '/', static: true },
   src: { url: '/dist' }
 },
 plugins: [
   '@snowpack/plugin-react-refresh',
   // здесь был плагин для переменных среды окружения,
   // но с TS они работают очень плохо

   // добавляем плагин для sass, опционально (можете использовать чистый CSS)
   '@snowpack/plugin-sass',
   [
     '@snowpack/plugin-typescript',
     {
       ...(process.versions.pnp ? { tsc: 'yarn pnpify tsc' } : {})
     }
   ]
 ],
 // оптимизация сборки для продакшна
 optimize: {
   bundle: true,
   minify: true,
   treeshake: true,
   // компиляция TS в JS двухлетней давности
   target: 'es2019'
 },
 // удаление директории со старой сборкой перед созданием новой сборки
 // может негативно сказаться на производительности в больших проектах
 buildOptions: {
   clean: true
 }
}
```

Определяем адрес сервера в файле с настройками (`config/index.ts`):

```javascript
export const SERVER_URI = 'http://localhost:4000/api'
```

Определяем `API` для клиента в файле `api/index.ts`:

```javascript
// адрес сервера
import { SERVER_URI } from '../config'
// общий тип сообщения
import { Message } from '../../../shared'

// общие настройки запроса
const commonOptions = {
 method: 'POST',
 headers: {
   'Content-Type': 'application/json'
 }
}

// функция отправки неправильного сообщения
const sendWrongMessage = async () => {
 const options = {
   ...commonOptions,
   body: JSON.stringify({
     title: 'Message from client',
     // как самонадеянно
     body: 'I know JavaScript'
   })
 }

 try {
   const response = await fetch(SERVER_URI, options)
   if (!response.ok) throw response
   const data = await response.json()
   if (data?.message) {
     // это называется утверждением типа (type assertion)
     // при использовании JSX возможен только такой способ
     return data.message as Message
   }
 } catch (e: any) {
   if (e.status === 400) {
     // сообщение об ошибке
     const data = await e.json()
     throw data
   }
   throw e
 }
}

// функция отправки правильного сообщения
const sendRightMessage = async () => {
 const options = {
   ...commonOptions,
   body: JSON.stringify({
     title: 'Message from client',
     body: 'Hello from client!'
   })
 }

 try {
   const response = await fetch(SERVER_URI, options)
   if (!response.ok) throw response
   const data = await response.json()
   if (data?.message) {
     // !
     return data.message as Message
   }
 } catch (e) {
   throw e
 }
}

export default { sendWrongMessage, sendRightMessage }
```

Наконец, само приложение (`App.tsx`):

```javascript
import './App.scss'
import React, { useState } from 'react'
// API
import messageApi from './api'
// общий тип сообщения
import { Message } from '../../shared'

function App() {
 // состояние сообщения
 const [message, setMessage] = useState<Message | undefined>()
 // состояние ошибки
 const [error, setError] = useState<any>(null)

 // метод для отправки неправильного сообщения
 const sendWrongMessage = () => {
   // обнуляем приветствие от сервера
   setMessage(undefined)

   messageApi.sendWrongMessage().then(setMessage).catch(setError)
 }

 const sendRightMessage = () => {
   // обнуляем сообщение об ошибке
   setError(null)

   messageApi.sendRightMessage().then(setMessage).catch(setError)
 }

 return (
   <>
     <header>
       <h1>React + Express + TypeScript Template</h1>
     </header>
     <main>
       <div>
         <button onClick={sendWrongMessage} className='wrong-message'>
           Send wrong message
         </button>
         <button onClick={sendRightMessage} className='right-message'>
           Send right message
         </button>
         {/* onClick={window.location.reload} не будет работать из-за того, что this потеряет контекст, т.е. window.location */}
         <button onClick={() => window.location.reload()}>Reload window</button>
       </div>
       {/* блок для приветствия от сервера */}
       {message && (
         <div className='message-container'>
           <h2>{message.title}</h2>
           <p>{message.body}</p>
         </div>
       )}
       {/* блок для сообщения об ошибке */}
       {error && <p className='error-message'>{error.message}</p>}
     </main>
     <footer>
       <p>&copy; 2021. Not all rights reserved</p>
     </footer>
   </>
 )
}

export default App
```

Запускаем клиента в режиме для разработки с помощью команды `yarn start`.

<img src="https://habrastorage.org/webt/pj/2d/oh/pj2dohcqilkny3un_auypulh_xu.png" />
<br />

При попытке отправить любое сообщение, получаем ошибку `Failed to fetch`.

<img src="https://habrastorage.org/webt/la/le/hp/lalehpg-enjks3ubgptymcfg6t4.png" />
<br />

Логично, ведь у нас еще нет сервера. Давайте это исправим.

## Сервер

Создаем новую директорию, переходим в нее и инициализируем `Node.js-проект`:

```bash
mkdir server
cd server

yarn init -yp
```

Устанавливаем основные зависимости:

```bash
yarn add express helmet cors concurrently cross-env
```

- [`helmet`](https://www.npmjs.com/package/helmet) - утилита для установки HTTP-заголовков, связанных с безопасностью
- [`cors`](https://www.npmjs.com/package/cors) - утилита для установки HTTP-заголовков, связанных с [`CORS`](https://developer.mozilla.org/ru/docs/Web/HTTP/CORS)
- [`cross-env`](https://www.npmjs.com/package/cross-env) - утилита для платформонезависимой передачи переменных среды окружения (`process.env`)

Устанавливаем зависимости для разработки:

```bash
yarn add -D typescript nodemon @types/cors @types/express @types/helmet @types/node
```

- [`@types`](https://github.com/DefinitelyTyped/DefinitelyTyped) - типы для соответствующих утилит и `Node.js`
- [`nodemon`](https://www.npmjs.com/package/nodemon) - утилита для запуска сервера для разработки

Структура сервера:

```
- src
  - config
    - index.ts
  - middleware
    - verifyAndCreateMessage.ts
  - routes
    - api.routes.ts
  - services
    - api.services.ts
  - types
    - index.d.ts
  - utils
    onError.ts
- index.ts
- package.json
- tsconfig.json
```

Начнем с редактирования настроек в `tsconfig.json`:

```json
{
 "compilerOptions": {
   "allowJs": true,
   "esModuleInterop": true,
   "forceConsistentCasingInFileNames": true,
   "module": "esnext",
   "moduleResolution": "node",
   "outDir": "./build",
   "rootDir": "./src",
   "skipLibCheck": true,
   "strict": true,
   "target": "es2019"
 },
 "references": [
   {
     "path": "../shared"
   }
 ]
}
```

Здесь:

- `"target": "es2019"` - в отличие от клиента, код сервера компилируется в `JS` с помощью `tsc`
- `rootDir` - корневая директория для предотвращения лишней вложенности сборки
- `outDir` - название директории сборки
- `references` - ссылка на общие типы

Код сервера (`src/index.ts`):

```javascript
// библиотеки и утилиты
import cors from 'cors'
import express, { json, urlencoded } from 'express'
import helmet from 'helmet'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
// настройки
import { developmentConfig, productionConfig } from './config/index.js'
// роуты
import apiRoutes from './routes/api.routes.js'
// обработчик ошибок
import onError from './utils/onError.js'

// путь к текущей директории
const __dirname = dirname(fileURLToPath(import.meta.url))

// определяем режим
const isProduction = process.env.NODE_ENV === 'production'

// выбираем настройки
let config
if (isProduction) {
 config = productionConfig
} else {
 config = developmentConfig
}

// создаем экземпляр приложения
const app = express()

// устанавливаем заголовки, связанные с безопасностью
app.use(helmet())
// устанавливаем заголовки, связанные с CORS
app.use(
 cors({
   // сервер будет обрабатывать запросы только из разрешенного источника
   origin: config.allowedOrigin
 })
)
// преобразование тела запроса из JSON в обычный объект
app.use(json())
// разбор параметров строки запроса
app.use(urlencoded({ extended: true }))
// если сервер запущен в производственном режиме,
// сборка клиента обслуживается в качестве директории со статическими файлами
if (isProduction) {
 app.use(express.static(join(__dirname, '../../client/build')))
}

// роуты
app.use('/api', apiRoutes)
// роут not found
app.use('*', (req, res) => {
 res.status(404).json({ message: 'Page not found' })
})
// обработчик ошибок
app.use(onError)

// запуск сервера
app.listen(config.port, () => {
 console.log('🚀 Server ready to handle requests')
})
```

_Обратите внимание_: импортируемые файлы имеют расширение `js`, а не `ts`.

Взглянем на типы (`types/index.d.ts`):

```javascript
import { Request, Response, NextFunction } from 'express'

export type Route = (req: Request, res: Response, next: NextFunction) => void
```

И на настройки (`config/index.ts`):

```javascript
export const developmentConfig = {
 port: 4000,
 allowedOrigin: 'http://localhost:8080'
}

export const productionConfig = {
 port: 4000,
 allowedOrigin: 'http://localhost:4000'
}
```

Утилита (`utils/onError.ts`):

```javascript
import { ErrorRequestHandler } from 'express'

const onError: ErrorRequestHandler = (err, req, res, next) => {
 console.log(err)
 const status = err.status || 500
 const message = err.message || 'Something went wrong. Try again later'
 res.status(status).json({ message })
}

export default onError
```

Роутер (`routes/api.routes.ts`):

```javascript
import { Router } from 'express'
// посредник, промежуточный слой
import { verifyAndCreateMessage } from '../middleware/verifyAndCreateMessage.js'
// сервис
import { sendMessage } from '../services/api.services.js'

const router = Router()

router.post('/', verifyAndCreateMessage, sendMessage)

export default router
```

Посредник (`middleware/verifyAndCreateMessage.ts`):

```javascript
// локальный тип
import { Route } from '../types'
// глобальный тип
import { Message } from '../../../shared'

export const verifyAndCreateMessage: Route = (req, res, next) => {
 // извлекаем сообщение из тела запроса
 // утверждение типа, альтернатива as Message
 const message = <Message>req.body
 // если сообщение отсутствует
 if (!message) {
   return res.status(400).json({ message: 'Message must be provided' })
 }
 // если тело сообщения включает слово "know"
 if (message.body.includes('know')) {
   // возвращаем сообщение об ошибке
   return res.status(400).json({ message: 'Nobody knows JavaScript' })
 }
 // создаем и записываем сообщение в res.locals
 res.locals.message = {
   title: 'Message from server',
   body: 'Hello from server!'
 }
 // передаем управление сервису
 next()
}
```

Сервис (`services/api.services.ts`):

```javascript
// локальный тип
import { Route } from '../types'

export const sendMessage: Route = (req, res, next) => {
 try {
   // извлекаем сообщение из res.locals
   const { message } = res.locals
   if (message) {
     res.status(200).json({ message })
   } else {
     res
       .status(404)
       .json({ message: 'There is no message for you, my friend' })
   }
 } catch (e) {
   next(e)
 }
}
```

В `package.json` нам необходимо определить 3 вещи: основной файл сервера, тип кода сервера и команды для запуска сервера в режиме для разработки и производственном режиме. Основной файл и тип:

```json
"main": "build/index.js",
"type": "module",
```

Команды для запуска сервера в режиме для разработки:

```json
"scripts": {
 "ts:watch": "tsc -w",
 "node:dev": "cross-env NODE_ENV=development nodemon",
 "start": "concurrently \"yarn ts:watch\" \"yarn node:dev\"",
}
```

`tsc` означает сборку проекта - компиляцию `TS` в `JS`. Сборка проекта приводит к генерации директории, указанной в `outDir`, т.е. `build`. Флаг `-w` или `--watch` означает наблюдение за изменениями файлов, находящихся в корневой директории проекта, указанной в `rootDir`, т.е. `src`.

Для одновременного выполнения команд `ts:watch` и `node:dev` используется `concurrently` (_обратите внимание_ на экранирование (`\"`), в `JSON` можно использовать только двойные кавычки). Вообще, для одновременного выполнения команд предназначен синтаксис `ts:watch & node:dev`, но это не работает в `Windows`.

Команда для запуска сервера в производственном режиме:

```json
"scripts": {
 ...,
 "build": "tsc --build && cross-env NODE_ENV=production node build/index.js"
}
```

Флаг [`--build`](https://www.typescriptlang.org/docs/handbook/project-references.html#build-mode-for-typescript) предназначен для выполнения инкрементальной сборки. Это означает, что повторно собираются только модифицированные файлы, что повышает скорость повторной сборки. `&&` означает последовательное выполнение команд. Для начала выполнения последующей команды необходимо завершение выполнения предыдущей команды. Поэтому при выполнении `tsc -w && nodemon`, например, выполнение команды `nodemon` никогда не начнется.

_Обратите внимание_: в данном случае расположение основного файла сервера должно быть определено в явном виде как `node build/index.js`.

## Проверка работоспособности

Поднимаемся на верхний уровень (`ret-template`) и определяем команды для запуска серверов в `package.json`:

```json
"scripts": {
 "start": "concurrently \"yarn --cwd client start\" \"yarn --cwd server start\"",
 "build": "yarn --cwd client build && yarn --cwd server build"
}
```

Флаг `--cwd` означает текущую рабочую директорию (current working directory). `yarn --cwd client start`, например, означает выполнение команды `start`, определенной в `package.json`, находящемся в директории `client`.

Выполняем команду `yarn start`.

<img src="https://habrastorage.org/webt/r5/b0/kx/r5b0kxrolib7diipkuub1eqabbw.png" />
<br />

По адресу `http://localhost:8080` автоматически открывается новая вкладка в браузере.

Отправляем неправильное сообщение.

<img src="https://habrastorage.org/webt/vt/o5/bd/vto5bd5knyjbe4bynifpl1rfm2o.png" />
<br />

Получаем сообщение об ошибке.

Отправляем правильное сообщение.

<img src="https://habrastorage.org/webt/ly/m9/rm/lym9rmrgrtsbqqhx68bk0t1jnwe.png" />
<br />

Получаем приветствие от сервера.

Изменение любого файла в директории `client` или `server`, кроме файлов с настройками `snowpack` и `tsc`, приводит к пересборке проекта.

<img src="https://habrastorage.org/webt/dl/k-/rn/dlk-rnxzkdin4livnqpprcrmmm4.png" />
<br />

Останавливаем сервера для разработки (`Ctrl + C` или `Cmd + C`).

Выполняем команду `yarn build`.

<img src="https://habrastorage.org/webt/bj/3w/87/bj3w87glwzw-6rrxaowqutknqrc.png" />
<br />

Получаем сообщения от `snowpack` об успешной сборке клиента (то, что `import.meta` будет пустой, нас не интересует), а также о готовности сервера обрабатывать запросы.

Переходим по адресу `http://localhost:4000`. Видим полностью работоспособное приложение, обслуживаемое сервером.

<img src="https://habrastorage.org/webt/pj/2d/oh/pj2dohcqilkny3un_auypulh_xu.png" />
<br />

The End.
