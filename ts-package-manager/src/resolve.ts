import fetch from 'node-fetch'

export interface Manifest {
  [version: string]: {
    dependencies?: { [dep: string]: string }
    dist: { shasum: string; tarball: string }
  }
}

// это позволяет использовать кастомный реестр пакетов
const REGISTRY = process.env.REGISTRY || 'https://registry.npmjs.org'

// используем кеш для предотвращения повторных сетевых запросов
// при запросе полученного ранее пакета
const cache: { [dep: string]: Manifest } = Object.create(null)

export default async function resolve(name: string): Promise<Manifest> {
  // если манифест пакета содержится в кеше,
  // просто возвращаем его
  if (cache[name]) {
    return cache[name]
  }

  const response = await fetch(`${REGISTRY}/${name}`)
  const json = (await response.json()) as { versions: Manifest; error?: any }
  if (json.error) {
    throw new ReferenceError(`No such package: ${name}`)
  }

  // добавляем информацию о манифесте пакета в кеш и возвращаем его
  return (cache[name] = json.versions)
}
