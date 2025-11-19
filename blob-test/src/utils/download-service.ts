export default class DownloadService {
  downloadJson(data: unknown, fileName = 'data.json', pretty = true) {
    const serialized = pretty
      ? JSON.stringify(data, null, 2)
      : JSON.stringify(data)

    const blob = new Blob([serialized], {
      type: 'application/json',
    })

    this.triggerDownload(blob, fileName)
  }

  downloadCsv(
    rows: Record<string, unknown>[],
    fileName = 'data.csv',
    headers?: string[],
  ) {
    if (!rows.length) return

    const headerRow = headers ?? Object.keys(rows[0])
    const lines: string[] = []

    lines.push(headerRow.join(','))

    for (const row of rows) {
      const values = headerRow.map((key) => {
        const raw = row[key]
        const text = raw === null || raw === undefined ? '' : String(raw)

        if (/[",]/.test(text)) {
          return `"${text.replace(/"/g, '""')}"`
        }
        return text
      })

      lines.push(values.join(','))
    }

    const BOM = '﻿'
    const blob = new Blob([BOM + lines.join('\n')], {
      type: 'text/csv;charset=utf-8',
    })

    this.triggerDownload(blob, fileName)
  }

  downloadText(text: string, fileName = 'data.txt', mimeType = 'text/plain') {
    const blob = new Blob([text], { type: mimeType })
    this.triggerDownload(blob, fileName)
  }

  private triggerDownload(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')

    anchor.href = url
    anchor.download = fileName
    anchor.style.display = 'none'

    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()

    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}
