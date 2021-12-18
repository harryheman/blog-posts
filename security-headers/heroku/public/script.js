// политика доверенных типов
let policy
if (window.trustedTypes && trustedTypes.createPolicy) {
  policy = trustedTypes.createPolicy('escapePolicy', {
    createHTML: (str) => str.replace(/\</g, '&lt').replace(/>/g, '&gt')
  })
}

// утилиты
// для получения ссылки на DOM-элемент
const getEl = (selector, parent = document) => parent.querySelector(selector)
// для форматирования даты и времени
const getDate = (options, locale = 'ru-RU', date = Date.now()) =>
  new Intl.DateTimeFormat(locale, options).format(date)
// для регистрации обработчика (по умолчанию одноразового и запускающего колбэк при возникновении события `click`)
const on = (el, cb, event = 'click', options = { once: true }) =>
  el.addEventListener(event, cb, options)

// DOM-элементы
const containerEl = getEl('.container')
const dateEl = getEl('.date', containerEl)
const timeEl = getEl('.time', containerEl)
const stopBtnEl = getEl('.btn-stop', containerEl)
const addBtnEl = getEl('.btn-add', containerEl)
const getBtnEl = getEl('.btn-get', containerEl)

// настройки для даты
const dateOptions = {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
}
// настройки для времени
const timeOptions = {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric'
}

// добавляем текущую дату в качестве текстового содержимого соответствующего элемента
dateEl.textContent = getDate(dateOptions)
// добавляем текущее время в качестве текстового содержимого соответствующего элемента каждую секунду
const timerId = setInterval(() => {
  timeEl.textContent = getDate(timeOptions)
}, 1000)

// колбэки для обработчиков (в каждом колбэке происходит удаление соответствующей кнопки)
// для остановки таймера
const stopTimer = () => {
  clearInterval(timerId)
  stopBtnEl.remove()
}
// для добавления HTML-шаблона с потенциально вредоносным кодом
const addTemplate = () => {
  const evilTemplate = `<script src="https://evil.com/steal-data.min.js"></script>`
  // при попытке вставить необезвреженный шаблон будет выброшено исключение
  // Uncaught TypeError: Failed to execute 'insertAdjacentHTML' on 'Element': This document requires 'TrustedHTML' assignment.
  containerEl.insertAdjacentHTML('beforeend', policy.createHTML(evilTemplate))
  addBtnEl.remove()
}
// для получения HTTP-заголовков
const getHeaders = () => {
  const req = new XMLHttpRequest()
  req.open('GET', location, false)
  req.send(null)
  const headers = req.getAllResponseHeaders()
  const preEl = document.createElement('pre')
  preEl.textContent = headers
  containerEl.append(preEl)
  getBtnEl.remove()
}

// регистрируем обработчики
on(stopBtnEl, stopTimer)
on(addBtnEl, addTemplate)
on(getBtnEl, getHeaders)
