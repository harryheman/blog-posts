import { findUp } from 'find-up'
import fs from 'fs-extra'
import yaml from 'js-yaml'
import { Manifest } from './resolve.js'
import { Obj } from './utils.js'

interface Lock {
  // название пакета
  [index: string]: {
    // версия
    version: string
    // путь к тарбалу
    url: string
    // хеш-сумма (контрольная сумма) файла
    shasum: string
    // зависимости
    dependencies: { [dep: string]: string }
  }
}

// находим lock-файл
const lockPath = (await findUp('my-yarn.yml'))! || './my-yarn.yml'

// зачем нам 2 отдельных `lock`?
// это может быть полезным при удалении пакетов

// кроме того, при добавлении или удалении пакетов
// `lock` может обновляться автоматически

// старый `lock` предназначен только для чтения
const oldLock: Lock = Object.create(null)

// новый `lock` предназначен только для записи
const newLock: Lock = Object.create(null)

// записываем информацию о пакете в `lock`
export function updateOrCreate(name: string, info: Obj) {
  if (!newLock[name]) {
    newLock[name] = Object.create(null)
  }

  Object.assign(newLock[name], info)
}

// извлекаем информацию о пакете по его названию и версии (семантическому диапазону)
// обратите внимание, что мы не возвращаем данные,
// а форматируем их для того,
// чтобы структура данных соответствовала реестру пакетов (`npm`)
// это позволяет сохранить логику функции `collectDeps`
// из модуля `list`
export function getItem(name: string, constraint: string): Manifest | null {
  // извлекаем элемент `lock` по ключу,
  // формат которого вдохновлен `yarn.lock`
  const item = oldLock[`${name}@${constraint}`]

  if (!item) {
    return null
  }

  // преобразуем структуру данных
  return {
    [item.version]: {
      dependencies: item.dependencies,
      dist: { tarball: item.url, shasum: item.shasum }
    }
  }
}

// читаем `lock`
export async function readLock() {
  if (await fs.pathExists(lockPath)) {
    Object.assign(oldLock, yaml.load(await fs.readFile(lockPath, 'utf-8')))
  }
}

// сохраняем `lock`
export async function writeLock() {
  // необходимость сортировки ключей обусловлена тем,
  // что при каждом использовании менеджера
  // порядок пакетов будет разным
  //
  // сортировка может облегчить сравнение версий `lock` с помощью `git diff`
  await fs.writeFile(
    lockPath,
    yaml.dump(newLock, { sortKeys: true, noRefs: true })
  )
}
