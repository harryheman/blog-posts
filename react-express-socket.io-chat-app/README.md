# React + Express + Socket.io Chat App :metal:

Let's rock!

В данном туториале я покажу вам, как разработать простое приложение для обмена сообщениями в режиме реального времени с использованием [`Socket.io`](https://socket.io/), [`Express`](https://expressjs.com/ru/) и [`React`](https://ru.reactjs.org/) с акцентом на работе с медиа.

Функционал нашего приложения будет следующим:

- при первом запуске приложение предлагает пользователю ввести свое имя;
- имя пользователя и его идентификатор записываются в локальное хранилище;
- при повторном запуске приложения имя и идентификатор пользователя извлекаются из локального хранилища (имитация системы аутентификации/авторизации);
- выполняется подключение к серверу через [веб-сокеты](https://ru.wikipedia.org/wiki/WebSocket) и вход в комнату `main_room` (при желании можно легко реализовать возможность выбора или создания других комнат);
- пользователи обмениваются сообщениями в реальном времени;
- типом сообщения может быть текст, аудио, видео или изображение;
- передаваемые файлы сохраняются на сервере;
- путь к сохраненному на сервере файлу добавляется в сообщение;
- сообщение записывается в базу данных;
- пользователи могут записывать аудио и видеосообщения;
- после прикрепления файла и записи аудио или видео сообщения, отображается превью созданного контента;
- пользователи могут добавлять в текст сообщения эмодзи;
- текстовые сообщения могут озвучиваться;
- и т.д.

## Подготовка и настройка проекта

Создаем директорию, переходим в нее и инициализируем `Node.js-проект`:

```bash
mkdir chat-app
cd chat-app

yarn init -yp
# or
npm init -y
```

Создаем директорию для сервера и шаблон для клиента с помощью [`Create React App`](https://create-react-app.dev/):

```bash
mkdir server

yarn create react-app client
# or
npx create-react-app client
```

Нам потребуется одновременно запускать два сервера (для клиента и самого сервера), поэтому установим [`concurrently`](https://www.npmjs.com/package/concurrently) - утилиту для одновременного выполнения нескольких команд, определенных в файле `package.json`:

```bash
yarn add concurrently
# or
npm i concurrently
```

Определяем команды в `package.json`:

```javascripton
"scripts": {
  "dev:client": "yarn --cwd client start",
  "dev:server": "yarn --cwd server dev",
  "dev": "concurrently \"yarn dev:client\" \"yarn dev:server\""
}
```

Или, если вы используете `npm`:

```javascripton
"scripts": {
  "dev:client": "npm run start --prefix client",
  "dev:server": "npm run dev --prefix server",
  "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\""
}
```

В качестве БД мы будем использовать [`MongoDb Atlas Database`](https://www.mongodb.com/atlas/database).

Переходим по ссылке, создаем аккаунт, создаем проект и кластер и получаем строку для подключения вида `mongodb+srv://<user>:<password>@cluster0.f7292.mongodb.net/<database>?retryWrites=true&w=majority`*, где `<user>`, `<password>` и `<database>` - данные, которые вы указали при создании проекта и кластера.

* Для получения адреса БД необходимо нажать `Connect` рядом с названием кластера (`Cluster0`) и затем `Connect your application`.
* Если у вас, как и у меня, динамический [`IP`](https://ru.wikipedia.org/wiki/IP-%D0%B0%D0%B4%D1%80%D0%B5%D1%81), во вкладке `Network Access` раздела `Security` надо прописать `0.0.0.0/0`

<img src="https://habrastorage.org/webt/dt/56/vy/dt56vykt9oi9wwb6gpmsweqyfqu.png" />
<br />

<img src="https://habrastorage.org/webt/zn/ay/se/znayseg_h13wwcq3gbzofxkx3-a.png" />
<br />

Можно приступать к разработке сервера.

## Сервер

Переходим в директорию `server` и устанавливаем зависимости:

```bash
cd server

# производственные зависимости
yarn add express socket.io mongoose cors multer
# or
npm i ...

# зависимость для разработки
yarn add -D nodemon
# or
npm i -D nodemon
```

- `express` - `Node.js-фреймворк` для разработки веб-серверов;
- `socket.io` - библиотека, облегчающая работу с веб-сокетами;
- [`mongoose`](https://mongoosejs.com/) - [ORM](https://ru.wikipedia.org/wiki/ORM) для работы с `MongoDB`;
- [`cors`](https://www.npmjs.com/package/cors) - утилита для работы с [CORS](https://developer.mozilla.org/ru/docs/Web/HTTP/CORS);
- [`multer`](https://www.npmjs.com/package/multer) - утилита для разбора (парсинга) данных в формате [`multipart/form-data`](https://ru.wikipedia.org/wiki/Multipart/form-data) (для сохранения файлов на сервере);
- [`nodemon`](https://www.npmjs.com/package/nodemon) - утилита для запуска сервера для разработки.

Определяем тип кода сервера (модуль) и команду для запуска сервера для разработки в файле `package.json`:

```javascripton
"type": "module",
"scripts": {
  "dev": "nodemon"
}
```

Структура директории `server` будет следующей:

```
- files - директория для хранения файлов
- models
  - message.model.js - модель сообщения для `Mongoose`
- socket_io
  - handlers
    - message.handlers.js - обработчики для сообщений
    - user.handler.js - обработчики для пользователей
  - onConnection.js - обработка подключения
- utils
  - file.js - утилиты для работы с файлами
  - onError.js - обработчик ошибок
  - upload.js - утилита для сохранения файлов
- config.js - настройки (в репозитории имеется файл `config.example.js` с примером настроек)
- index.js - основной файл сервера
```

Определяем настройки в файле `config.js` (не забудьте добавить его в `.gitignore`):

```javascript
// разрешенный источник
export const ALLOWED_ORIGIN = 'http://localhost:3000'
// адрес БД
export const MONGODB_URI =
  'mongodb+srv://<user>:<password>@cluster0.f7292.mongodb.net/<database>?retryWrites=true&w=majority'
```

Определяем модель в файле `models/message.model.js`:

```javascript
import mongoose from 'mongoose'

const { Schema, model } = mongoose

const messageSchema = new Schema(
  {
    messageId: {
      type: String,
      required: true,
      unique: true
    },
    messageType: {
      type: String,
      required: true
    },
    textOrPathToFile: {
      type: String,
      required: true
    },
    roomId: {
      type: String,
      required: true
    },
    userId: {
      type: String,
      required: true
    },
    userName: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
)

export default model('Message', messageSchema)
```

Каждое наше сообщение будет включать следующую информацию:

- `messageId` - идентификатор сообщения;
- `messageType` - тип сообщения;
- `textOrPathToFile` - текст сообщения или путь к файлу;
- `roomId` - идентификатор комнаты;
- `userId` - идентификатор пользователя;
- `userName` - имя пользователя;
- `createdAt`, `updatedAt` - дата и время создания и обновления сообщения, соответственно (`timestamps: true`).

Кратко рассмотрим утилиты (директория `utils`).

Обработчик ошибок (`onError.js`):

```javascript
export default function onError(err, req, res, next) {
  console.log(err)

  // если имеется объект ответа
  if (res) {
    // статус ошибки
    const status = err.status || err.statusCode || 500
    // сообщение об ошибке
    const message = err.message || 'Something went wrong. Try again later'
    res.status(status).json({ message })
  }
}
```

Утилита для работы с файлами (`file.js`):

```javascript
import { unlink } from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import onError from './onError.js'

// путь к текущей директории
const _dirname = dirname(fileURLToPath(import.meta.url))

// путь к директории с файлами
const fileDir = join(_dirname, '../files')

// утилита для получения пути к файлу
export const getFilePath = (filePath) => join(fileDir, filePath)

// утилита для удаления файла
export const removeFile = async (filePath) => {
  try {
    await unlink(join(fileDir, filePath))
  } catch (e) {
    onError(e)
  }
}
```

Утилита для сохранения файлов (`upload.js`):

```javascript
import { existsSync, mkdirSync } from 'fs'
import multer from 'multer'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

// путь к текущей директории
const _dirname = dirname(fileURLToPath(import.meta.url))

const upload = multer({
  storage: multer.diskStorage({
    // директория для записи файлов
    destination: async (req, _, cb) => {
      // извлекаем идентификатор комнаты из HTTP-заголовка `X-Room-Id`
      const roomId = req.headers['x-room-id']
      // файлы хранятся по комнатам
      // название директории - идентификатор комнаты
      const dirPath = join(_dirname, '../files', roomId)

      // создаем директорию при отсутствии
      if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true })
      }

      cb(null, dirPath)
    },
    filename: (_, file, cb) => {
      // названия файлов могут быть одинаковыми
      // добавляем к названию время с начала эпохи и дефис
      const fileName = `${Date.now()}-${file.originalname}`

      cb(null, fileName)
    }
  })
})

export default upload
```

Рассмотрим основной файл сервера (`index.js`).

Импортируем все и вся:

```javascript
import cors from 'cors'
import express from 'express'
import { createServer } from 'http'
import mongoose from 'mongoose'
import { Server } from 'socket.io'
import { ALLOWED_ORIGIN, MONGODB_URI } from './config.js'
import onConnection from './socket_io/onConnection.js'
import { getFilePath } from './utils/file.js'
import onError from './utils/onError.js'
import upload from './utils/upload.js'
```

Создаем экземпляр `Express-приложения` и подключаем посредников для работы с `CORS` и парсинга `JSON`:

```javascript
const app = express()

app.use(
  cors({
    origin: ALLOWED_ORIGIN
  })
)
app.use(express.json())
```

Обрабатываем загрузку файлов:

```javascript
app.use('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.sendStatus(400)

  // формируем относительный путь к файлу
  const relativeFilePath = req.file.path
    .replace(/\\/g, '/')
    .split('server/files')[1]

  // и возвращаем его
  res.status(201).json(relativeFilePath)
})
```

Обрабатываем получение файлов:

```javascript
app.use('/files', (req, res) => {
  // формируем абсолютный путь к файлу
  const filePath = getFilePath(req.url)

  // и возвращаем файл по этому пути
  res.status(200).sendFile(filePath)
})
```

Добавляем обработчик ошибок и подключаемся к БД:

```javascript
app.use(onError)

try {
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  console.log('🚀 Connected')
} catch (e) {
  onError(e)
}
```

Создаем экземпляры сервера и `Socket.io` и обрабатываем подключение:

```javascript
const server = createServer(app)

const io = new Server(server, {
  cors: ALLOWED_ORIGIN,
  serveClient: false
})

io.on('connection', (socket) => {
  onConnection(io, socket)
})
```

Наконец, определяем порт и запускаем сервер:

```javascript
const PORT = process.env.PORT || 4000
server.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`)
})
```

<spoiler title="Полный код сервера:">

```javascript
import cors from 'cors'
import express from 'express'
import { createServer } from 'http'
import mongoose from 'mongoose'
import { Server } from 'socket.io'
import { ALLOWED_ORIGIN, MONGODB_URI } from './config.js'
import onConnection from './socket_io/onConnection.js'
import { getFilePath } from './utils/file.js'
import onError from './utils/onError.js'
import upload from './utils/upload.js'

const app = express()

app.use(
  cors({
    origin: ALLOWED_ORIGIN
  })
)
app.use(express.json())

app.use('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.sendStatus(400)

  const relativeFilePath = req.file.path
    .replace(/\\/g, '/')
    .split('server/files')[1]

  res.status(201).json(relativeFilePath)
})

app.use('/files', (req, res) => {
  const filePath = getFilePath(req.url)

  res.status(200).sendFile(filePath)
})

app.use(onError)

try {
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  console.log('🚀 Connected')
} catch (e) {
  onError(e)
}

const server = createServer(app)

const io = new Server(server, {
  cors: ALLOWED_ORIGIN,
  serveClient: false
})

io.on('connection', (socket) => {
  onConnection(io, socket)
})

const PORT = process.env.PORT || 4000
server.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`)
})
```

</spoiler>

Рассмотрим работу с сокетами (директория `socket_io`).

Обработка подключения (`onConnection.js`):

```javascript
import userHandlers from './handlers/user.handlers.js'
import messageHandlers from './handlers/message.handlers.js'

export default function onConnection(io, socket) {
  // извлекаем идентификатор комнаты и имя пользователя
  const { roomId, userName } = socket.handshake.query

  // записываем их в объект сокета
  socket.roomId = roomId
  socket.userName = userName

  // присоединяемся к комнате
  socket.join(roomId)

  // регистрируем обработчики для пользователей
  userHandlers(io, socket)

  // регистрируем обработчики для сообщений
  messageHandlers(io, socket)
}
```

Обработчики для пользователей (`handlers/user.handlers.js`):

```javascript
// "хранилище" пользователей
const users = {}

export default function userHandlers(io, socket) {
  // извлекаем идентификатор комнаты и имя пользователя из объекта сокета
  const { roomId, userName } = socket

  // инициализируем хранилище пользователей
  if (!users[roomId]) {
    users[roomId] = []
  }

  // утилита для обновления списка пользователей
  const updateUserList = () => {
    // сообщение получают только пользователи, находящиеся в комнате
    io.to(roomId).emit('user_list:update', users[roomId])
  }

  // обрабатываем подключение нового пользователя
  socket.on('user:add', async (user) => {
    // сообщаем другим пользователям об этом
    socket.to(roomId).emit('log', `User ${userName} connected`)

    // записываем идентификатор сокета пользователя
    user.socketId = socket.id

    // записываем пользователя в хранилище
    users[roomId].push(user)

    // обновляем список пользователей
    updateUserList()
  })

  // обрабатываем отключения пользователя
  socket.on('disconnect', () => {
    if (!users[roomId]) return

    // сообщаем об этом другим пользователям
    socket.to(roomId).emit('log', `User ${userName} disconnected`)

    // удаляем пользователя из хранилища
    users[roomId] = users[roomId].filter((u) => u.socketId !== socket.id)

    // обновляем список пользователей
    updateUserList()
  })
}
```

Обработчики для сообщений (`handlers/message.handlers.js`):

```javascript
import Message from '../../models/message.model.js'
import { removeFile } from '../../utils/file.js'
import onError from '../../utils/onError.js'

// "хранилище" для сообщений
const messages = {}

export default function messageHandlers(io, socket) {
  // извлекаем идентификатор комнаты
  const { roomId } = socket

  // утилита для обновления списка сообщений
  const updateMessageList = () => {
    io.to(roomId).emit('message_list:update', messages[roomId])
  }

  // обрабатываем получение сообщений
  socket.on('message:get', async () => {
    try {
      // получаем сообщения по `id` комнаты
      const _messages = await Message.find({
        roomId
      })
      // инициализируем хранилище сообщений
      messages[roomId] = _messages

      // обновляем список сообщений
      updateMessageList()
    } catch (e) {
      onError(e)
    }
  })

  // обрабатываем создание нового сообщения
  socket.on('message:add', (message) => {
    // пользователи не должны ждать записи сообщения в БД
    Message.create(message).catch(onError)

    // это нужно для клиента
    message.createdAt = Date.now()

    // создаем сообщение оптимистически,
    // т.е. предполагая, что запись сообщения в БД будет успешной
    messages[roomId].push(message)

    // обновляем список сообщений
    updateMessageList()
  })

  // обрабатываем удаление сообщения
  socket.on('message:remove', (message) => {
    const { messageId, messageType, textOrPathToFile } = message

    // пользователи не должны ждать удаления сообщения из БД
    // и файла на сервере (если сообщение является файлом)
    Message.deleteOne({ messageId })
      .then(() => {
        if (messageType !== 'text') {
          removeFile(textOrPathToFile)
        }
      })
      .catch(onError)

    // удаляем сообщение оптимистически
    messages[roomId] = messages[roomId].filter((m) => m.messageId !== messageId)

    // обновляем список сообщений
    updateMessageList()
  })
}
```

При реализации операций по созданию и удалению сообщения я исходил из предположения, что задержка в передаче данных является более критичной, чем неудачное сохранение или удаление сообщения из БД, поскольку речь идет о коммуникации в реальном времени. В идеале, хорошо иметь в БД отдельную таблицу для фиксации случаев неудачной записи/удаления сообщений.

Это все, что требуется от нашего сервера.

Переходим к реализации клиента.

## Клиент

Переходим в директорию `client` и устанавливаем зависимости:

```bash
cd client

# производственные зависимости
yarn add react-router-dom zustand react-icons emoji-mart react-speech-kit react-timeago socket.io-client nanoid
# or
npm i ...

# зависимость для разработки
yarn add -D sass
# or
npm i -D sass
```

- [react-router-dom](https://reactrouter.com/) - библиотека для маршрутизации на стороне клиента;
- [zustand](https://github.com/pmndrs/zustand) - библиотека для управления состоянием приложения;
- [react-icons](https://react-icons.github.io/react-icons/) - большой набор иконок в виде компонентов;
- [emoji-mart](https://github.com/missive/emoji-mart) - компонент с эмодзи;
- [react-speech-kit](https://github.com/MikeyParton/react-speech-kit) - обертка над [`Web Speech API`](https://developer.mozilla.org/ru/docs/Web/API/Web_Speech_API) для `react`;
- [react-timeago](https://github.com/nmn/react-timeago) - компонент для отображения относительного времени;
- [socket.io-client](https://www.npmjs.com/package/socket.io-client) - клиент `socket.io`;
- [nanoid](https://www.npmjs.com/package/nanoid) - утилита для генерации идентификаторов;
- [sass](https://sass-scss.ru/) - [препроцессор](https://developer.mozilla.org/ru/docs/Glossary/CSS_preprocessor) `CSS`.

Структура директории `src` будет следующей:

```
- api
  - file.api.js - интерфейс для загрузки файлов
- components
  - NameInput
    - NameInput.js - компонент для ввода имени пользователя
  - Room
    - MessageInput
      - EmojiMart
        - EmojiMart.js - компонент для эмодзи
      - FileInput
        - FileInput.js - компонент для выбора (прикрепления) файла для отправки
        - FilePreview.js - компонент для отображения превью файла
      - Recorder
        - Recorder.js - компонент для создания аудио или видеозаписи
        - RecordingModal.js - модальное окно для выбора типа и управления процессом записи
      - MessageInput.js - компонент для ввода сообщения пользователем, выбора эмодзи, прикрепления файла или создания аудио или видеозаписи
    - MessageList
      - MessageItem.js - компонент для одного сообщения
      - MessageList.js - компонент для списка сообщений
    - UserList
      - UserList - компонент для списка пользователей
    - Room.js - компонент для комнаты
  - index.js - повторный экспорт компонентов
- hooks
  - useChat.js - хук для работы с сокетами
  - useStore.js - хранилище состояния в форме хука
- pages
  - Home
    - Home.js - домашняя страница
  - index.js - повторный экспорт страниц
- routes
  - app.routes.js - роуты приложения
- styles - стили (я не буду на них останавливаться, просто скопируйте их из репозитория с исходным кодом проекта)
- utils
  - recording.js - утилиты для создания аудио или видеозаписи
  - storage.js - утилита для работы с локальным хранилищем
- App.js - основной компонент приложения
- App.scss - стили
- constants.js - константы
- index.js - основной файл клиента
```

Начнем с основного компонента приложения (`App.js`):

```javascript
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from 'routes/app.routes'
import './App.scss'

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
```

Подключаем роутер и рендерим роуты приложения.

Рассмотрим эти роуты (`routes/app.routes.js`):

```javascript
import { Home } from 'pages'
import { Route, Routes } from 'react-router-dom'

const AppRoutes = () => (
  <Routes>
    <Route path='*' element={<Home />} />
  </Routes>
)

export default AppRoutes
```

Все дороги, т.е. пути ведут в Рим, т.е. на главную страницу.

Зачем нам роутер, спросите вы. По большему счету, он нам не нужен, но предусматривать возможность масштабирования приложения считается хорошей практикой.

Взглянем на домашнюю страницу (`pages/Home/Home.js`):

```javascript
import { NameInput, Room } from 'components'
import { USER_KEY } from 'constants'
import storage from 'utils/storage'

export const Home = () => {
  const user = storage.get(USER_KEY)

  return user ? <Room /> : <NameInput />
}
```

Мы пытаемся извлечь данные пользователя из локального хранилища и, в зависимости от наличия таких данных, возвращаем компонент комнаты или инпут для ввода имени пользователя.

Утилита для работы с локальным хранилищем (`utils/storage.js`):

```javascript
const storage = {
  get: (key) =>
    window.localStorage.getItem(key)
      ? JSON.parse(window.localStorage.getItem(key))
      : null,
  set: (key, value) => window.localStorage.setItem(key, JSON.stringify(value))
}

export default storage
```

Константы (`constants.js`):

```javascript
export const USER_KEY = 'chat_app_user'
export const SERVER_URI = 'http://localhost:4000'
```

Займемся реализацией компонентов (`components`).

Компонент для ввода имени пользователя (`NameInput/NameInput.js`):

```javascript
// импорты
import { USER_KEY } from 'constants'
import { nanoid } from 'nanoid'
import { useEffect, useState } from 'react'
import storage from 'utils/storage'

export const NameInput = () => {
  // начальные данные
  const [formData, setFormData] = useState({
    userName: '',
    // фиксируем ("хардкодим") название (идентификатор) комнаты
    roomId: 'main_room'
  })
  // состояние блокировки кнопки
  const [submitDisabled, setSubmitDisabled] = useState(true)

  // все поля формы являются обязательными
  useEffect(() => {
    const isSomeFieldEmpty = Object.values(formData).some((v) => !v.trim())
    setSubmitDisabled(isSomeFieldEmpty)
  }, [formData])

  // функция для изменения данных
  const onChange = ({ target: { name, value } }) => {
    setFormData({ ...formData, [name]: value })
  }

  // функция для отправки формы
  const onSubmit = (e) => {
    e.preventDefault()
    if (submitDisabled) return

    // генерируем идентификатор пользователя
    const userId = nanoid()

    // записываем данные пользователя в локальное хранилище
    storage.set(USER_KEY, {
      userId,
      userName: formData.userName,
      roomId: formData.roomId
    })

    // перезагружаем приложение для того, чтобы "попасть" в комнату
    window.location.reload()
  }

  return (
    <div className='container name-input'>
      <h2>Welcome</h2>
      <form onSubmit={onSubmit} className='form name-room'>
        <div>
          <label htmlFor='userName'>Enter your name</label>
          <input
            type='text'
            id='userName'
            name='userName'
            minLength={2}
            required
            value={formData.userName}
            onChange={onChange}
          />
        </div>
        {/* скрываем поле для создания комнаты (возможность масштабирования) */}
        <div class='visually-hidden'>
          <label htmlFor='roomId'>Enter room ID</label>
          <input
            type='text'
            id='roomId'
            name='roomId'
            minLength={4}
            required
            value={formData.roomId}
            onChange={onChange}
          />
        </div>
        <button disabled={submitDisabled} className='btn chat'>
          Chat
        </button>
      </form>
    </div>
  )
}
```

Компонент комнаты (`Room/Room.js`):

```javascript
import useChat from 'hooks/useChat'
import MessageInput from './MessageInput/MessageInput'
import MessageList from './MessageList/MessageList'
import UserList from './UserList/UserList'

export const Room = () => {
  // получаем список пользователей, список сообщений, системную информацию и методы для отправки и удаления сообщения
  const { users, messages, log, sendMessage, removeMessage } = useChat()
  // и передаем их соответствующим компонентам
  return (
    <div className='container chat'>
      <div className='container message'>
        <MessageList
          log={log}
          messages={messages}
          removeMessage={removeMessage}
        />
        <MessageInput sendMessage={sendMessage} />
      </div>
      <UserList users={users} />
    </div>
  )
}
```

Рассмотрим хук для работы с сокетами (`hooks/useChat.js`):

```javascript
import { SERVER_URI, USER_KEY } from 'constants'
import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import storage from 'utils/storage'

export default function useChat() {
  // извлекаем данные пользователя из локального хранилища
  const user = storage.get(USER_KEY)
  // локальное состояние для списка пользователей
  const [users, setUsers] = useState([])
  // локальное состояние для списка сообщений
  const [messages, setMessages] = useState([])
  // состояние для системного сообщения
  const [log, setLog] = useState(null)
  // иммутабельное состояние для сокета
  const { current: socket } = useRef(
    io(SERVER_URI, {
      query: {
        // отправляем идентификатор комнаты и имя пользователя на сервер
        roomId: user.roomId,
        userName: user.userName
      }
    })
  )

  // регистрируем обработчики
  useEffect(() => {
    // сообщаем о подключении нового пользователя
    socket.emit('user:add', user)

    // запрашиваем сообщения из БД
    socket.emit('message:get')

    // обрабатываем получение системного сообщения
    socket.on('log', (log) => {
      setLog(log)
    })

    // обрабатываем получение обновленного списка пользователей
    socket.on('user_list:update', (users) => {
      setUsers(users)
    })

    // обрабатываем получение обновленного списка сообщений
    socket.on('message_list:update', (messages) => {
      setMessages(messages)
    })
  }, [])

  // метод для отправки сообщения
  const sendMessage = (message) => {
    socket.emit('message:add', message)
  }

  // метод для удаления сообщения
  const removeMessage = (message) => {
    socket.emit('message:remove', message)
  }

  return { users, messages, log, sendMessage, removeMessage }
}
```

Компонент для отображения списка пользователей (`UserList/UserList.js`):

```javascript
import { AiOutlineUser } from 'react-icons/ai'

export default function UserList({ users }) {
  return (
    <div className='container user'>
      <h2>Users</h2>
      <ul className='list user'>
        {users.map(({ userId, userName }) => (
          <li key={userId} className='item user'>
            <AiOutlineUser className='icon user' />
            {userName}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

Перебираем пользователей и рендерим список имен.

Компонент для отображения списка сообщений (`MessageList/MessageList.js`):

```javascript
import { useEffect, useRef } from 'react'
import MessageItem from './MessageItem'

export default function MessageList({ log, messages, removeMessage }) {
  // иммутабельная ссылка на элемент для отображения системных сообщений
  const logRef = useRef()
  // иммутабельная ссылка на конец списка сообщений
  const bottomRef = useRef()

  // выполняем прокрутку к концу списка при добавлении нового сообщения
  // это может стать проблемой при большом количестве пользователей,
  // когда участники чата не будут успевать читать сообщения
  useEffect(() => {
    bottomRef.current.scrollIntoView({
      behavior: 'smooth'
    })
  }, [messages])

  // отображаем и скрываем системные сообщения
  useEffect(() => {
    if (log) {
      logRef.current.style.opacity = 0.8
      logRef.current.style.zIndex = 1

      const timerId = setTimeout(() => {
        logRef.current.style.opacity = 0
        logRef.current.style.zIndex = -1

        clearTimeout(timerId)
      }, 1500)
    }
  }, [log])

  return (
    <div className='container message'>
      <h2>Messages</h2>
      <ul className='list message'>
        {/* перебираем список и рендерим сообщения */}
        {messages.map((message) => (
          <MessageItem
            key={message.messageId}
            message={message}
            removeMessage={removeMessage}
          />
        ))}

        <p ref={bottomRef}></p>

        <p ref={logRef} className='log'>
          {log}
        </p>
      </ul>
    </div>
  )
}
```

Компонент сообщения (`MessageList/MessageItem.js`):

```javascript
import { SERVER_URI, USER_KEY } from 'constants'
import { CgTrashEmpty } from 'react-icons/cg'
import { GiSpeaker } from 'react-icons/gi'
import { useSpeechSynthesis } from 'react-speech-kit'
import TimeAgo from 'react-timeago'
import storage from 'utils/storage'

export default function MessageItem({ message, removeMessage }) {
  // извлекаем данные пользователя из локального хранилища
  const user = storage.get(USER_KEY)
  // утилиты для перевода текста в речь
  const { speak, voices } = useSpeechSynthesis()
  // определяем язык приложения
  const lang = document.documentElement.lang || 'en'
  // мне нравится голос от гугла
  const voice = voices.find(
    (v) => v.lang.includes(lang) && v.name.includes('Google')
  )

  // элемент для рендеринга зависит от типа сообщения
  let element

  // извлекаем из сообщения тип и текст или путь к файлу
  const { messageType, textOrPathToFile } = message

  // формируем абсолютный путь к файлу
  const pathToFile = `${SERVER_URI}/files${textOrPathToFile}`

  // определяем элемент для рендеринга на основе типа сообщения
  switch (messageType) {
    case 'text':
      element = (
        <>
          <button
            className='btn'
            // озвучиваем текст при нажатии кнопки
            onClick={() => speak({ text: textOrPathToFile, voice })}
          >
            <GiSpeaker className='icon speak' />
          </button>
          <p>{textOrPathToFile}</p>
        </>
      )
      break
    case 'image':
      element = <img src={pathToFile} alt='' />
      break
    case 'audio':
      element = <audio src={pathToFile} controls></audio>
      break
    case 'video':
      element = <video src={pathToFile} controls></video>
      break
    default:
      return null
  }

  // определяем принадлежность сообщения текущему пользователю
  const isMyMessage = user.userId === message.userId

  return (
    <li className={`item message ${isMyMessage ? 'my' : ''}`}>
      <p className='username'>{isMyMessage ? 'Me' : message.userName}</p>

      <div className='inner'>
        {element}

        {isMyMessage && (
          {/* пользователь может удалять только свои сообщения */}
          <button className='btn' onClick={() => removeMessage(message)}>
            <CgTrashEmpty className='icon remove' />
          </button>
        )}
      </div>

      <p className='datetime'>
        <TimeAgo date={message.createdAt} />
      </p>
    </li>
  )
}
```

Рассмотрим хранилище в форме хука (`hooks/useStore.js`):

```javascript
import create from 'zustand'

const useStore = create((set, get) => ({
  // файл
  file: null,
  // индикатор отображения превью файла
  showPreview: false,
  // индикатор отображения компонента с эмодзи
  showEmoji: false,
  // метод для обновления файла
  setFile: (file) => {
    // получаем предыдущий файл
    const prevFile = get().file
    if (prevFile) {
      // https://w3c.github.io/FileAPI/#creating-revoking
      // это позволяет избежать утечек памяти
      URL.revokeObjectURL(prevFile)
    }
    // обновляем файл
    set({ file })
  },
  // метод для обновления индикатора отображения превью
  setShowPreview: (showPreview) => set({ showPreview }),
  // метод для обновления индикатора отображения эмодзи
  setShowEmoji: (showEmoji) => set({ showEmoji })
}))

export default useStore
```

Компонент для ввода сообщения (`MessageInput/MessageInput.js`):

```javascript
import fileApi from 'api/file.api'
import { USER_KEY } from 'constants'
import useStore from 'hooks/useStore'
import { nanoid } from 'nanoid'
import { useEffect, useRef, useState } from 'react'
import { FiSend } from 'react-icons/fi'
import storage from 'utils/storage'
import EmojiMart from './EmojiMart/EmojiMart'
import FileInput from './FileInput/FileInput'
import Recorder from './Recorder/Recorder'

export default function MessageInput({ sendMessage }) {
  // извлекаем данные пользователя из локального хранилища
  const user = storage.get(USER_KEY)
  // извлекаем состояние из хранилища
  const state = useStore((state) => state)
  const {
    file,
    setFile,
    showPreview,
    setShowPreview,
    showEmoji,
    setShowEmoji
  } = state
  // локальное состояние для текста сообщения
  const [text, setText] = useState('')
  // локальное состояние блокировки кнопки
  const [submitDisabled, setSubmitDisabled] = useState(true)
  // иммутабельная ссылка на инпут для ввода текста сообщения
  const inputRef = useRef()

  // для отправки сообщения требуется либо текст сообщения, либо файл
  useEffect(() => {
    setSubmitDisabled(!text.trim() && !file)
  }, [text, file])

  // отображаем превью при наличии файла
  useEffect(() => {
    setShowPreview(file)
  }, [file, setShowPreview])

  // функция для отправки сообщения
  const onSubmit = async (e) => {
    e.preventDefault()
    if (submitDisabled) return

    // извлекаем данные пользователя и формируем начальное сообщение
    const { userId, userName, roomId } = user
    let message = {
      messageId: nanoid(),
      userId,
      userName,
      roomId
    }

    if (!file) {
      // типом сообщения является текст
      message.messageType = 'text'
      message.textOrPathToFile = text
    } else {
      // типом сообщения является файл
      try {
        // загружаем файл на сервер и получаем относительный путь к нему
        const path = await fileApi.upload({ file, roomId })
        // получаем тип файла
        const type = file.type.split('/')[0]

        message.messageType = type
        message.textOrPathToFile = path
      } catch (e) {
        console.error(e)
      }
    }

    // скрываем компонент с эмодзи, если он открыт
    if (showEmoji) {
      setShowEmoji(false)
    }

    // отправляем сообщение
    sendMessage(message)

    // сбрасываем состояние
    setText('')
    setFile(null)
  }

  return (
    <form onSubmit={onSubmit} className='form message'>
      <EmojiMart setText={setText} messageInput={inputRef.current} />
      <FileInput />
      <Recorder />
      <input
        type='text'
        autoFocus
        placeholder='Message...'
        value={text}
        onChange={(e) => setText(e.target.value)}
        ref={inputRef}
        // при наличии файла вводить текст нельзя
        disabled={showPreview}
      />
      <button className='btn' type='submit' disabled={submitDisabled}>
        <FiSend className='icon' />
      </button>
    </form>
  )
}
```

Компонент для отображения эмодзи (`MessageInput/EmojiMart/EmojiMart.js`):

```javascript
import { Picker } from 'emoji-mart'
import 'emoji-mart/css/emoji-mart.css'
import useStore from 'hooks/useStore'
import { useCallback, useEffect } from 'react'
import { BsEmojiSmile } from 'react-icons/bs'

export default function EmojiMart({ setText, messageInput }) {
  // извлекаем соответствующие методы из хранилища
  const { showEmoji, setShowEmoji, showPreview } = useStore(
    ({ showEmoji, setShowEmoji, showPreview }) => ({
      showEmoji,
      setShowEmoji,
      showPreview
    })
  )

  // обработчик нажатия клавиши `Esc`
  const onKeydown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        setShowEmoji(false)
      }
    },
    [setShowEmoji]
  )

  // регистрируем данный обработчик на объекте `window`
  useEffect(() => {
    window.addEventListener('keydown', onKeydown)

    return () => {
      window.removeEventListener('keydown', onKeydown)
    }
  }, [onKeydown])

  // метод для добавления эмодзи к тексту сообщения
  const onSelect = ({ native }) => {
    setText((text) => text + native)
    messageInput.focus()
  }

  return (
    <div className='container emoji'>
      <button
        className='btn'
        type='button'
        {/* отображаем/скрываем эмодзи при нажатии кнопки */}
        onClick={() => setShowEmoji(!showEmoji)}
        disabled={showPreview}
      >
        <BsEmojiSmile className='icon' />
      </button>
      {showEmoji && (
        <Picker
          onSelect={onSelect}
          emojiSize={20}
          showPreview={false}
          perLine={6}
        />
      )}
    </div>
  )
}
```

Компонент для прикрепления файла (`MessageInput/FileInput/FileInput.js`):

```javascript
import useStore from 'hooks/useStore'
import { useEffect, useRef } from 'react'
import { MdAttachFile } from 'react-icons/md'
import FilePreview from '../FilePreview/FilePreview'

export default function FileInput() {
  // извлекаем файл и метод для его обновления из хранилища
  const { file, setFile } = useStore(({ file, setFile }) => ({ file, setFile }))
  // иммутабельная ссылка на инпут для добавления файла
  // мы скрываем инпут за кнопкой
  const inputRef = useRef()

  // сбрасываем значение инпута при отсутствии файла
  useEffect(() => {
    if (!file) {
      inputRef.current.value = ''
    }
  }, [file])

  return (
    <div className='container file'>
      <input
        type='file'
        accept='image/*, audio/*, video/*'
        onChange={(e) => setFile(e.target.files[0])}
        className='visually-hidden'
        ref={inputRef}
      />
      <button
        type='button'
        className='btn'
        // передаем клик инпуту
        onClick={() => inputRef.current.click()}
      >
        <MdAttachFile className='icon' />
      </button>

      {file && <FilePreview />}
    </div>
  )
}
```

Компонент для отображения превью файла (`MessageInput/FileInput/FilePreview.js`):

```javascript
import useStore from 'hooks/useStore'
import { useEffect, useState } from 'react'
import { AiOutlineClose } from 'react-icons/ai'

export default function FilePreview() {
  // извлекаем файл и метод для его обновления из хранилища
  const { file, setFile } = useStore(({ file, setFile }) => ({ file, setFile }))
  // локальное состояние для источника файла
  const [src, setSrc] = useState()
  // локальное состояние для типа файла
  const [type, setType] = useState()

  // при наличии файла обновляем источник и тип файла
  useEffect(() => {
    if (file) {
      setSrc(URL.createObjectURL(file))
      setType(file.type.split('/')[0])
    }
  }, [file])

  // элемент для рендеринга зависит от типа файла
  let element

  switch (type) {
    case 'image':
      element = <img src={src} alt={file.name} />
      break
    case 'audio':
      element = <audio src={src} controls></audio>
      break
    case 'video':
      element = <video src={src} controls></video>
      break
    default:
      element = null
      break
  }

  return (
    <div className='container preview'>
      {element}

      <button
        type='button'
        className='btn close'
        // обнуляем файл при закрытии превью
        onClick={() => setFile(null)}
      >
        <AiOutlineClose className='icon close' />
      </button>
    </div>
  )
}
```

Нам осталось рассмотреть компонент для создания аудио или видеозаписи. Но сначала рассмотрим соответствующие утилиты (`utils/recording.js`):

```javascript
// https://www.w3.org/TR/mediastream-recording/
// переменные для рекордера, частей данных и требований к потоку данных
let mediaRecorder = null
let mediaChunks = []
let mediaConstraints = null

// https://w3c.github.io/mediacapture-main/#constrainable-interface
// требования к аудиопотоку
export const audioConstraints = {
  audio: {
    echoCancellation: true,
    autoGainControl: true,
    noiseSuppression: true
  }
}

// требования к медиапотоку (аудио + видео)
export const videoConstraints = {
  ...audioConstraints,
  video: {
    width: 1920,
    height: 1080,
    frameRate: 60.0
  }
}

// индикатор начала записи
export const isRecordingStarted = () => !!mediaRecorder

// метод для приостановки записи
export const pauseRecording = () => {
  mediaRecorder.pause()
}

// метод для продолжения записи
export const resumeRecording = () => {
  mediaRecorder.resume()
}

// метод для начала записи
// принимает требования к потоку
export const startRecording = async (constraints) => {
  mediaConstraints = constraints

  try {
    // https://w3c.github.io/mediacapture-main/#dom-mediadevices-getusermedia
    // получаем поток с устройств пользователя
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    // определяем тип создаваемой записи
    const type = constraints.video ? 'video' : 'audio'

    // https://www.w3.org/TR/mediastream-recording/#mediarecorder-constructor
    // создаем экземпляр рекордера
    mediaRecorder = new MediaRecorder(stream, { mimeType: `${type}/webm` })

    // обрабатываем запись данных
    mediaRecorder.ondataavailable = ({ data }) => {
      mediaChunks.push(data)
    }

    // запускаем запись
    mediaRecorder.start(250)

    // возвращаем поток
    return stream
  } catch (e) {
    console.error(e)
  }
}

// метод для завершения записи
export const stopRecording = () => {
  // останавливаем рекордер
  mediaRecorder.stop()
  // останавливаем треки из потока
  mediaRecorder.stream.getTracks().forEach((t) => {
    t.stop()
  })

  // определяем тип записи
  const type = mediaConstraints.video ? 'video' : 'audio'
  // https://w3c.github.io/FileAPI/#file-constructor
  // создаем новый файл
  const file = new File(mediaChunks, 'my_record.webm', {
    type: `${type}/webm`
  })

  // без этого запись можно будет создать только один раз
  mediaRecorder.ondataavailable = null
  // обнуляем рекордер
  mediaRecorder = null
  // очищаем массив с данными
  mediaChunks = []

  // возвращаем файл
  return file
}
```

Компонент для создания записи (`MessageInput/Recorder/Recorder.js`):

```javascript
import useStore from 'hooks/useStore'
import { useState } from 'react'
import { RiRecordCircleLine } from 'react-icons/ri'
import RecordingModal from './RecordingModal'

export default function Recorder() {
  // извлекаем индикатор отображения превью файла из хранилища
  const showPreview = useStore(({ showPreview }) => showPreview)
  // локальное состояние для индикатора отображения модального окна
  const [showModal, setShowModal] = useState(false)

  return (
    <div className='container recorder'>
      <button
        type='button'
        className='btn'
        // показываем модальное окно при нажатии кнопки
        onClick={() => setShowModal(true)}
        // блокируем кнопку при отображении превью файла
        disabled={showPreview}
      >
        <RiRecordCircleLine className='icon' />
      </button>
      {showModal && <RecordingModal setShowModal={setShowModal} />}
    </div>
  )
}
```

Одна из самых интересных частей приложения - модальное окно для выбора типа и создания записи (`MessageInput/Recorder/RecordingModal.js`):

```javascript
import useStore from 'hooks/useStore'
import { useRef, useState } from 'react'
import { BsFillPauseFill, BsFillPlayFill, BsFillStopFill } from 'react-icons/bs'
import {
  audioConstraints,
  isRecordingStarted,
  pauseRecording,
  resumeRecording,
  startRecording,
  stopRecording,
  videoConstraints
} from 'utils/recording'

export default function RecordingModal({ setShowModal }) {
  // извлекаем метод для обновления файла из хранилища
  const setFile = useStore(({ setFile }) => setFile)
  // локальное состояние для требований к потоку данных
  // по умолчанию создается аудиозапись
  const [constraints, setConstraints] = useState(audioConstraints)
  // локальный индикатор начала записи
  const [recording, setRecording] = useState(false)
  // иммутабельная ссылка на элемент для выбора типа записи
  const selectBlockRef = useRef()
  // иммутабельная ссылка на элемент `video`
  const videoRef = useRef()

  // функция для обновления требований к потоку на основе типа записи
  const onChange = ({ target: { value } }) =>
    value === 'audio'
      ? setConstraints(audioConstraints)
      : setConstraints(videoConstraints)

  // функция для приостановки/продолжения записи
  const pauseResume = () => {
    if (recording) {
      pauseRecording()
    } else {
      resumeRecording()
    }
    setRecording(!recording)
  }

  // функция для начала записи
  const start = async () => {
    if (isRecordingStarted()) {
      return pauseResume()
    }

    // получаем поток
    const stream = await startRecording(constraints)

    // обновляем локальный индикатор начала записи
    setRecording(true)

    // скрываем элемент для выбора типа записи
    selectBlockRef.current.style.display = 'none'

    // если создается видеозапись
    if (constraints.video && stream) {
      videoRef.current.style.display = 'block'
      // направляем поток в элемент `video`
      videoRef.current.srcObject = stream
    }
  }

  // функция для завершения записи
  const stop = () => {
    // получаем файл
    const file = stopRecording()

    // обновляем локальный индикатор начала записи
    setRecording(false)

    // обновляем файл
    setFile(file)

    // скрываем модалку
    setShowModal(false)
  }

  return (
    <div
      className='overlay'
      onClick={(e) => {
        // скрываем окно при клике за его пределами
        if (e.target.className !== 'overlay') return
        setShowModal(false)
      }}
    >
      <div className='modal'>
        <div ref={selectBlockRef}>
          <h2>Select type</h2>
          <select onChange={onChange}>
            <option value='audio'>Audio</option>
            <option value='video'>Video</option>
          </select>
        </div>

        {/* вот для чего нам нужны 2 индикатора начала записи */}
        {isRecordingStarted() && <p>{recording ? 'Recording...' : 'Paused'}</p>}

        <video ref={videoRef} autoPlay muted />

        <div className='controls'>
          <button className='btn play' onClick={start}>
            {recording ? (
              <BsFillPauseFill className='icon' />
            ) : (
              <BsFillPlayFill className='icon' />
            )}
          </button>
          {isRecordingStarted() && (
            <button className='btn stop' onClick={stop}>
              <BsFillStopFill className='icon' />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
```

Прекрасно, мы завершили разработку нашего небольшого, но, согласитесь, довольно функционального приложения. Давайте проверим его работоспособность.

## Проверка работоспособности приложения

Находясь в корневой директории проекта, выполняем команду `yarn dev` и открываем 2 вкладки браузера по адресу `http://localhost:3000` (одну из вкладок открываем в режиме инкогнито).

Вводим имена пользователей и входим в комнату:

<img src="https://habrastorage.org/webt/qe/9u/4e/qe9u4eaz8am9msuolxa-a8fq95w.png" />
<br />

Обмениваемся сообщениями:

<img src="https://habrastorage.org/webt/yd/uw/-u/yduw-udx--cle5j2whsigtdgjl0.png" />
<br />

Обмениваемся эмодзи:

<img src="https://habrastorage.org/webt/x2/gb/8z/x2gb8zi6norlv6mky2aqxcaeahe.png" />
<br />

Обмениваемся файлами:

<img src="https://habrastorage.org/webt/4v/as/aa/4vasaahjqmllndhg3cuvl8nbhr0.png" />
<br />

Обмениваемся аудио/видео записями:

<img src="https://habrastorage.org/webt/po/be/5i/pobe5ild8ddh5omzggi-5v9gnls.png" />
<br />

<img src="https://habrastorage.org/webt/1t/-i/9x/1t-i9x_hc_b5al2z25m9r87wz-y.png" />
<br />

Удаляем парочку сообщений:

<img src="https://habrastorage.org/webt/pk/eo/8g/pkeo8gzcyyq7gx0fcocbzwnzbse.png" />
<br />

Приложение работает, как ожидается.

Поскольку, у наших пользователей имеются относительно стабильные и известные клиенту `id`, ничто не мешает нам масштабировать приложение, добавив в него возможность совершения аудио и видеозвонков посредством `WebRTC`, о чем я рассказывал в [этой статье](https://habr.com/ru/company/timeweb/blog/649369/). Будем считать это вашим домашним заданием.

The End.