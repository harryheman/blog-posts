import semver from 'semver'
import resolve from './resolve.js'
import * as log from './log.js'
import * as lock from './lock.js'
import { Obj } from './utils.js'

type DependencyStack = Array<{
  name: string
  version: string
  dependencies: Obj
}>

export interface PackageJson {
  dependencies?: Obj
  devDependencies?: Obj
}

// переменная `topLevel` предназначена для выравнивания (flatten)
// дерева пакетов во избежание их дублирования
const topLevel: {
  [name: string]: { version: string; url: string }
} = Object.create(null)

// переменная `unsatisfied` предназначена для аккумулирования конфликтов
const unsatisfied: Array<{ name: string; url: string; parent: string }> = []

// @ts-ignore
async function collectDeps(
  name: string,
  constraint: string,
  stack: DependencyStack = []
) {
  // извлекаем манифест пакета из `lock` по названию и версии
  const fromLock = lock.getItem(name, constraint)

  // получаем информацию о манифесте
  //
  // если манифест отсутствует в `lock`
  // получаем его из сети
  const manifest = fromLock || (await resolve(name))

  // выводим в терминал название разрешаемого пакета
  log.logResolving(name)

  // используем версию пакета,
  // которая ближе всего к семантическому диапазону
  //
  // если диапазон не определен,
  // используем последнюю версию
  const versions = Object.keys(manifest)
  const matched = constraint
    ? semver.maxSatisfying(versions, constraint)
    : versions.at(-1)
  if (!matched) {
    throw new Error('Cannot resolve suitable package.')
  }

  // если пакет отсутствует в `topLevel`
  if (!topLevel[name]) {
    // добавляем его
    topLevel[name] = { url: manifest[matched].dist.tarball, version: matched }
  // если пакет имеется в `topLevel` и удовлетворяет диапазону
  } else if (semver.satisfies(topLevel[name].version, constraint)) {
    // определяем наличие конфликтов
    const conflictIndex = checkStackDependencies(name, matched, stack)

    // пропускаем проверку зависимостей при наличии конфликта
    // это позволяет избежать возникновения циклических зависимостей
    if (conflictIndex === -1) return

    // из-за особенностей алгоритма, используемого `Node.js`
    // для разрешения модулей,
    // между зависимостями зависимостей могут возникать конфликты
    //
    // одним из решений данной проблемы
    // является получение информации о двух предыдущих зависимостях зависимости,
    // конфликтующих между собой
    unsatisfied.push({
      name,
      parent: stack
        .map(({ name }) => name)
        .slice(conflictIndex - 2)
        .join('/node_modules/'),
      url: manifest[matched].dist.tarball
    })
  // если пакет уже содержится в `topLevel`
  // но имеет другую версию
  } else {
    unsatisfied.push({
      name,
      parent: stack.at(-1)!.name,
      url: manifest[matched].dist.tarball
    })
  }

  // не забываем о зависимостях зависимости
  const dependencies = manifest[matched].dependencies || null

  // записываем манифест в `lock`
  lock.updateOrCreate(`${name}@${constraint}`, {
    version: matched,
    url: manifest[matched].dist.tarball,
    shasum: manifest[matched].dist.shasum,
    dependencies
  })

  // собираем зависимости зависимости
  if (dependencies) {
    stack.push({
      name,
      version: matched,
      dependencies
    })
    await Promise.all(
      Object.entries(dependencies)
        // предотвращаем циклические зависимости
        .filter(([dep, range]) => !hasCirculation(dep, range, stack))
        .map(([dep, range]) => collectDeps(dep, range, stack.slice()))
    )
    // удаляем последний элемент
    stack.pop()
  }

  // возвращаем семантический диапазон версии
  // для добавления в `package.json`
  if (!constraint) {
    return { name, version: `^${matched}` }
  }
}

// данная функция определяет наличие конфликтов в зависимостях зависимости
const checkStackDependencies = (
  name: string,
  version: string,
  stack: DependencyStack
) =>
  stack.findIndex(({ dependencies }) =>
    // если пакет не является зависимостью другого пакета,
    // возвращаем `true`
    !dependencies[name] ? true : semver.satisfies(version, dependencies[name])
  )

// данная функция определяет наличие циклической зависимости
// если пакет содержится в стеке и имеет такую же версию
// значит, речь идет о циклической зависимости
const hasCirculation = (name: string, range: string, stack: DependencyStack) =>
  stack.some(
    (item) => item.name === name && semver.satisfies(item.version, range)
  )

// наша программа поддерживает только поля
// `dependencies` и `devDependencies`
export default async function list(rootManifest: PackageJson) {
  // добавляем в `package.json` названия и версии пакетов

  // обрабатываем производственные зависимости
  if (rootManifest.dependencies) {
    ;(
      await Promise.all(
        Object.entries(rootManifest.dependencies).map((pair) =>
          collectDeps(...pair)
        )
      )
    )
      .filter(Boolean)
      .forEach(
        (item) => (rootManifest.dependencies![item!.name] = item!.version)
      )
  }

  // обрабатываем зависимости для разработки
  if (rootManifest.devDependencies) {
    ;(
      await Promise.all(
        Object.entries(rootManifest.devDependencies).map((pair) =>
          collectDeps(...pair)
        )
      )
    )
      .filter(Boolean)
      .forEach(
        (item) => (rootManifest.devDependencies![item!.name] = item!.version)
      )
  }

  // возвращаем пакеты верхнего уровня и пакеты с конфликтами
  return { topLevel, unsatisfied }
}
