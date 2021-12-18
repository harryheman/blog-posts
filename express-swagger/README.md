# `Node.js`: документирование и визуализация `API` с помощью `Swagger`

В этой небольшой заметке я расскажу вам о том, как генерировать и визуализировать документацию к `API` с помощью [`Swagger`](https://swagger.io/).

Мы разработаем простой [`Express-сервер`](https://expressjs.com/), способный обрабатывать стандартные [`CRUD-запросы`](https://ru.wikipedia.org/wiki/CRUD), с фиктивной базой данных, реализованной с помощью [`lowdb`](https://github.com/typicode/lowdb).

Затем мы подробно опишем наше `API`, сгенерируем `JSON-файл` с описанием и визуализируем его.

Так, например, будет выглядеть описание `POST-запроса` к нашему `API`:

<img src="https://habrastorage.org/webt/yf/zq/e6/yfzqe6wifqlc7o4yyzykuwze6ta.png" />
<br />

## Подготовка и настройка проекта

Создаем директорию, переходим в нее и инициализируем `Node.js-проект`:

```bash
mkdir express-swagger
cd express-swagger

yarn init -yp
# or
npm init -y
```

Устанавливаем зависимости:

```bash
yarn add express lowdb cross-env nodemon
# or
npm i ...
```

- [`cross-env`](https://www.npmjs.com/package/cross-env) - утилита для платформонезависимой установки значений переменных среды окружения;
- [`nodemon`](https://www.npmjs.com/package/nodemon) - утилита для запуска сервера для разработки, который автоматически перезапускается при изменении файлов, за которыми ведется наблюдение.

Структура проекта:

```
- db
 - data.json - фиктивные данные
 - index.js - инициализация БД
- routes
 - todo.routes.js - роуты
- swagger - этой директорией мы займемся позже
- server.js - код сервера
```

Определяем тип сервера (модуль) и команды для его запуска в `package.json`:

```json
"type": "module",
"scripts": {
 "dev": "cross-env NODE_ENV=development nodemon server.js",
 "start": "cross-env NODE_ENV=production node server.js"
}
```

Команда `dev` запускает сервер для разработки, а `start` - для продакшна.

## База данных, роуты и сервер

Наши фиктивные данные будут выглядеть так (`db/data.json`):

```json
[
 {
   "id": "1",
   "text": "Eat",
   "done": true
 },
 {
   "id": "2",
   "text": "Code",
   "done": true
 },
 {
   "id": "3",
   "text": "Sleep",
   "done": true
 },
 {
   "id": "4",
   "text": "Repeat",
   "done": false
 }
]
```

Структура данных - массив объектов. Каждый объект состоит из идентификатора (строка), текста (строка) и индикатора выполнения (логическое значение) задачи.

Инициализация БД (`db/index.js`):

```javascript
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { Low, JSONFile } from 'lowdb'

// путь к текущей директории
const _dirname = dirname(fileURLToPath(import.meta.url))

// путь к файлу с фиктивными данными
const file = join(_dirname, 'data.json')

const adapter = new JSONFile(file)
const db = new Low(adapter)

export default db
```

Давайте определимся с архитектурой `API`.

Реализуем следующие конечные точки:

- GET `/` - получение всех задач
- GET `/:id` - получение определенной задачи по ее идентификатору. Запрос должен содержать параметр - `id` существующей задачи
- POST `/` - создание новой задачи. Тело запроса (`req.body`) должно содержать объект с текстом новой задачи (`{ text: 'test' }`)
- PUT `/:id` - обновление определенной задачи по ее идентификатору. Тело запроса должно содержать объект с изменениями (`{ changes: { done: true } }`). Запрос должен содержать параметр - `id` существующей задачи
- DELETE `/:id` - удаление определенной задачи по ее идентификатору. Запрос должен содержать параметр - `id` существующей задачи

Приступаем к реализации (`routes/todo.routes.js`):

```javascript
import { Router } from 'express'
import db from '../db/index.js'

const router = Router()

// роуты

export default router
```

_GET `/`_

```javascript
router.get('/', async (req, res, next) => {
 try {
   // инициализируем БД
   await db.read()

   if (db.data.length) {
     // отправляем данные клиенту
     res.status(200).json(db.data)
   } else {
     // сообщаем об отсутствии задач
     res.status(200).json({ message: 'There are no todos.' })
   }
 } catch (e) {
   // фиксируем локацию возникновения ошибки
   console.log('*** Get all todos')
   // передаем ошибку обработчику ошибок
   next(e)
 }
})
```

_GET `/:id`_

```javascript
router.get('/:id', async (req, res, next) => {
 // извлекаем id из параметров запроса
 const id = req.params.id

 try {
   await db.read()

   if (!db.data.length) {
     return res.status(400).json({ message: 'There are no todos' })
   }

   // ищем задачу с указанным id
   const todo = db.data.find((t) => t.id === id)

   // если не нашли
   if (!todo) {
     return res
       .status(400)
       .json({ message: 'There is no todo with provided ID' })
   }

   // если нашли
   res.status(200).json(todo)
 } catch (e) {
   console.log('*** Get todo by ID')
   next(e)
 }
})
```

_POST `/`_

```javascript
router.post('/', async (req, res, next) => {
 // извлекаем текст из тела запроса
 const text = req.body.text

 if (!text) {
   return res.status(400).json({ message: 'New todo text must be provided' })
 }

 try {
   await db.read()

   // создаем новую задачу
   const newTodo = {
     id: String(db.data.length + 1),
     text,
     done: false
   }

   // помещаем ее в массив
   db.data.push(newTodo)
   // фиксируем изменения
   await db.write()

   // возвращаем обновленный массив
   res.status(201).json(db.data)
 } catch (e) {
   console.log('*** Create todo')
   next(e)
 }
})
```

_PUT `/:id`_

```javascript
router.put('/:id', async (req, res, next) => {
 // извлекаем id Из параметров запроса
 const id = req.params.id

 if (!id) {
   return res
     .status(400)
     .json({ message: 'Existing todo ID must be provided' })
 }

 // извлекаем изменения из тела запроса
 const changes = req.body.changes

 if (!changes) {
   return res.status(400).json({ message: 'Changes must be provided' })
 }

 try {
   await db.read()

   // ищем задачу
   const todo = db.data.find((t) => t.id === id)

   // если не нашли
   if (!todo) {
     return res
       .status(400)
       .json({ message: 'There is no todo with provided ID' })
   }

   // обновляем задачу
   const updatedTodo = { ...todo, ...changes }

   // обновляем массив
   const newTodos = db.data.map((t) => (t.id === id ? updatedTodo : t))

   // перезаписываем массив
   db.data = newTodos
   // фиксируем изменения
   await db.write()

   res.status(201).json(db.data)
 } catch (e) {
   console.log('*** Update todo')
   next(e)
 }
})
```

_DELETE `/:id`_

```javascript
router.delete('/:id', async (req, res, next) => {
 // извлекаем id из параметров запроса
 const id = req.params.id

 if (!id) {
   return res
     .status(400)
     .json({ message: 'Existing todo ID must be provided' })
 }

 try {
   await db.read()

   const todo = db.data.find((t) => t.id === id)

   if (!todo) {
     return res
       .status(400)
       .json({ message: 'There is no todo with provided ID' })
   }

   // фильтруем массив
   const newTodos = db.data.filter((t) => t.id !== id)

   db.data = newTodos

   await db.write()

   res.status(201).json(db.data)
 } catch (e) {
   console.log('*** Remove todo')
   next(e)
 }
})
```

Сервер (`server.js`):

```javascript
import express from 'express'
import router from './routes/todo.routes.js'

// экземпляр Express-приложения
const app = express()

// парсинг JSON, содержащегося в теле запроса
app.use(express.json())
// обработка роутов
app.use('/todos', router)

app.get('*', (req, res) => {
 res.send('Only /todos endpoint is available.')
})

// обработка ошибок
app.use((err, req, res, next) => {
 console.log(err)
 const status = err.status || 500
 const message = err.message || 'Something went wrong. Try again later'
 res.status(status).json({ message })
})

// запуск сервера
app.listen(3000, () => {
 console.log('🚀 Server ready')
})
```

Запускаем сервер для разработки:

```bash
yarn dev
# or
npm run dev
```

<img src="https://habrastorage.org/webt/ca/3y/z5/ca3yz5i8l-nc5fmh8sbper-xpc8.png" />
<br />

Адрес нашего `API` - `http://localhost:3000/todos`

Проверяем работоспособность сервера. Для этого я воспользуюсь [`Postman`]().

_GET `/`_

<img src="https://habrastorage.org/webt/1z/xt/js/1zxtjszvlusuxg-mdm0rydigs9w.png" />
<br />

_GET `/:id`_

<img src="https://habrastorage.org/webt/u2/s4/kq/u2s4kq4x8rrlgqealamv-lpnjzw.png" />
<br />

_POST `/`_

<img src="https://habrastorage.org/webt/tu/yh/uj/tuyhuj6ihjtnjrojc3rn_xpvuww.png" />
<br />

_PUT `/:id`_

<img src="https://habrastorage.org/webt/nq/yq/h3/nqyqh3lwbpulnzza2w0hegbhmik.png" />
<br />

_DELETE `/:id`_

<img src="https://habrastorage.org/webt/cm/w1/jo/cmw1jo8nv6z3phdtbda9o2jbld4.png" />
<br />

Отлично. С этой задачей мы справились. Теперь сделаем работу с `API` доступной (и поэтому легкой) для любого пользователя посредством описания конечных точек, принимаемых параметров, тел запросов и возвращаемых ответов (частично мы это уже сделали при проектировании архитектуры `API`).

## Описание и визуализация `API`

Для генерации документации к `API` мы будем использовать библиотеку [`swagger-autogen`](https://www.npmjs.com/package/swagger-autogen), а для визуализации - [`swagger-ui-express`](https://www.npmjs.com/package/swagger-ui-express). Устанавливаем эти пакеты:

```bash
yarn add swagger-autogen swagger-ui-express
# or
npm i ...
```

Приступаем к реализации генерации описания (`swagger/index.js`):

```javascript
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import swaggerAutogen from 'swagger-autogen'

const _dirname = dirname(fileURLToPath(import.meta.url))

// const doc = ...

// путь и название генерируемого файла
const outputFile = join(_dirname, 'output.json')
// массив путей к роутерам
const endpointsFiles = [join(_dirname, '../server.js')]

swaggerAutogen(/*options*/)(outputFile, endpointsFiles, doc).then(({ success }) => {
 console.log(`Generated: ${success}`)
})
```

Документация генерируется на основе значения переменной `doc` и специальных комментариев в коде роутов.

Описываем `API` с помощью `doc`:

```javascript
const doc = {
 // общая информация
 info: {
   title: 'Todo API',
   description: 'My todo API'
 },
 // что-то типа моделей
 definitions: {
   // модель задачи
   Todo: {
     id: '1',
     text: 'test',
     done: false
   },
   // модель массива задач
   Todos: [
     {
       // ссылка на модель задачи
       $ref: '#/definitions/Todo'
     }
   ],
   // модель объекта с текстом новой задачи
   Text: {
     text: 'test'
   },
   // модель объекта с изменениями существующей задачи
   Changes: {
     changes: {
       text: 'test',
       done: true
     }
   }
 },
 host: 'localhost:3000',
 schemes: ['http']
}
```

Описываем роуты с помощью специальных комментариев.

_GET `/`_

```javascript
router.get('/', async (req, res, next) => {
 // описание роута
 // #swagger.description = 'Get all todos'
 // возвращаемый ответ
 /* #swagger.responses[200] = {
     // описание ответа
     description: 'Array of all todos',
     // схема ответа - ссылка на модель
     schema: { $ref: '#/definitions/Todos' }
 } */

 // код роута
})
```

_GET `/:id`_

```javascript
router.get('/:id', async (req, res, next) => {
 // #swagger.description = 'Get todo by ID'
 // параметр запроса
 /* #swagger.parameters['id'] = {
   // описание параметра
   description: 'Existing todo ID',
   // тип параметра
   type: 'string',
   // является ли параметр обязательным?
   required: true
 } */
 /* #swagger.responses[200] = {
     description: 'Todo with provided ID',
     schema: { $ref: '#/definitions/Todo' }
 } */

 //  код роута
})
```

_POST `/`_

```javascript
router.post('/', async (req, res, next) => {
 // #swagger.description = 'Create new todo'
 // тело запроса
 /* #swagger.parameters['text'] = {
   in: 'body',
   description: 'New todo text',
   type: 'object',
   required: true,
   schema: { $ref: '#/definitions/Text' }
 } */
 /* #swagger.responses[201] = {
     description: 'Array of new todos',
     schema: { $ref: '#/definitions/Todos' }
 } */

 // код роута
})
```

_PUT `/:id`_

```javascript
router.put('/:id', async (req, res, next) => {
 // #swagger.description = 'Update existing todo'
 /* #swagger.parameters['id'] = {
   description: 'Existing todo ID',
   type: 'string',
   required: true
 } */
 /* #swagger.parameters['changes'] = {
   in: 'body',
   description: 'Existing todo changes',
   type: 'object',
   required: true,
   schema: { $ref: '#/definitions/Changes' }
 } */
 /* #swagger.responses[201] = {
   description: 'Array of new todos',
   schema: { $ref: '#/definitions/Todos' }
 } */

 // код роута
})
```

_DELETE `/:id`_

```javascript
router.delete('/:id', async (req, res, next) => {
 // #swagger.description = 'Remove existing todo'
 /* #swagger.parameters['id'] = {
   description: 'Existing todo ID',
   type: 'string',
   required: true
 } */
 /* #swagger.responses[201] = {
   description: 'Array of new todos or empty array',
   schema: { $ref: '#/definitions/Todos' }
 } */

 // код роута
})
```

Это лишь небольшая часть возможностей по документированию `API`, предоставляемых `swagger-autogen`.

Добавляем в `package.json` команду для генерации документации:

```json
"gen": "node ./swagger/index.js"
```

Выполняем ее:

```bash
yarn gen
# or
npm run gen
```

Получаем файл `swagger/output.json` примерно такого содержания:

```json
{
 "swagger": "2.0",
 "info": {
   "title": "Todo API",
   "description": "My todo API",
   "version": "1.0.0"
 },
 "host": "localhost:3000",
 "basePath": "/",
 "schemes": [
   "http"
 ],
 "paths": {
   "/todos/": {
     "get": {
       "description": "Get all todos",
       "parameters": [],
       "responses": {
         "200": {
           "description": "Array of all todos",
           "schema": {
             "$ref": "#/definitions/Todos"
           }
         }
       }
     },
     // другие роуты
   }
 },
 "definitions": {
   "Todo": {
     "type": "object",
     "properties": {
       "id": {
         "type": "string",
         "example": "1"
       },
       "text": {
         "type": "string",
         "example": "test"
       },
       "done": {
         "type": "boolean",
         "example": false
       }
     }
   },
   // другие модели
 }
}
```

Круто. Но как нам это нарисовать? Легко.

Возвращаемся к коду сервера:

```javascript
import fs from 'fs'
import swaggerUi from 'swagger-ui-express'
```

Определяем путь к файлу с описанием `API`:

```javascript
const swaggerFile = JSON.parse(fs.readFileSync('./swagger/output.json'))
```

Определяем конечную точку `/api-doc`, при доступе к которой возвращается визуальное представление нашей документации:

```javascript
app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))
```

`swagger-ui-express` предоставляет широкие возможности по кастомизации визуального представления.

## Результат

На всякий случай перезапускаем сервер для разработки и переходим по адресу `http://localhost:3000/api-doc`.

_Общий вид_

<img src="https://habrastorage.org/webt/g8/u_/z0/g8u_z02uw8jq-hvenwj8hfhvdxg.png" />
<br />

_GET `/`_

<img src="https://habrastorage.org/webt/5-/ih/w-/5-ihw-vsqs-dotjmw0bjnlw1v-m.png" />
<br />

_GET `/:id`_

<img src="https://habrastorage.org/webt/kx/su/2k/kxsu2kzku5zapzhnzpoh-jvzjti.png" />
<br />

_POST `/`_

<img src="https://habrastorage.org/webt/g_/1g/ya/g_1gya-0zjerfxqq364rw_0pjbu.png" />
<br />

_PUT `/:id`_

<img src="https://habrastorage.org/webt/ro/b6/g8/rob6g8xpeo0v-_lcwv4tcb4c6wy.png" />
<br />

_DELETE `/:id`_

<img src="https://habrastorage.org/webt/a5/gb/k2/a5gbk2gunaegbu5rujbmnanep94.png" />
<br />

_Модели_

<img src="https://habrastorage.org/webt/uz/7a/5x/uz7a5xf7tlrqn7s5y37fm_bhxtc.png" />
<br />

The End.