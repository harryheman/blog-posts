import fetch from 'node-fetch'
import tar from 'tar'
import fs from 'fs-extra'
import * as log from './log.js'

export default async function install(
  name: string,
  url: string,
  location = ''
) {
  // путь к директории для устанавливаемого пакета
  const path = `${process.cwd()}${location}/node_modules/${name}`

  // создаем директории рекурсивно
  await fs.mkdirp(path)

  const response = await fetch(url)

  // тело ответа - это поток данных, доступный для чтения
  // (readable stream, application/octet-stream)
  //
  // `tar.extract` принимает такой поток
  // это позволяет извлекать содержимое напрямую
  // без его записи на диск
  response
    .body!.pipe(tar.extract({ cwd: path, strip: 1 }))
    // обновляем индикатор прогресса установки после извлечения тарбала
    .on('close', log.tickInstalling)
}
