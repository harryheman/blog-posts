import fs from 'fs-extra'
import { findUp } from 'find-up'
import yargs from 'yargs'
import * as utils from './utils.js'
import list, { PackageJson } from './list.js'
import install from './install.js'
import * as log from './log.js'
import * as lock from './lock.js'

export default async function main(args: yargs.Arguments) {
  // находим и читаем `package.json`
  const jsonPath = (await findUp('package.json'))!
  const root = await fs.readJson(jsonPath)

  // собираем новые пакеты, добавляемые с помощью `my-yarn install <packageName>`
  // через аргументы `CLI`
  const additionalPackages = args._.slice(1)
  if (additionalPackages.length) {
    if (args['save-dev'] || args.dev) {
      root.devDependencies = root.devDependencies || {}

      // мы заполним объекты после получения информации о пакетах
      additionalPackages.forEach((pkg) => (root.devDependencies[pkg] = ''))
    } else {
      root.dependencies = root.dependencies || {}

      additionalPackages.forEach((pkg) => (root.dependencies[pkg] = ''))
    }
  }

  // в продакшне нас интересуют только производственные зависимости
  if (args.production) {
    delete root.devDependencies
  }

  // читаем `lock-файл`
  await lock.readLock()

  // получаем информацию о зависимостях
  const info = await list(root)

  // сохраняем `lock-файл` асинхронно
  lock.writeLock()

  // готовимся к установке
  // обратите внимание, что здесь мы повторно вычисляем количество пакетов
  // по причине дублирования
  // количество разрешенных пакетов не будет совпадать
  // с количеством устанавливаемых пакетов
  log.prepareInstall(
    Object.keys(info.topLevel).length + info.unsatisfied.length
  )

  // устанавливаем пакеты верхнего уровня
  await Promise.all(
    Object.entries(info.topLevel).map(([name, { url }]) => install(name, url))
  )

  // устанавливаем пакеты с конфликтами
  await Promise.all(
    info.unsatisfied.map((item) =>
      install(item.name, item.url, `/node_modules/${item.parent}`)
    )
  )

  // форматируем `package.json`
  beautifyPackageJson(root)

  // сохраняем `package.json`
  fs.writeJSON(jsonPath, root, { spaces: 2 })
}

// форматируем поля `dependencies` и `devDependencies`
function beautifyPackageJson(packageJson: PackageJson) {
  if (packageJson.dependencies) {
    packageJson.dependencies = utils.sortKeys(packageJson.dependencies)
  }

  if (packageJson.devDependencies) {
    packageJson.devDependencies = utils.sortKeys(packageJson.devDependencies)
  }
}
