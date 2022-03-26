# Imgproxy + Service Worker API + Cache API :metal:

Let's rock!

В этой статье я хочу поделиться с вами результатами небольшого эксперимента, связанного с ускорением загрузки изображений с помощью [Imgproxy](https://imgproxy.net/), [Cache API](https://developer.mozilla.org/ru/docs/Web/API/Cache) (далее - кеш) и [Service Worker API](https://developer.mozilla.org/ru/docs/Web/API/Service_Worker_API) (далее - СВ).

Мы с вами разработаем простое приложение на [React](https://ru.reactjs.org/), в котором используется несколько изображений, и добьемся того, что загружаемые изображения будут более чем в 10 раз легче (меньше по размеру) оригиналов (`imgproxy`), а также практически мгновенной загрузки (доставки) изображений (СВ и кеш).

_Обратите внимание_: в части, касающейся `imgproxy`, особых препятствий на пути использования рассматриваемого в статье подхода к загрузке изображений в продакшне нет, но в части, касающейся СВ, следует проявлять крайнюю осторожность, поскольку данная технология является экспериментальной - это означает, что поведение СВ во многом определяется конкретной реализацией (браузером), что в ряде случаев делает его довольно непредсказуемым. Возможно, для кеширования изображений лучше предпочесть старые-добрые `HTTP-заголовки` [Cache-Control](https://developer.mozilla.org/ru/docs/Web/HTTP/Headers/Cache-Control) и [Etag](https://developer.mozilla.org/ru/docs/Web/HTTP/Headers/ETag). Но эксперимент на то и эксперимент, чтобы, в том числе, искать новые ответы на старые вопросы.

_Обратите внимание_: для успешного прохождения туториала на вашей машине должны быть установлены [Node.js](https://nodejs.org/en/) и [Docker](https://www.docker.com/products/docker-desktop).

Создаем директорию, переходим в нее, и создаем шаблон `React-приложения` с помощью [Vite](https://vitejs.dev/):

```bash
mkdir imgproxy-cache
cd imgproxy-cache

# client - название директории клиента
# --template react - название используемого шаблона
yarn create vite client --template react
# or
npm create vite ...
```

Создаем директорию для медиафайлов (`media`) и внутри нее директорию для изображений (`images`):

```bash
mkdir media media/images
```

Помещаем в директорию `images` 3 изображения:

<img src="https://habrastorage.org/webt/sx/jf/xt/sxjfxtwlse8ub5tuercojzbw_ni.jpeg" />
<br />
<img src="https://habrastorage.org/webt/dp/ur/xe/dpurxeag2krlcxixnraqfnqyiog.jpeg" />
<br />
<img src="https://habrastorage.org/webt/5u/rp/oo/5urpoocikifnjlc_ze1uhdsohm8.jpeg" />
<br />

Характеристики этих изображений следующие:

- `1.jpeg`: размер - `1880 x 1256`, вес - `594 КБ`, формат - `JPEG`;
- `2.jpeg`: размер - `1880 x 1255`, вес - `283 КБ`, формат - `JPEG`;
- `fallback.jpeg`: размер - `1880 x 1253`, вес - `143 КБ`, формат - `JPEG`.

Создаем файл `docker-compose.yml` с настройками сервиса `imgproxy`:

```yml
# версия docker
version: '3.9'
services:
  # название сервиса
  imgproxy:
    # образ
    image: darthsim/imgproxy:v3.3.0
    # файл с переменными среды окружения
    env_file:
      - .env
    # название контейнера
    container_name: ${APP_NAME}_imgproxy
    # портом по умолчанию, на котором запускается `imgproxy`, является 8080
    ports:
      - 8080:8080
    # том
    volumes:
      - ./media:/media
    # политика перезапуска контейнера
    restart: on-failure
```

Создаем файл `.env` следующего содержания:

```bash
# название приложения
APP_NAME=my-app
# это пригодится нам при "контейнеризации" клиента
NODE_VERSION=16.13.1

# imgproxy
IMGPROXY_PATH_PREFIX=/imgproxy
IMGPROXY_ALLOW_ORIGIN=http://localhost:3000
IMGPROXY_ALLOWED_SOURCES=local://
IMGPROXY_LOCAL_FILESYSTEM_ROOT=/media
IMGPROXY_FALLBACK_IMAGE_PATH=/media/images/fallback.jpeg
IMGPROXY_ENFORCE_WEBP=true
```

Рассмотрим переменные для `imgproxy`:

- `IMGPROXY_PATH_PREFIX` - префикс пути, по которому будет доступен `imgproxy`: `http://localhost:8080/imgproxy`;
- `IMGPROXY_ALLOW_ORIGIN` - разрешенный источник (протокол, домен и порт): только этот источник будет иметь доступ к `imgproxy` (это позволяет в какой-то мере обеспечить секьюрность);
- `IMGPROXY_ALLOWED_SOURCES` - разрешенные источники изображений: в данном случае разрешена загрузка только изображений, находящихся в локальной файловой системе;
- `IMGPROXY_LOCAL_FILESYSTEM_ROOT` - директория в локальной файловой системе, из которой загружаются изображения (`/media`);
- `IMGPROXY_FALLBACK_IMAGE_PATH` - путь к резервному изображению: данное изображение возвращается при запросе отсутствующего файла;
- `IMGPROXY_ENFORCE_WEBP` - если браузер пользователя поддерживает [WebP](https://ru.wikipedia.org/wiki/WebP), возвращается изображение в этом формате.

С полным списком переменных среды окружения для `imgproxy` можно ознакомиться [здесь](https://docs.imgproxy.net/configuration).

Поднимаем сервис с помощью команды `docker compose up -d`:

<img src="https://habrastorage.org/webt/6n/sq/nj/6nsqnj1ykqcatnljechrvfwbg7q.png" />
<br />
<img src="https://habrastorage.org/webt/xy/ek/zt/xyekztx-rvrvxnr7gzuinrrq48q.png" />
<br />

Видим, что сервис `imgproxy-and-cache-api` с контейнером `my-app_imgproxy` успешно запущен.

К слову, для остановки сервиса используется команда `docker compose stop`, а для удаления сервиса - `docker compose rm`.

Теперь займемся клиентом.

Структура директории `client/src` будет следующей:

```
src
  utils
    image.utils.js
  App.css
  App.jsx
  main.jsx
```

Реализуем утилиту для формирования валидного с точки зрения `imgproxy` пути к изображению (`utils/image.utils.js`):

```javascript
const BASE_IMAGE_URL = 'http://localhost:8080/imgproxy/insecure'

// rt - это тип масштабирования изображения (resize type)
export const getImageUrl = ({ rt = 'fill', width = 480, height = 320, src = 'fallback.jpeg' }) =>
  `${BASE_IMAGE_URL}/rs:${rt}:${width}:${height}/plain/local:///images/${src}`
```

В пути мы определяем тип масштабирования (заполнение контейнера), ширину и высоту изображения. В остальном мы полагаемся на дефолтные настройки `imgproxy`.

_Обратите внимание_: мы можем опустить `/media`, поскольку определили `IMGPROXY_LOCAL_FILESYSTEM_ROOT`.

Если мы передадим данной утилите `src: '1.jpeg'`, то на выходе получим `http://localhost:8080/imgproxy/insecure/rs:fill:480:320/plain/local:///images/1.jpeg`.

Подробнее о генерации пути к изображению для `imgproxy` можно почитать [здесь](https://docs.imgproxy.net/generating_the_url).

_Обратите внимание_: мы используем небезопасный способ получения изображений (`insecure`) (не считая того, что мы определили `IMGPROXY_ALLOW_ORIGIN`). О добавлении в путь подписи (signature) можно почитать [здесь](https://docs.imgproxy.net/signing_the_url), а пример функции на `JavaScript` для генерации подписи можно найти [здесь](https://github.com/imgproxy/imgproxy/blob/master/examples/signature.js).

Рассмотрим основной компонент приложения (`App.jsx`):

```javascript
import './App.css'
// импортируем утилиту для формирования пути к изображению
import { getImageUrl } from './utils/image.utils'

function App() {
  return (
    <div className='App'>
      <h1>Imgproxy &amp; Cache API</h1>
      <div className='images'>
        <figure>
          <img src={getImageUrl({ src: '1.jpeg' })} alt='' />
          <figcaption>First image</figcaption>
        </figure>

        <figure>
          <img src={getImageUrl({ src: '2.jpeg', width: 320 })} alt='' />
          <figcaption>Second image with custom width</figcaption>
        </figure>

        <figure>
          <img src={getImageUrl({ src: '3.jpeg' })} alt='' />
          <figcaption>Fallback image</figcaption>
        </figure>
      </div>
    </div>
  )
}

export default App
```

В разметке мы пытаемся получить 3 изображения:

- `1.jpeg` с дефолтными настройками;
- `2.jpeg` с кастомной шириной;
- несуществующее изображение `3.jpeg`.

Находясь в директории `client`, выполняем команду `yarn dev` для запуска приложения и открываем вкладку браузера по адресу `http://localhost:3000`.

<img src="https://habrastorage.org/webt/nt/vf/ud/ntvfudek1aaw07cmnacs_wxxorc.png" />
<br />

Видим, что изображения успешно загрузились. Причем, второе изображение квадратное, а вместо несуществующего файла `imgproxy` вернул резервное изображение (`fallback.jpeg`).

Откроем инструменты разработчика, перейдем на вкладку `Network` и выберем `Img`:

<img src="https://habrastorage.org/webt/qa/oi/ck/qaoickzvfhginqx3v_jfok7la-s.png" />
<br />

_Обратите внимание_ на поля `Type` и `Size`: `imgproxy` вернул изображения в формате `WebP` и весят они более чем в 10 раз меньше оригиналов: `42.7`, `21.4` и `10.9` Кб. Что касается размеров изображений, то они соответствуют заданным настройкам: `480x320`, `320x320` и `480x320`.

Изучим подробности какого-нибудь ответа `imgproxy`, например, для `1.jpeg`.

<img src="https://habrastorage.org/webt/7m/6_/xi/7m6_xitnmxrn7qblasrotqbraay.png" />
<br />

Здесь нас интересуют следующие поля:

- `Request URL` - путь к изображению, сформированный нашей утилитой;
- `Content-Length` - размер изображения;
- `Content-Type` - формат изображения;
- `Accept` - по этому заголовку `imgproxy` определяет поддержку форматов изображений браузером пользователя.

Таким образом, мы успешно решили первую часть задачи: добились уменьшения размеров изображений более чем в 10 раз и преобразования их форматов в `WebP`. Однако если изучить значения поля `Time` на вкладке `Network`, то мы увидим, что время загрузки изображений составляет `300-600 мс`. Допустим, что такое время является для нас неприемлемым. Что мы можем сделать, чтобы его уменьшить?

Ответ - кешировать изображения при первоначальном запуске приложения и впоследствии доставлять изображения из кеша. Существует несколько способов это сделать. Я решил прибегнуть к помощи СВ.

Сервис-воркер - это своего рода посредник между клиентом и сервером. Он может перехватывать `HTTP-запросы`, имеет доступ к `Cache API` и может общаться с приложением через [Channel Messaging API](https://developer.mozilla.org/en-US/docs/Web/API/Channel_Messaging_API). За счет кеширования критически важных для работы приложения ресурсов можно добиться того, что приложение будет работать даже при отсутствии подключения к сети (в режиме офлайн).

Рекомендую полистать [соответствующую спецификацию](https://w3c.github.io/ServiceWorker/).

Зарегистрируем СВ для нашего приложения. Для этого в `client/index.html` добавляем такие строки:

```html
<script type="module" src="/src/main.jsx"></script>
<!-- ! -->
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(console.error)
  }
</script>
```

Здесь мы проверяем поддержку СВ браузером и запускаем выполнение кода из файла `sw.js`.

Для того, чтобы наш СВ попал в сборку приложения, необходимо немного настроить `vite`. Для этого добавляем такую строку в `vite.config.js`:

```javascript
export default defineConfig({
  // !
  publicDir: './sw',
  plugins: [react()]
})
```

Здесь мы сообщаем `vite`, что директория `sw` содержит статические файлы нашего приложения. Создаем эту директорию и в ней файл `sw.js` следующего содержания:

```javascript
// название кеша
// для инвалидации кеша достаточно изменить это название,
// например, на my-app_images-v2
const CACHE_NAME = 'my-app_images-v1'

// обработка активации нового СВ
// удаляем старый кеш - кеш с другими названиями (например, предыдущей версии)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          // не трогаем не наш кеш
          if (key.includes('my-app-images') && key !== CACHE_NAME) {
            return caches.delete(key)
          }
        })
      )
    )
  )
  self.clients.claim()
})

// обрабатываем выполнение запроса из приложения (перехват запроса)
self.addEventListener('fetch', (event) => {
  // извлекаем путь из объекта запроса
  const { url } = event.request
  // извлекаем название пути из разобранного пути запроса
  const { pathname } = new URL(url)

  // если название пути включает слово `imgproxy`
  if (pathname.includes('imgproxy')) {
    console.log(pathname)
    // возвращаем ответ
    event.respondWith(
      caches
        // проверяем наличие в кеше ответа для данного названия пути
        .match(pathname)
        .then(async (response) => {
          // если такой ответ имеется
          if (response) {
            console.log('Image from cache')
            // возвращаем его
            return response
          }
          // если ответа в кеше для данного названия пути нет
          // выполняем запрос к `imgproxy`
          return fetch(event.request).then((response) =>
            // открываем наш кеш
            caches.open(CACHE_NAME).then((cache) => {
              // записываем ответ от `imgproxy` в кеш
              cache.put(pathname, response.clone())
              // и возвращаем ответ
              return response
            })
          )
        })
        .catch(console.error)
    )
  }
})
```

Посмотрим, как это работает (и работает ли?).

Перезапускаем сервер для клиента.

<img src="https://habrastorage.org/webt/on/wl/ay/onwlayrxhr1pjzqcjqzspoykgrm.png" />
<br />

Изображения загружаются. В консоли имеются сообщения от СВ с названиями путей, содержащими `imgproxy`.

На вкладке `Network` можно увидеть, что запросы перехватываются СВ (почему-то в поле `Size`):

<img src="https://habrastorage.org/webt/z7/qn/zz/z7qnzzlmf0qi9--5ug_kfrzxpwa.png" />
<br />

_Обратите внимание_: самым простым способом очистить кеш и "убить" СВ является нажатие кнопки `Clear site data` на вкладке `Application` в разделе `Storage` (убедитесь в наличии галочки у `Unregister service workers` в разделе `Application`):

<img src="https://habrastorage.org/webt/qa/pk/kj/qapkkjtnjytxxsieitrsg3s8xlg.png" />
<br />

Перезагружаем вкладку браузера:

<img src="https://habrastorage.org/webt/az/xr/bp/azxrbpmauseorm8181dmchypk7i.png" />
<br />
<img src="https://habrastorage.org/webt/e9/so/sl/e9soslbz-4bp9hxrhvrcgezmyec.png" />
<br />

Получаем от СВ сообщения о доставке изображений из кеша. На вкладке `Network` видим, что изображения загружаются практически мгновенно (`3-5 мс`). Кажется, что мы успешно решили вторую часть задачи. Не совсем.

__Особенность номер один__

Если изучить подробности выполнения запроса на вкладке `Network`, можно заметить отсутствие заголовка запроса `Accept`. Что это означает? Это означает риск того, что `imgproxy` будет возвращать изображения в формате `WebP` даже для тех браузеров, которые данный формат не поддерживают (потому что мы определили `IMGPROXY_ENFORCE_WEBP=true`). Это может закончиться тем, что браузер получит изображения, но не сможет их отрендерить. В чем причина отсутствия заголовка `Accept` в запросе?

<img src="https://habrastorage.org/webt/e9/so/sl/e9soslbz-4bp9hxrhvrcgezmyec.png" />
<br />

На самом деле все просто. Наши запросы перехватываются и выполняются СВ. Если на вкладке `Network` выбрать `Fetch/XHR`, то можно увидеть дублирующиеся запросы, выполняемые СВ, в которых заголовок `Accept` присутствует:

<img src="https://habrastorage.org/webt/kv/mg/pz/kvmgpztbcjqipedo5vss3fqiq4c.png" />
<br />

Здесь есть один интересный момент.

Посмотрим на ответ, который возвращается `imgproxy`. Для этого добавим такую строку в `sw.js`:

```javascript
return fetch(event.request).then((response) =>
  caches.open(CACHE_NAME).then((cache) => {
    // !
    console.log(response)
    cache.put(pathname, response.clone())
    return response
  })
)
```

Выполняем запросы:

<img src="https://habrastorage.org/webt/gl/mx/y0/glmxy0kooq7x-xgtyjpkiebjie0.png" />
<br />

Получаем в консоли странные объекты ответов с непрозрачным типом (`type: 'opaque'`) и `ok: false`. К слову, если мы установим ограничение на запись в кеш только успешных запросов (в ответ на которые возвращаются ответы с `ok: true`):

```javascript
return fetch(event.request).then((response) =>
  caches.open(CACHE_NAME).then((cache) => {
    console.log(response)
    // !
    if (response.ok) {
      cache.put(pathname, response.clone())
    }
    return response
  })
)
```

То наши изображения не будут кешироваться.

Если не вдаваться в подробности, суть здесь вот в чем: запрос на получение изображения выполняется с `mode: 'no-cors'` и `credentials: include`. В большинстве случаев это хорошо, поскольку позволяет получать изображения из других источников без настройки [CORS](https://developer.mozilla.org/ru/docs/Web/HTTP/CORS). Когда браузер при разборе `html` встречает тег `img`, он выполняет `fetch` по адресу, указанному в `src`. При этом браузер автоматически формирует заголовок запроса `Accept`, в том числе, на основе значения поля `destination` объекта запроса (для `img` поле `destination` имеет значение `image`). В ответ на запрос с такими настройками возвращаются непрозрачные ответы.

Существует ли какой-то способ получить нормальные объекты ответов? Мы можем попробовать определить (перезаписать) настройки `mode` и `credentials` при выполнении `fetch` в СВ:

```javascript
// !
return fetch(event.request, {
  mode: 'cors',
  credentials: 'omit'
}).then((response) =>
  caches.open(CACHE_NAME).then((cache) => {
    console.log(response)
    if (response.ok) {
      cache.put(pathname, response.clone())
    }
    return response
  })
)
```

<img src="https://habrastorage.org/webt/ec/yz/jj/ecyzjjdzppnngtizertix5knprk.png" />
<br />

Теперь при выполнении запросов мы получаем ответы с `type: 'cors'` и `ok: true`. Это означает, что теперь ответы соответствуют условию `if (response.ok)` и изображения будут кешироваться. К слову, проверка `cors` при выполнении запроса на получение изображения от `imgproxy` вполне согласуется с `IMGPROXY_ALLOW_ORIGIN=http://localhost:3000`.

Еще один интересный момент.

Если мы поместим в директорию `images` фавиконку `favicon.png`:

<img src="https://habrastorage.org/webt/sh/m3/79/shm379qsp2jzbe0mqyenn_jwaxq.png" />
<br />

И выполним запрос на ее получение в приложении (`App.jsx`):

```javascript
useEffect(() => {
  // шаблон фавиконки
  const faviconTemplate = `<link rel="icon" href=${getImageUrl({
    src: 'favicon.png',
    width: 64,
    height: 64
  })} />`

  // HTML-элемент `link`
  const favicon$ = new Range().createContextualFragment(faviconTemplate)
    .children[0]
  // вставляем фавиконку в `head`
  document.head.append(favicon$)
}, [])
```

То к своему удивлению обнаружим, что фавиконка не кешируется, а каждый раз запрашивается у `imgproxy`. Судя по тому, что мы не получаем путь к фавиконке в консоли (от СВ), при ее запросе используется какой-то другой механизм, нежели `fetch` (поскольку события `fetch` не возникает, СВ не может перехватить запрос на получение фавиконки).

Двигаемся дальше.

__Особенность номер два__

В режиме для разработки приложение работает, как ожидается. Но будет ли оно работать также в производственном режиме.

Установим [serve](https://www.npmjs.com/package/serve) для обслуживания сборки клиента:

```bash
yarn add serve
# or
npm i serve
```

И добавим команду для сборки клиента и запуска `serve` в `package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "start": "yarn build && serve -s dist -p 3000"
}
```

Команда `start` выполняет сборку клиента (с помощью `vite`) и запускает обслуживание статических файлов из директории `dist` по адресу `http://localhost:3000`.

Давайте "контейнеризуем" нашего клиента. Для этого создаем в директории `client` файл `Dockerfile` следующего содержания:

```bash
# дефолтная версия `Node.js`
ARG NODE_VERSION=16.13.1

FROM node:$NODE_VERSION

# рабочая директория
WORKDIR /client

# копируем указанные файлы
COPY package.json yarn.lock ./

# устанавливаем зависимости
RUN yarn

# копируем все остальное
COPY . .

# выполняем сборку и запускаем `serve`
CMD ["yarn", "start"]
```

Определяем настройки сервиса `client` в `docker-compose.yml`:

```yml
version: '3.9'
services:
  imgproxy:
    image: darthsim/imgproxy:v3.3.0
    env_file:
      - .env
    container_name: ${APP_NAME}_imgproxy
    ports:
      - 8080:8080
    volumes:
      - ./media:/media
    restart: on-failure
  # !
  client:
    env_file:
      - .env
    container_name: ${APP_NAME}_client
    # сборка выполняется на основе `Dockerfile` из директории `client`
    build: client
    ports:
      - 3000:3000
    restart: on-failure
```

Запускаем (перезапускаем) сервис с помощью команды `docker compose up -d`:

<img src="https://habrastorage.org/webt/7b/dz/eg/7bdzege5hpxdsfpztx83lq9nbpk.png" />
<br />

Видим, что наш сервис теперь состоит из двух контейнеров: `my-app_imgproxy` и `my-app_client`. Клиент, как и прежде, доступен по адресу `http://localhost:3000`.

Запускаем приложение. Изображения загружаются, СВ регистрируется.

Перезагружаем вкладку браузера. Мы ожидаем, что наши изображения будут доставлены из кеша, но этого не происходит!

Перезагружаем вкладку еще раз:

<img src="https://habrastorage.org/webt/os/sz/qg/osszqgkccz8ho2r0fbtanlj_2fy.png" />
<br />

Теперь изображения доставляются из кеша, но это не совсем то, что мы хотим. Мы хотим, чтобы изображения кешировались после первого запуска приложения. Почему этого не происходит?

Опять же, если не вдаваться в подробности, суть такая: код СВ выполняется в фоновом режиме и асинхронно, поэтому СВ просто не успевает активироваться (activate) до выполнения запросов на получение изображений при первом запуске приложения. При повторном запуске СВ активирован (activated), перехватывает запросы и помещает изображения в кеш. При третьем запуске СВ активирован, перехватывает запросы и возвращает изображения из кеша.

Следовательно, нам необходимо дождаться активации СВ перед первым рендерингом приложения или хотя бы перед выполнением запросов на получение изображений. Существует как минимум 2 способа это сделать:

- рендерить все приложение после активации сервис воркера (я выбрал это решение; нашел я его [здесь](https://stackoverflow.com/questions/61430024/how-do-i-load-a-service-worker-before-all-other-requests));
- рендерить разный контент приложения в зависимости от ожидания/получения от СВ сообщения о его активации через `Channel Messaging API` (это решение показалось мне слишком громоздким; пример данного решения можно найти [здесь](https://habr.com/ru/post/351194/) (см. комментарии)).

Для того, чтобы рендеринг приложения происходил только после активации СВ необходимо немного переписать код, содержащийся в файле `client/main.jsx`:

```javascript
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

// выносим рендеринг приложения в отдельную функцию
const render = () =>
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  )

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('./sw.js')
    .then((reg) => {
      // если происходит установка СВ
      if (reg.installing) {
        // получаем устанавливаемый СВ
        const sw = reg.installing || reg.waiting
        // обрабатываем изменения состояния СВ
        sw.onstatechange = () => {
          // рендерим приложение после активации СВ
          if (sw.state === 'activated') {
            render()
          }
        }
      } else {
        // если СВ уже установлен, просто рендерим приложение
        render()
      }
    })
    .catch(console.error)
} else {
  // если СВ не поддерживается браузером, рендерим приложение
  render()
}
```

Соответственно, в `index.html` можно удалить эти строки:

```html
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(console.error)
  }
</script>
```

Выполняем команду `docker compose up -d`.

Теперь кеширование изображений происходит при первом запуске приложения, в чем можно убедиться, запустив приложение и перезагрузив вкладку браузера.

<img src="https://habrastorage.org/webt/hx/tp/ke/hxtpkez7t75od-uxvccf_trqvhy.png" />
<br />

Таким образом, мы успешно решили обе задачи: добились уменьшения размера изображений более чем в 10 раз и преобразования формата изображений в `WebP`, а также практически мгновенной загрузки изображений при втором и последующих запусках приложения.

The End.