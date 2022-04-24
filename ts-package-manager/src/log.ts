import logUpdate from 'log-update'
import ProgressBar from 'progress'

let progress: ProgressBar

// разрешаемый модуль
// по аналогии с `yarn`
export function logResolving(name: string) {
  logUpdate(`[1/2] Resolving: ${name}`)
}

export function prepareInstall(count: number) {
  logUpdate('[1/2] Finished resolving.')

  // дружелюбный индикатор прогресса установки
  progress = new ProgressBar('[2/2] Installing [:bar]', {
    complete: '#',
    total: count
  })
}

// обновляем индикатор прогресса
// после извлечения `tarball`
export function tickInstalling() {
  progress.tick()
}
