import { Blob, Buffer } from 'buffer'
import { mkdir, open, unlink, writeFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

import { path } from '@ffmpeg-installer/ffmpeg'
import ffmpeg from 'fluent-ffmpeg'
ffmpeg.setFfmpegPath(path)

const __dirname = dirname(fileURLToPath(import.meta.url))

export const saveData = async (data, username) => {
  const videoPath = join(__dirname, '../video')

  const dirName = new Date().toLocaleDateString().replace(/\./g, '_')
  const dirPath = `${videoPath}/${dirName}`

  const fileName = `${Date.now()}-${username}.webm`
  const tempFilePath = `${dirPath}/temp-${fileName}`
  const finalFilePath = `${dirPath}/${fileName}`

  let fileHandle
  try {
    fileHandle = await open(dirPath)
  } catch {
    await mkdir(dirPath)
  } finally {
    if (fileHandle) {
      fileHandle.close()
    }
  }

  try {
    const videoBlob = new Blob(data, {
      type: 'video/webm'
    })
    const videoBuffer = Buffer.from(await videoBlob.arrayBuffer())

    await writeFile(tempFilePath, videoBuffer)

    ffmpeg(tempFilePath)
      .outputOptions([
        '-c:v libvpx-vp9',
        '-c:a copy',
        '-crf 35',
        '-b:v 0',
        '-vf scale=1280:720'
      ])
      .on('end', async () => {
        await unlink(tempFilePath)
        console.log(`*** File ${fileName} created`)
      })
      .save(finalFilePath, dirPath)
  } catch (e) {
    console.log('*** saveData', e)
  }
}
