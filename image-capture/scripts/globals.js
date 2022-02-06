// утилиты
// получаем элемент по селектору
const $ = (selector, parent = document) => parent.querySelector(selector)
// создаем элемент
/*
const create = (tag, attrs, children) => {
  if (typeof tag !== 'string') return
  const $ = document.createElement(tag)

  if (attrs) {
    if (typeof attrs !== 'object') return

    for (const k in attrs) {
      const v = attrs[k]

      if (k === 'class') {
        $.className = v
        continue
      }

      if (k === 'style' && typeof v === 'object') {
        Object.assign($.style, v)
        continue
      }

      if (k === 'text') {
        $.textContent = v
        continue
      }

      $[k] = v
    }
  }

  if (Array.isArray(children) && children.length > 0) {
    children.forEach(([tag, attrs, children]) => {
      $.append(create(tag, attrs, children))
    })
  }

  return $
}
*/
const create$ = (template) => {
  if (typeof template !== 'string') return
  return new Range().createContextualFragment(template).children[0]
}
// рендерим элемент
const render$ = (parent, child, place = 'beforeend') => {
  parent.insertAdjacentElement(place, child)
}
// добавляем атрибуты
// `attrs` - объект
// ключи объекта - названия атрибутов
// значения ключей - значения атрибутов
const setAttrs = ($, attrs) => {
  if (attrs && (typeof attrs !== 'object' || Array.isArray(attrs))) return
  Object.keys(attrs).forEach((key) => {
    $.setAttribute(key, attrs[key])
  })
}
// удаляем атрибуты
// `attrs` - массив
// элементы массива - названия атрибутов
const removeAttrs = ($, attrs) => {
  if (!Array.isArray(attrs)) return
  attrs.forEach((name) => {
    $.removeAttribute(name)
  })
}

// DOM-элементы
const loader$ = $('.lds-roller')
const app$ = $('#app')
const video$ = $('video')
const image$ = $('.result img')
const photoLink$ = $('.photo-link')
const canvas$ = $('.result canvas')
const canvasLink$ = $('.canvas-link')
const controls$ = $('.controls')
const grabFrame$ = $('.grab-frame')
const removePhoto$ = $('.remove-photo')
const clearCanvas$ = $('.clear-canvas')
const settings$ = $('.settings')

// хранилище для инпутов
const inputs$ = []
// контекст рисования
const ctx = canvas$.getContext('2d')
// видеотрек, экземпляр `ImageCapture` и источник фото
let videoTrack
let imageCapture
let photoSrc

// настройки для фото
const settingDictionary = {
  brightness: 'Яркость',
  colorTemperature: 'Цветовая температура',
  contrast: 'Контрастность',
  saturation: 'Насыщенность',
  sharpness: 'Резкость',
  pan: 'Панорамирование',
  tilt: 'Наклон',
  zoom: 'Масштаб'
}
