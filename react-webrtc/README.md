# React: WebRTC Media Call

Привет, друзья!

В этой статье я покажу вам, как разработать приложение для совершения аудио/видео звонков с помощью [`WebRTC`](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API).

Функционал нашего приложения будет следующим:

- при запуске приложения пользователь А получает уникальный идентификатор;
- он передает этот идентификатор пользователю Б;
- пользователь Б использует идентификатор пользователя А для совершения аудио или видео звонка;
- пользователь А получает уведомление о звонке пользователя Б и может ответить на него с видео или без либо отклонить звонок;
- в процессе соединения пользователи имеют возможность включать/выключать аудио и видео;
- после завершения звонка выполняется перезагрузка `WebRTC` для обеспечения возможности совершения нового звонка.

[Демо приложения](https://react-webrtc-call.herokuapp.com/).

[Основной источник вдохновения](https://github.com/nguymin4/react-videocall).

Для установки зависимостей мы будем использовать [Yarn](https://yarnpkg.com/).

Для создания шаблона приложения - [Vite](https://vitejs.dev/).

Для стилизации - [Sass](https://sass-lang.com/).

Для инициализации медиасессии (signalling - сигнализации) между браузерами - [веб-сокеты](https://ru.wikipedia.org/wiki/WebSocket) в лице [Socket.io](https://socket.io/).

Основные спецификации, на которые мы будем опираться при разработке приложения:

- [WebRTC 1.0: Real-Time Communication Between Browsers](https://w3c.github.io/webrtc-pc) - набор `API` для обмена медиа и другими данными между браузерами, в которых реализован соответствующий набор протоколов, в режиме реального времени;
- [An Offer/Answer Model with the Session Description Protocol (SDP)](https://www.rfc-editor.org/rfc/rfc3264) - механизм, позволяющий браузерам устанавливать соединение с помощью протокола описания сессии (Session Description Protocol, SDP);
- [Media Capture and Streams](https://w3c.github.io/mediacapture-main) - набор `API`, позволяющих браузеру получать доступ к медиапотоку с устройств пользователя.

Ссылки на соответствующие разделы [MDN](https://developer.mozilla.org/) будут приводиться по мере необходимости.

Фактически наше приложение будет продвинутой реализацией примеров, описанных [здесь](https://w3c.github.io/webrtc-pc/#simple-peer-to-peer-example) и [здесь](https://www.rfc-editor.org/rfc/rfc8829#section-7.1).

## Подготовка и настройка проекта

Создаем директорию, переходим в нее и создаем шаблон `React-приложения`:

```bash
mkdir react-webrtc
cd react-webrtc

yarn create vite client --template react
```

Пока создается шаблон, поговорим о процессе установки [P2P-соединения](https://ru.wikipedia.org/wiki/%D0%9E%D0%B4%D0%BD%D0%BE%D1%80%D0%B0%D0%BD%D0%B3%D0%BE%D0%B2%D0%B0%D1%8F_%D1%81%D0%B5%D1%82%D1%8C) (peer-to-peer - равный к равному, одноранговая сеть), об интерфейсах и методах, задействованных в этом процессе.

Вот что происходит на самом высоком уровне:

- браузер пользователя А (далее - `А`) захватывает (capture) медиапоток с устройств пользователя (видеокамера и микрофон). Для этого используется метод [`getUserMedia`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia):

```javascript
// ограничения или требования к потоку
// https://w3c.github.io/mediacapture-main/#constrainable-interface
const config = {
 audio: true,
 video: true
}

// https://w3c.github.io/mediacapture-main/#dom-mediadevices-getusermedia
const localStream = await navigator.mediaDevices.getUserMedia(config)

// медиапоток состоит из 1 или более медиатреков
// https://w3c.github.io/mediacapture-main/#dom-mediastream-gettracks
const localTracks = localStream.getTracks()
```

- `А` создает экземпляр [`RTCPeerConnection`](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection) с помощью [одноименного конструктора](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/RTCPeerConnection):

```javascript
// https://w3c.github.io/webrtc-pc/#dom-rtcconfiguration
const config = { iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }] }

// https://w3c.github.io/webrtc-pc/#interface-definition
const pc = new RTCPeerConnection(config)
```

- `А` добавляет захваченные треки и поток в экземпляр `RTCPeerConnection` с помощью метода [`addTrack`](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addTrack):

```javascript
stream.getTracks().forEach((track) => {
 // https://w3c.github.io/webrtc-pc/#dom-rtcpeerconnection-addtrack
 pc.addTrack(track, stream)
})
```

- `А` генерирует предложение (offer) об установке соединения с помощью метода [`createOffer`](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createOffer). Данный метод возвращает [`RTCLocalSessionDescriptionInit`](https://w3c.github.io/webrtc-pc/#dom-rtclocalsessiondescriptioninit):

```javascript
// https://w3c.github.io/webrtc-pc/#dom-rtcpeerconnection-createoffer
const offer = await pc.createOffer()
```

- `А` вызывает метод [`setLocalDescription`](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/setLocalDescription), передавая ему предложение:

```javascript
// https://w3c.github.io/webrtc-pc/#dom-peerconnection-setlocaldescription
pc.setLocalDescription(offer)
```

- предложение передается браузеру пользователя Б (далее - `Б`) любым доступным способом, например, через веб-сокеты (сигнализация):

```javascript
socket.emit('call', {
 // идентификатор Б
 to: remoteId,
 // предложение
 sdp: offer
})
```

- `Б` создает экземпляр `RTCPeerConnection` и добавляет в него предложение в виде [`RTCSessionDescription`](https://developer.mozilla.org/en-US/docs/Web/API/RTCSessionDescription), с помощью метода [`setRemoteDescription`](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/setRemoteDescription). `RTCSessionDescription` (описание сессии) создается с помощью [одноименного конструктора](https://developer.mozilla.org/en-US/docs/Web/API/RTCSessionDescription/RTCSessionDescription):

```javascript
// https://w3c.github.io/webrtc-pc/#rtcsessiondescription-class
const sdp = new RTCSessionDescription(desc)
// https://w3c.github.io/webrtc-pc/#dom-peerconnection-setremotedescription
pc.setRemoteDescription(sdp)
```

- при добавлении `А` треков и потока в экземпляр `RTCPeerConnection` на стороне `Б` возникает событие [`track`](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/track_event), которое обрабатывается с помощью [`ontrack`](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/ontrack):

```javascript
// событие содержит медиапотоки, полученные от другой стороны, в виде массива
// в нашем случае в массиве будет только один такой поток
// https://w3c.github.io/webrtc-pc/#rtctrackevent
// https://w3c.github.io/webrtc-pc/#dom-rtcpeerconnection-ontrack
pc.ontrack = ({ streams }) => {
 remoteStream = streams[0]
}
```

- `Б` захватывает медиапоток с устройств пользователя, добавляет треки и поток в экземпляр `RTCPeerConnection`, генерирует ответ на предложение об установке соединения (answer) с помощью метода [`createAnswer`](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createAnswer), вызывает `setLocalDescription` с ответом и передает ответ `А`:

```javascript
// https://w3c.github.io/webrtc-pc/#dom-rtcpeerconnection-createanswer
const answer = await pc.createAnswer()

pc.setLocalDescription(answer)

// сигнализация
socket.emit('call', {
 // идентификатор А
 to: remoteId,
 sdp: answer
})
```

- `А`, в свою очередь, также вызывает `setRemoteDescription` и регистрирует `ontrack`;

- в это же время (после вызова `setLocalDescription`) происходит подбор кандидатов для установки интерактивного соединения (ICE gathering). Возникает событие [`icecandidate`](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/icecandidate_event), которое обрабатывается с помощью [`onicecandidate`](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/onicecandidate):

```javascript
// https://w3c.github.io/webrtc-pc/#dom-rtcpeerconnection-onicecandidate
// https://w3c.github.io/webrtc-pc/#dom-rtcpeerconnectioniceevent
pc.onicecandidate = ({ candidate }) => {
 // событие содержит `RTCIceCandidateInit`
 // https://w3c.github.io/webrtc-pc/#dom-rtcicecandidateinit
 // передаем "кандидата" другой стороне
 socket.emit('call', {
   to: remoteId,
   candidate
 })
}
```

- при получении "кандидата" другой стороной, она создает экземпляр [`RTCIceCandidate`](https://developer.mozilla.org/en-US/docs/Web/API/RTCIceCandidate) с помощью [одноименного конструктора](https://developer.mozilla.org/en-US/docs/Web/API/RTCIceCandidate/RTCIceCandidate) и вызывает метод [`addIceCandidate`](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addIceCandidate):

```javascript
// https://w3c.github.io/webrtc-pc/#rtcicecandidate-interface
const _candidate = new RTCIceCandidate(candidate)

// https://w3c.github.io/webrtc-pc/#dom-peerconnection-addicecandidate
pc.addIceCandidate(_candidate)
```

- после этого стороны могут напрямую обмениваться медиаданными.

Более подробную информацию о том, как все это происходит на более низком уровне, в доступной форме можно получить [здесь](https://webrtcforthecurious.com/).

## Сервер

Пожалуй, имеет смысл начать разработку нашего приложения с подготовки сервера, который будет использоваться для инициализации медиасессии между браузерами (сигнализации).

Создаем директорию, переходим в нее, инициализируем `Node.js-проект` и устанавливаем зависимости:

```bash
mkdir server
cd server

yarn init -yp

yarn add express socket.io dotenv nanoid

yarn add -D nodemon
```

Зависимости:

- [`express`](https://expressjs.com/ru/) - `Node.js-фреймворк` для разработки веб-серверов;
- [`socket.io`](https://www.npmjs.com/package/socket.io) - библиотека, облегчающая работу с веб-сокетами;
- [`dotenv`](https://www.npmjs.com/package/dotenv) - утилита для работы с переменными среды окружения;
- [`nanoid`](https://www.npmjs.com/package/nanoid) - утилита для генерации идентификаторов;
- [`nodemon`](https://www.npmjs.com/package/nodemon) - утилита для запуска сервера для разработки.

Определяем тип кода сервера и команды для запуска серверов в `package.json`:

```javascript
"type": "module",
"scripts": {
 "dev": "nodemon",
 "start": "node index.js"
}
```

Создаем файл `index.js`:

```bash
touch index.js
```

Импортируем библиотеки и утилиты:

```javascript
import express from 'express'
import { createServer } from 'http'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { Server } from 'socket.io'
import { config } from 'dotenv'
import initSocket from './utils/initSocket.js'
```

Получаем доступ к переменным среды окружения и формируем путь к текущей директории:

```javascript
config()

const __dirname = dirname(fileURLToPath(import.meta.url))
```

Создаем экземпляры `express` и сервера:

```javascript
const app = express()
const server = createServer(app)
```

Добавляем обслуживание статических файлов из сборки клиента:

```javascript
app.use(express.static(join(__dirname, '../client/dist')))
```

Создаем экземпляр `socket.io` и добавляем обработку подключения:

```javascript
const io = new Server(server, {
 cors: process.env.ALLOWED_ORIGIN,
 serveClient: false
})
io.on('connection', initSocket)
```

Определяем порт и запускаем сервер:

```javascript
const port = process.env.PORT || 4000
server.listen(port, () => {
 console.log(`Server ready on port ${port} 🚀`)
})
```

Создаем файл `.env` и записываем в него разрешенный источник:

```
ALLOWED_ORIGIN=http://localhost:3000
```

Реализуем обработку подключения (`utils/initSocket.js`).

Импортируем `nanoid` и определяем переменную для пользователей:

```javascript
import { nanoid } from 'nanoid'

const users = {}

// функция принимает сокет
export default function initSocket(socket) {
 // TODO
}
```

Сокет будет регистрировать и обрабатывать 5 типов событий:

- `init`: установка соединения - генерация `id` пользователя, сохранение пользователя (его сокета) и передача `id` клиенту;
- `request`: передача `id` пользователя другому клиенту;
- `call`: начало звонка;
- `end`: завершение звонка;
- `disconnect`: разрыв соединения (отключение сокета).

Определяем переменную для `id` пользователя и вспомогательную функцию для передачи данных адресату:

```javascript
let id

// функция принимает `id` адресата, тип события и полезную нагрузку - данные для передачи
const emit = (userId, event, data) => {
 // определяем получателя
 const receiver = users[userId]
 if (receiver) {
   // вызываем событие
   receiver.emit(event, data)
 }
}
```

Обрабатываем названные выше события:

```javascript
socket
 .on('init', () => {
   id = nanoid(5)
   users[id] = socket
   console.log(id, 'connected')
   socket.emit('init', { id })
 })
 .on('request', (data) => {
   emit(data.to, 'request', { from: id })
 })
 .on('call', (data) => {
   emit(data.to, 'call', { ...data, from: id })
 })
 .on('end', (data) => {
   emit(data.to, 'end')
 })
 .on('disconnect', () => {
   delete users[id]
   console.log(id, 'disconnected')
 })
```

Думаю, здесь все понятно.

Больше от нашего сервера ничего не требуется.

## Клиент

Переходим в директорию с кодом клиента и устанавливаем 3 дополнительные зависимости:

```bash
cd client

yarn add socket.io-client sass react-icons
```

- [`socket.io-client`](https://www.npmjs.com/package/socket.io-client) - клиентская часть `socket.io`;
- [`sass`](https://www.npmjs.com/package/sass) - `CSS-препроцессор`.
- [`react-icons`](https://www.npmjs.com/package/react-icons) - иконки.

Структура директории `src` будет следующей:

- components
 - MainWindow.jsx - начальный экран
 - CallModal.jsx - модальное окно с уведомлением о входящем звонке
 - CallWindow.jsx - экран для коммуникации
 - index.js - повторный экспорт компонентов
- styles - стили (я не буду о них рассказывать, просто скопируйте их из репозитория с исходным кодом)
- utils
 - socket.js - инициализация `socket.io`
 - Emitter.js - интерфейс - реализация паттерна [`Pub/Sub`](https://ru.wikipedia.org/wiki/%D0%98%D0%B7%D0%B4%D0%B0%D1%82%D0%B5%D0%BB%D1%8C-%D0%BF%D0%BE%D0%B4%D0%BF%D0%B8%D1%81%D1%87%D0%B8%D0%BA_(%D1%88%D0%B0%D0%B1%D0%BB%D0%BE%D0%BD_%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F))
 - MediaDevices.js - интерфейс для работы с медиапотоком
 - PeerConnection.js - интерфейс для работы с `RTCPeerConnection`
- App.jsx
- main.jsx

Начнем с утилиты и интерфейсов.

### Интерфейсы и утилита

Инициализируем сокет (`utils/socket.js`):

```javascript
import { io } from 'socket.io-client'

// в производственном режиме сервер и клиент будут находиться в одном источнике (origin),
// а в режиме для разработки - в разных
const SERVER_URI = import.meta.env.DEV ? 'http://localhost:4000' : ''

const socket = io(SERVER_URI)

export default socket
```

Определяем интерфейс `pub/sub` (`utils/Emitter.js`):

```javascript
class Emitter {
 constructor() {
   this.events = {}
 }

 emit(e, ...args) {
   if (this.events[e]) {
     this.events[e].forEach((fn) => fn(...args))
   }
   return this
 }

 on(e, fn) {
   this.events[e] ? this.events[e].push(fn) : (this.events[e] = [fn])
   return this
 }

 off(e, fn) {
   if (e && typeof fn === 'function') {
     const listeners = this.events[e]
     listeners.splice(
       listeners.findIndex((_fn) => _fn === fn),
       1
     )
   } else {
     this.events[e] = []
   }
   return this
 }
}

export default Emitter
```

Данный интерфейс предоставляет 3 метода:

- `emit`: для запуска обработчиков определенного события;
- `on`: для подписки - добавления обработчиков определенного события;
- `off`: для отписки - удаления конкретного или всех обработчиков определенного события.

_Обратите внимание_: каждый метод возвращает `this`. Это позволяет вызывать методы интерфейса в цепочке, например, `emitter.on(event1, callback1).on(event2, callback2)`.

Интерфейсы `MediaDevices` и `PeerConnection` будут расширять интерфейс `Emitter`, тем самым наследуя указанные методы.

Рассмотрим интерфейс для работы с медиапотоком (`utils/MediaDevices.js`):

```javascript
import Emitter from './Emitter'

class MediaDevice extends Emitter {
 start() {
   navigator.mediaDevices
     .getUserMedia({
       audio: true,
       video: true
     })
     .then((stream) => {
       this.stream = stream
       this.emit('stream', stream)
     })
     .catch(console.error)

   return this
 }

 toggle(type, on) {
   if (this.stream) {
     this.stream[`get${type}Tracks`]().forEach((t) => {
       t.enabled = on ? on : !t.enabled
     })
   }

   return this
 }

 stop() {
   if (this.stream) {
     this.stream.getTracks().forEach((t) => { t.stop() })
   }
   // удаляем все обработчики всех событий
   this.off()

   return this
 }
}

export default MediaDevice
```

Данный интерфейс расширяет интерфейс `Emitter` и предоставляет 3 дополнительных метода:

- `start`: для захвата медиапотока с устройств пользователя, его записи в переменную и вызова события `stream`;
- `toggle`: для переключения состояния аудио и видео треков. Для получения аудио треков используется метод `getAudioTracks`, а для получения видеотреков - `getVideoTracks`;
- `stop`: для остановки захвата медиапотока.

На интерфейсе `PeerConnection` остановимся подробнее.

Данный интерфейс расширяет интерфейс `Emitter`, использует интерфейс `MediaDevices` и утилиту `socket`:

```javascript
import Emitter from './Emitter'
import MediaDevice from './MediaDevice'
import socket from './socket'

// настройки
const CONFIG = { iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }] }

class PeerConnection extends Emitter {
 // TODO
}
```

При создании экземпляра `PeerConnection` в его конструктор передается `id` адресата - того, кому мы звоним. В конструкторе `id` адресата записывается в переменную, создается экземпляр `RTCPeerConnection`, регистрируются обработчики событий `icecandidate` и `track`, создается экземпляр `MediaDevices` и выполняется привязка (фиксируется контекст для) метода `getDescription`:

```javascript
constructor(remoteId) {
 super()
 this.remoteId = remoteId

 this.pc = new RTCPeerConnection(CONFIG)
 this.pc.onicecandidate = ({ candidate }) => {
   socket.emit('call', {
     to: this.remoteId,
     candidate
   })
 }
 this.pc.ontrack = ({ streams }) => {
   // унаследованный метод
   this.emit('remoteStream', streams[0])
 }

 this.mediaDevice = new MediaDevice()
 this.getDescription = this.getDescription.bind(this)
}
```

Метод для совершения звонка:

```javascript
// метод принимает индикатор того, является ли пользователь инициатором звонка
// и объект с настройками для `getUserMedia`
start(isCaller, config) {
 this.mediaDevice
   // обрабатываем событие `stream`
   .on('stream', (stream) => {
     // добавляем захваченные треки и поток в `PeerConnection`
     stream.getTracks().forEach((t) => {
       this.pc.addTrack(t, stream)
     })

     // данный захваченный поток является локальным
     this.emit('localStream', stream)

     // если пользователь является инициатором звонка,
     // отправляем запрос на звонок другой стороне,
     // иначе генерируем предложение об установке соединения
     isCaller
       ? socket.emit('request', { to: this.remoteId })
       : this.createOffer()
   })
   // запускаем метод `start` интерфейса `MediaDevices`
   .start(config)

 return this
}
```

Метод для завершения звонка:

```javascript
stop(isCaller) {
 // если пользователь является инициатором завершения звонка,
 // сообщаем о завершении другой стороне
 if (isCaller) {
   socket.emit('end', { to: this.remoteId })
 }
 // останавливаем захват медиапотока
 this.mediaDevice.stop()
 // перезагружаем систему для обеспечения возможности совершения нового звонка
 this.pc.restartIce()
 this.off()

 return this
}
```

Далее следует несколько вспомогательных функций, необходимых для начала медиасессии:

```javascript
// метод для генерации предложения
createOffer() {
 this.pc.createOffer().then(this.getDescription).catch(console.error)

 return this
}

// метод для генерации ответа
createAnswer() {
 this.pc.createAnswer().then(this.getDescription).catch(console.error)

 return this
}

// метод для добавления локального описания в `PeerConnection`
// и отправки описания другой стороне
getDescription(desc) {
 this.pc.setLocalDescription(desc)

 socket.emit('call', { to: this.remoteId, sdp: desc })

 return this
}

// метод для добавления удаленного (в значении "находящегося далеко") описания в `PeerConnection`
setRemoteDescription(desc) {
 this.pc.setRemoteDescription(new RTCSessionDescription(desc))

 return this
}

// метод для добавления кандидата в `PeerConnection`
addIceCandidate(candidate) {
 // кандидат может быть пустой строкой
 if (candidate) {
   this.pc.addIceCandidate(new RTCIceCandidate(candidate))
 }

 return this
}
```

<spoiler title="Полный код рассматриваемого интерфейса:">

```javascript
import Emitter from './Emitter'
import MediaDevice from './MediaDevice'
import socket from './socket'

const CONFIG = { iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }] }

class PeerConnection extends Emitter {
 constructor(remoteId) {
   super()
   this.remoteId = remoteId

   this.pc = new RTCPeerConnection(CONFIG)
   this.pc.onicecandidate = ({ candidate }) => {
     socket.emit('call', {
       to: this.remoteId,
       candidate
     })
   }
   this.pc.ontrack = ({ streams }) => {
     this.emit('remoteStream', streams[0])
   }

   this.mediaDevice = new MediaDevice()

   this.getDescription = this.getDescription.bind(this)
 }

 start(isCaller, config) {
   this.mediaDevice
     .on('stream', (stream) => {
       stream.getTracks().forEach((t) => {
         this.pc.addTrack(t, stream)
       })

       this.emit('localStream', stream)

       isCaller
         ? socket.emit('request', { to: this.remoteId })
         : this.createOffer()
     })
     .start(config)

   return this
 }

 stop(isCaller) {
   if (isCaller) {
     socket.emit('end', { to: this.remoteId })
   }
   this.mediaDevice.stop()
   this.pc.restartIce()
   this.off()

   return this
 }

 createOffer() {
   this.pc.createOffer().then(this.getDescription).catch(console.error)

   return this
 }

 createAnswer() {
   this.pc.createAnswer().then(this.getDescription).catch(console.error)

   return this
 }

 getDescription(desc) {
   this.pc.setLocalDescription(desc)

   socket.emit('call', { to: this.remoteId, sdp: desc })

   return this
 }

 setRemoteDescription(desc) {
   this.pc.setRemoteDescription(new RTCSessionDescription(desc))

   return this
 }

 addIceCandidate(candidate) {
   if (candidate) {
     this.pc.addIceCandidate(new RTCIceCandidate(candidate))
   }

   return this
 }
}

export default PeerConnection
```

</spoiler>

Сначала я реализовал интерфейсы `MediaDevice` и `PeerConnection` в виде пользовательских хуков, но мне не понравился результат, поэтому я предпочел вернуться к классам.

Переходим к компонентам.

### Компоненты

Начальный экран (`components/MainWindow.jsx`).

Импортируем хуки, иконки и сокет:

```javascript
import { useEffect, useState } from 'react'
import { BsCameraVideo, BsPhone } from 'react-icons/bs'

import socket from '../utils/socket'

// функция принимает метод для инициализации звонка
export const MainWindow = ({ startCall }) => {
 // TODO
}
```

Определяем состояния для локального (нашего) и удаленного (в значении "находящийся далеко") `id`, а также для ошибки:

```javascript
const [localId, setLocalId] = useState('')
const [remoteId, setRemoteId] = useState('')
const [error, setError] = useState('')
```

Отправляем и обрабатываем событие `init`:

```javascript
useEffect(() => {
 socket
   .on('init', ({ id }) => {
     // наш `id`, сгенерированный на сервере
     setLocalId(id)
   })
   .emit('init')
}, [])
```

Определяем метод для выполнения звонка:

```javascript
// звонок может выполняться как с видео, так и без него
const callWithVideo = (video) => {
 // `id` нашего друга должен быть обязательно указан в соответствующем поле
 if (!remoteId.trim()) {
   return setError('Your friend ID must be specified!')
 }
 // настройки для захвата медиапотока
 const config = { audio: true, video }
 // инициализация `PeerConnection`
 startCall(true, remoteId, config)
}
```

Возвращаем разметку:

```javascript
return (
 <div className='container main-window'>
   <div className='local-id'>
     <h2>Your ID is</h2>
     <p>{localId}</p>
   </div>
   <div className='remote-id'>
     <label htmlFor='remoteId'>Your friend ID</label>
     <p className='error'>{error}</p>
     <input
       type='text'
       spellCheck={false}
       placeholder='Enter friend ID'
       onChange={({ target: { value } }) => {
         setError('')
         setRemoteId(value)
       }}
     />
     <div className='control'>
       {/* видео звонок */}
       <button onClick={() => callWithVideo(true)}>
         <BsCameraVideo />
       </button>
       {/* аудио звонок */}
       <button onClick={() => callWithVideo(false)}>
         <BsPhone />
       </button>
     </div>
   </div>
 </div>
)
```

<spoiler title="Полный код рассматриваемого компонента:">

```javascript
import { useEffect, useState } from 'react'
import { BsCameraVideo, BsPhone } from 'react-icons/bs'

import socket from '../utils/socket'

export const MainWindow = ({ startCall }) => {
 const [localId, setLocalId] = useState('')
 const [remoteId, setRemoteId] = useState('')
 const [error, setError] = useState('')

 useEffect(() => {
   socket
     .on('init', ({ id }) => {
       setLocalId(id)
     })
     .emit('init')
 }, [])

 const callWithVideo = (video) => {
   if (!remoteId.trim()) {
     return setError('Your friend ID must be specified!')
   }
   const config = { audio: true, video }
   startCall(true, remoteId, config)
 }

 return (
   <div className='container main-window'>
     <div className='local-id'>
       <h2>Your ID is</h2>
       <p>{localId}</p>
     </div>
     <div className='remote-id'>
       <label htmlFor='remoteId'>Your friend ID</label>
       <p className='error'>{error}</p>
       <input
         type='text'
         spellCheck={false}
         placeholder='Enter friend ID'
         onChange={({ target: { value } }) => {
           setError('')
           setRemoteId(value)
         }}
       />
       <div className='control'>
         <button onClick={() => callWithVideo(true)}>
           <BsCameraVideo />
         </button>
         <button onClick={() => callWithVideo(false)}>
           <BsPhone />
         </button>
       </div>
     </div>
   </div>
 )
}
```

</spoiler>

---

Модальное окно - уведомление о входящем звонке (`components/CallModal.jsx`).

Импортируем хуки и иконку:

```javascript
import { BsCameraVideo, BsPhone } from 'react-icons/bs'
import { FiPhoneOff } from 'react-icons/fi'

// функция принимает `id` звонящего и методы для принятия звонка и его отклонения
export const CallModal = ({ callFrom, startCall, rejectCall }) => {
 // TODO
}
```

Определяем метод для принятия звонка:

```javascript
// звонок может приниматься с видео и без
const acceptWithVideo = (video) => {
 const config = { audio: true, video }
 // инициализация `PeerConnection`
 startCall(false, callFrom, config)
}
```

И возвращаем разметку:

```javascript
return (
 <div className='call-modal'>
   <div className='inner'>
     <p>{`${callFrom} is calling`}</p>
     <div className='control'>
       {/* принимаем звонок с видео */}
       <button onClick={() => acceptWithVideo(true)}>
         <BsCameraVideo />
       </button>
       {/* принимаем звонок без видео */}
       <button onClick={() => acceptWithVideo(false)}>
         <BsPhone />
       </button>
       {/* отклоняем звонок */}
       <button onClick={rejectCall} className='reject'>
         <FiPhoneOff />
       </button>
     </div>
   </div>
 </div>
)
```

---

Экран для коммуникации (`components/CallWindow.jsx`).

Импортируем хуки и иконки:

```javascript
import { useState, useEffect, useRef } from 'react'
import { BsCameraVideo, BsPhone } from 'react-icons/bs'
import { FiPhoneOff } from 'react-icons/fi'

/*
 функция принимает следующее:
 - удаленный медиа поток
 - локальный медиа поток
 - настройки для захвата медиапотока
 - интерфейс для работы с потоком
 - метод для завершения звонка
*/
export const CallWindow = ({
 remoteSrc,
 localSrc,
 config,
 mediaDevice,
 finishCall
}) => {
 // TODO
}
```

Определяем иммутабельные переменные для ссылок на `DOM-элементы`, а также для размеров элемента с локальным видео и состояния для аудио и видео:

```javascript
const remoteVideo = useRef()
const localVideo = useRef()
const localVideoSize = useRef()
// настройки могут иметь значение `null`,
// поэтому мы используем здесь оператор опциональной последовательности `?.`
const [video, setVideo] = useState(config?.video)
const [audio, setAudio] = useState(config?.audio)
```

С точки зрения пользовательского интерфейса мне показалось логичным сделать элемент с удаленным видео очень большим (максимальная высота - 90vh) и разместить его по центру. С размером элемента с локальным видео я тоже определился и сделал его равным 25vw в ширину. Но я не мог определиться с положением этого элемента, поэтому решил реализовать возможность его перетаскивания или, скорее, переноса (клик -> перенос -> клик). При этом, я хотел сделать это наиболее простым и понятным способом.

Определяем состояние для перетаскивания (индикатор) и координат элемента:

```javascript
const [dragging, setDragging] = useState(false)
const [coords, setCoords] = useState({
 x: 0,
 y: 0
})
```

Вычисляем размеры элемента с локальным видео и записываем их в переменную:

```javascript
useEffect(() => {
 const { width, height } = localVideo.current.getBoundingClientRect()
 localVideoSize.current = { width, height }
}, [])
```

Добавляем визуализацию перетаскивания за счет переключения `CSS-классов`:

```javascript
useEffect(() => {
 dragging
   ? localVideo.current.classList.add('dragging')
   : localVideo.current.classList.remove('dragging')
}, [dragging])
```

Определяем метод для перетаскивания элемента с локальным видео:

```javascript
const onMouseMove = (e) => {
 // если элемент находится в состоянии перетаскивания
 if (dragging) {
   // это позволяет добиться того,
   // что центр перетаскиваемого элемента всегда будет следовать за курсором
   setCoords({
     x: e.clientX - localVideoSize.current.width / 2,
     y: e.clientY - localVideoSize.current.height / 2
   })
 }
}
```

Регистрируем данный обработчик на глобальном объекте `window`:

```javascript
useEffect(() => {
 window.addEventListener('mousemove', onMouseMove)

 return () => {
   window.removeEventListener('mousemove', onMouseMove)
 }
})
```

Далее, нам необходимо передать медиапотоки в соответствующие элементы:

```javascript
useEffect(() => {
 // удаленный поток
 if (remoteVideo.current && remoteSrc) {
   remoteVideo.current.srcObject = remoteSrc
 }
 // локальный поток
 if (localVideo.current && localSrc) {
   localVideo.current.srcObject = localSrc
 }
}, [remoteSrc, localSrc])
```

Переключаем треки в значения, соответствующие настройкам для захвата медиапотока:

```javascript
useEffect(() => {
 if (mediaDevice) {
   // переключаем видеотреки
   mediaDevice.toggle('Video', video)
   // переключаем аудиотреки
   mediaDevice.toggle('Audio', audio)
 }
}, [mediaDevice])
```

Определяем метод для переключения состояний и треков:

```javascript
const toggleMediaDevice = (deviceType) => {
 // видео
 if (deviceType === 'video') {
   setVideo(!video)
   mediaDevice.toggle('Video')
 }
 // аудио
 if (deviceType === 'audio') {
   setAudio(!audio)
   mediaDevice.toggle('Audio')
 }
}
```

Наконец, возвращаем разметку:

```javascript
return (
 <div className='call-window'>
   <div className='inner'>
     <div className='video'>
       {/* элемент для удаленного видеопотока */}
       <video className='remote' ref={remoteVideo} autoPlay />
       {/*
         элемент для локального видеопотока
         обратите внимание на атрибут `muted`,
         без него мы будем слышать сами себя,
         что сделает коммуникацию затруднительной
       */}
       <video
         className='local'
         ref={localVideo}
         autoPlay
         muted
         {/* перенос элемента */}
         onClick={() => setDragging(!dragging)}
         style={{
           top: `${coords.y}px`,
           left: `${coords.x}px`
         }}
       />
     </div>
     <div className='control'>
       {/* кнопка для переключения видео */}
       <button
         className={video ? '' : 'reject'}
         onClick={() => toggleMediaDevice('video')}
       >
         <BsCameraVideo />
       </button>
       {/* кнопка для переключения аудио */}
       <button
         className={audio ? '' : 'reject'}
         onClick={() => toggleMediaDevice('audio')}
       >
         <BsPhone />
       </button>
       {/* кнопка для завершения звонка */}
       <button className='reject' onClick={() => finishCall(true)}>
         <FiPhoneOff />
       </button>
     </div>
   </div>
 </div>
)
```

<spoiler title="Полный код рассматриваемого компонента:">

```javascript
import { useState, useEffect, useRef } from 'react'
import { BsCameraVideo, BsPhone } from 'react-icons/bs'
import { FiPhoneOff } from 'react-icons/fi'

export const CallWindow = ({
 remoteSrc,
 localSrc,
 config,
 mediaDevice,
 finishCall
}) => {
 const remoteVideo = useRef()
 const localVideo = useRef()
 const localVideoSize = useRef()
 const [video, setVideo] = useState(config?.video)
 const [audio, setAudio] = useState(config?.audio)

 const [dragging, setDragging] = useState(false)
 const [coords, setCoords] = useState({
   x: 0,
   y: 0
 })

 useEffect(() => {
   const { width, height } = localVideo.current.getBoundingClientRect()
   localVideoSize.current = { width, height }
 }, [])

 useEffect(() => {
   dragging
     ? localVideo.current.classList.add('dragging')
     : localVideo.current.classList.remove('dragging')
 }, [dragging])

 useEffect(() => {
   window.addEventListener('mousemove', onMouseMove)

   return () => {
     window.removeEventListener('mousemove', onMouseMove)
   }
 })

 useEffect(() => {
   if (remoteVideo.current && remoteSrc) {
     remoteVideo.current.srcObject = remoteSrc
   }
   if (localVideo.current && localSrc) {
     localVideo.current.srcObject = localSrc
   }
 }, [remoteSrc, localSrc])

 useEffect(() => {
   if (mediaDevice) {
     mediaDevice.toggle('Video', video)
     mediaDevice.toggle('Audio', audio)
   }
 }, [mediaDevice])

 const onMouseMove = (e) => {
   if (dragging) {
     setCoords({
       x: e.clientX - localVideoSize.current.width / 2,
       y: e.clientY - localVideoSize.current.height / 2
     })
   }
 }

 const toggleMediaDevice = (deviceType) => {
   if (deviceType === 'video') {
     setVideo(!video)
     mediaDevice.toggle('Video')
   }
   if (deviceType === 'audio') {
     setAudio(!audio)
     mediaDevice.toggle('Audio')
   }
 }

 return (
   <div className='call-window'>
     <div className='inner'>
       <div className='video'>
         <video className='remote' ref={remoteVideo} autoPlay />
         <video
           className='local'
           ref={localVideo}
           autoPlay
           muted
           onClick={() => setDragging(!dragging)}
           style={{
             top: `${coords.y}px`,
             left: `${coords.x}px`
           }}
         />
       </div>
       <div className='control'>
         <button
           className={video ? '' : 'reject'}
           onClick={() => toggleMediaDevice('video')}
         >
           <BsCameraVideo />
         </button>
         <button
           className={audio ? '' : 'reject'}
           onClick={() => toggleMediaDevice('audio')}
         >
           <BsPhone />
         </button>
         <button className='reject' onClick={() => finishCall(true)}>
           <FiPhoneOff />
         </button>
       </div>
     </div>
   </div>
 )
}
```

</spoiler>

---

Основной компонент приложения (`App.jsx`).

Импортируем стили, хуки, иконку, интерфейс `PeerConnection` и сокет:

```javascript
import './styles/app.scss'

import { useState, useEffect } from 'react'
import { BsPhoneVibrate } from 'react-icons/bs'

import PeerConnection from './utils/PeerConnection'
import socket from './utils/socket'

import { MainWindow, CallWindow, CallModal } from './components'

export default function App() {
 // TODO
}
```

Определяем состояния для:

- `id` звонящего;
- индикатора установки соединения;
- индикатора отображения уведомления;
- локального медиапотока;
- удаленного медиапотока;
- экземпляра `PeerConnetion`;
- настроек для медиа.

```javascript
const [callFrom, setCallFrom] = useState('')
const [calling, setCalling] = useState(false)

const [showModal, setShowModal] = useState(false)

const [localSrc, setLocalSrc] = useState(null)
const [remoteSrc, setRemoteSrc] = useState(null)

const [pc, setPc] = useState(null)
const [config, setConfig] = useState(null)
```

Регистрируем обработку запроса на установку соединения:

```javascript
useEffect(() => {
 socket.on('request', ({ from }) => {
   // записываем `id` звонящего
   setCallFrom(from)
   // показываем модальное окно
   setShowModal(true)
 })
}, [])
```

Регистрируем обработку подготовки к подключению и завершения звонка:

```javascript
// регистрация обработчиков осуществляется только после создания
// экземпляра `PeerConnection` - это является критически важным
useEffect(() => {
 if (!pc) return

 socket
   // обработка подготовки к подключению
   // данные могут содержать предложение, ответ и кандидата ICE (в том числе, в виде пустой строки - нулевой кандидат)
   .on('call', (data) => {
     // если данные содержат описание
     if (data.sdp) {
       pc.setRemoteDescription(data.sdp)

       // если данные содержат предложение
       if (data.sdp.type === 'offer') {
         // генерируем ответ
         pc.createAnswer()
       }
     } else {
       // добавляем кандидата
       pc.addIceCandidate(data.candidate)
     }
   })
   // обработка завершения звонка
   .on('end', () => finishCall(false))
}, [pc])
```

Определяем метод для инициализации звонка:

```javascript
/*
 функция принимает 3 параметра:
 - является ли пользователь инициатором звонка
 - `id` адресата
 - настройки для медиа
*/
const startCall = (isCaller, remoteId, config) => {
 // скрываем модельное окно - для случая, когда мы принимаем звонок
 setShowModal(false)
 // отображаем индикатор подключения
 setCalling(true)
 // сохраняем настройки
 setConfig(config)

 // создаем экземпляр `PeerConnection`,
 // передавая ему `id` адресата
 const _pc = new PeerConnection(remoteId)
   // обработка получения локального потока
   .on('localStream', (stream) => {
     setLocalSrc(stream)
   })
   // обработка получения удаленного потока
   .on('remoteStream', (stream) => {
     setRemoteSrc(stream)
     // скрываем индикатор установки соединения
     setCalling(false)
   })
   // запускаем `PeerConnection`
   .start(isCaller, config)

 // записываем экземпляр `PeerConnection`
 // это приводит к регистрации обработчиков
 // подготовки к звонку и его завершения
 setPc(_pc)
}
```

Определяем метод для отклонения звонка:

```javascript
const rejectCall = () => {
 socket.emit('end', { to: callFrom })

 setShowModal(false)
}
```

Определяем метод для завершения звонка:

```javascript
const finishCall = (isCaller) => {
 // выполняем перезагрузку `WebRTC`
 pc.stop(isCaller)

 // обнуляем состояния
 setPc(null)
 setConfig(null)

 setCalling(false)
 setShowModal(false)

 setLocalSrc(null)
 setRemoteSrc(null)
}
```

И возвращаем разметку:

```javascript
return (
 <div className='app'>
   <h1>React WebRTC</h1>
   {/* начальный экран */}
   <MainWindow startCall={startCall} />
   {/* индикатор подключения */}
   {calling && (
     <div className='calling'>
       <button disabled>
         <BsPhoneVibrate />
       </button>
     </div>
   )}
   {/* модальное окно */}
   {showModal && (
     <CallModal
       callFrom={callFrom}
       startCall={startCall}
       rejectCall={rejectCall}
     />
   )}
   {/* экран коммуникации */}
   {remoteSrc && (
     <CallWindow
       localSrc={localSrc}
       remoteSrc={remoteSrc}
       config={config}
       mediaDevice={pc?.mediaDevice}
       finishCall={finishCall}
     />
   )}
 </div>
)
```

<spoiler title="Полный код рассматриваемого компонента:">

```javascript
import './styles/app.scss'

import { useState, useEffect } from 'react'
import { BsPhoneVibrate } from 'react-icons/bs'

import PeerConnection from './utils/PeerConnection'
import socket from './utils/socket'

import { MainWindow, CallWindow, CallModal } from './components'

export default function App() {
 const [callFrom, setCallFrom] = useState('')
 const [calling, setCalling] = useState(false)

 const [showModal, setShowModal] = useState(false)

 const [localSrc, setLocalSrc] = useState(null)
 const [remoteSrc, setRemoteSrc] = useState(null)

 const [pc, setPc] = useState(null)
 const [config, setConfig] = useState(null)

 useEffect(() => {
   socket.on('request', ({ from }) => {
     setCallFrom(from)
     setShowModal(true)
   })
 }, [])

 useEffect(() => {
   if (!pc) return

   socket
     .on('call', (data) => {
       if (data.sdp) {
         pc.setRemoteDescription(data.sdp)

         if (data.sdp.type === 'offer') {
           pc.createAnswer()
         }
       } else {
         pc.addIceCandidate(data.candidate)
       }
     })
     .on('end', () => finishCall(false))
 }, [pc])

 const startCall = (isCaller, remoteId, config) => {
   setShowModal(false)
   setCalling(true)
   setConfig(config)

   const _pc = new PeerConnection(remoteId)
     .on('localStream', (stream) => {
       setLocalSrc(stream)
     })
     .on('remoteStream', (stream) => {
       setRemoteSrc(stream)
       setCalling(false)
     })
     .start(isCaller, config)

   setPc(_pc)
 }

 const rejectCall = () => {
   socket.emit('end', { to: callFrom })

   setShowModal(false)
 }

 const finishCall = (isCaller) => {
   pc.stop(isCaller)

   setPc(null)
   setConfig(null)

   setCalling(false)
   setShowModal(false)

   setLocalSrc(null)
   setRemoteSrc(null)
 }

 return (
   <div className='app'>
     <h1>React WebRTC</h1>
     <MainWindow startCall={startCall} />
     {calling && (
       <div className='calling'>
         <button disabled>
           <BsPhoneVibrate />
         </button>
       </div>
     )}
     {showModal && (
       <CallModal
         callFrom={callFrom}
         startCall={startCall}
         rejectCall={rejectCall}
       />
     )}
     {remoteSrc && (
       <CallWindow
         localSrc={localSrc}
         remoteSrc={remoteSrc}
         config={config}
         mediaDevice={pc?.mediaDevice}
         finishCall={finishCall}
       />
     )}
   </div>
 )
}
```

</spoiler>

## Проверка работоспособности

Поднимаемся в корневую директорию (`react-webrtc`), инициализируем `Node.js-проект` и устанавливаем [`concurrently`](https://www.npmjs.com/package/concurrently) - утилиту для одновременного выполнения нескольких команд, определенных в `package.json`:

```bash
cd ..

yarn init -yp

yarn add concurrently
```

Определяем в `package.json` команду для запуска приложения в режиме для разработки:

```json
"scripts": {
 "dev": "concurrently \"yarn --cwd server dev\" \"yarn --cwd client dev\""
}
```

Открываем терминал и выполняем данную команду с помощью `yarn dev`.

Получаем сообщения о запуске сервера по адресу `http://localhost:4000` и клиента по адресу `http://localhost:3000`.

Открываем 2 вкладки браузера с клиентом:

<img src="https://habrastorage.org/webt/og/ce/_v/ogce_v2r7ekvtfh64t8s-f1x7ga.png" />
<br />

Копируем `id` с одной вкладки, вставляем его в поле `Your friend ID` в другой вкладке и нажимаем на иконку видеокамеры.

Браузер запрашивает наше разрешение на использование видеокамеры и микрофона. Предоставляем ему такое разрешение. В текущей вкладке появляется индикатор подключения, а в другой - уведомление о входящем звонке:

<img src="https://habrastorage.org/webt/ph/r0/z_/phr0z_twkfjpq6lgu_1t-ukj7xa.png" />
<br />

Принимаем звонок с видео. Появляется экран коммуникации:

<img src="https://habrastorage.org/webt/nh/zc/ta/nhzctavsre0xvefj5by9r8tq3d8.png" />
<br />

Переключаем видео и аудио, меняем положение элемента с локальным видео:

<img src="https://habrastorage.org/webt/-5/j5/xo/-5j5xoj9vknruqqye__ggcr51dm.png" />
<br />

И завершаем звонок.

Круто! Приложение работает, как ожидается.

Пожалуй, это все, чем я хотел поделиться с вами в данной статье.

Благодарю за внимание и happy coding!