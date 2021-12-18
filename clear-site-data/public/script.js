// импортируем утилиты
import simpleFetch from '/node_modules/very-simple-fetch/index.js'
import { openDB } from '/node_modules/idb/build/esm/index.js'

// определяем адреса серверов
const LOCALHOST_URL = 'http://localhost:3000'
const HEROKU_URL = 'https://hidden-sands-68187.herokuapp.com'

// записываем данные в локальное хранилище
// -> localStorage.setItem(key, value)
localStorage.setItem('local', 'some data from localhost')

// инициализируем БД
// и создаем хранилище объектов
// -> openDB(name, version, options)
const db = openDB('db', 1, {
  upgrade(db) {
    db.createObjectStore('store')
  }
})
// и записываем в нее данные
// -> db.put(objectStore, value, key)
const writeDataInDb = async () =>
  (await db).put('store', 'some data from localhost', 'indexed')
writeDataInDb()

// записываем данные в кеш
const cacheData = async () => {
  // получаем доступ к кешу или создаем его при отсутствии
  // -> caches.open(name)
  const cache = await caches.open('cache')
  // получаем данные от localhost и кешируем их
  // метод `add()` отправляет запрос и записывает ответ на него в кеш
  // -> cache.add(url)
  cache.add(`${LOCALHOST_URL}/get-data-for-cache`)
  // получаем данные от heroku
  cache.add(`${HEROKU_URL}/get-data-for-cache`)
}
cacheData()

// получаем куки с heroku
const getCookie = async () => {
  const { data } = await simpleFetch.get(`${HEROKU_URL}/get-cookie`, {
    credentials: 'include'
  })
  console.log(data)
}
getCookie()

// получаем ссылки на DOM-элементы
const boxLocalhost = document.querySelector('.localhost')
const msgLocalhost = boxLocalhost.querySelector('p')

const boxHeroku = document.querySelector('.heroku')
const msgHeroku = boxHeroku.querySelector('p')

// функция для выполнения операции
const runAction = async (url) => {
  // получаем данные
  const { data } = await simpleFetch.get(url, { credentials: 'include' })
  // и возвращаем сообщение
  return data.message
}

// регистрируем обработчик для отправки запросов к localhost
boxLocalhost.addEventListener('click', ({ target }) => {
  if (target.localName !== 'button') return

  runAction(`${LOCALHOST_URL}/${target.dataset.action}`).then((message) => {
    msgLocalhost.textContent = message
  })
})

// регистрируем обработчик для отправки запросов к heroku
boxHeroku.addEventListener(
  'click',
  ({
    target: {
      dataset: { action }
    }
  }) => {
    if (!action) return

    runAction(`${HEROKU_URL}/${action}`).then((message) => {
      msgHeroku.textContent = message
    })
  }
)
