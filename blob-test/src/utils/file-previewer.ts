export default class FilePreviewer {
  private container: HTMLElement
  private textEncoding: string

  constructor(container: HTMLElement, textEncoding = 'utf-8') {
    this.container = container
    this.textEncoding = textEncoding
  }

  async preview(file: File | Blob) {
    this.container.innerHTML = ''

    const type = this.detectType(file)

    switch (type) {
      case 'image':
        return this.renderImage(file)
      case 'text':
        return this.renderText(file)
      case 'audio':
        return this.renderAudio(file)
      case 'video':
        return this.renderVideo(file)
      case 'pdf':
        return this.renderPdfPlaceholder(file)
      default:
        return this.renderUnknown(file)
    }
  }

  private detectType(file: File | Blob) {
    const mime = file.type.toLowerCase()

    if (mime.startsWith('image/')) return 'image'
    if (mime.startsWith('text/') || mime === 'application/json') return 'text'
    if (mime.startsWith('audio/')) return 'audio'
    if (mime.startsWith('video/')) return 'video'
    if (mime === 'application/pdf') return 'pdf'
    return 'unknown'
  }

  private async renderImage(file: File | Blob) {
    const url = URL.createObjectURL(file)
    const img = document.createElement('img')

    img.src = url
    img.style.maxWidth = '100%'
    img.style.maxHeight = '480px'
    img.style.objectFit = 'contain'

    img.onload = () => {
      URL.revokeObjectURL(url)
    }

    this.container.appendChild(img)
  }

  private async renderText(file: File | Blob) {
    const content = await this.readAsText(file)
    const pre = document.createElement('pre')

    pre.textContent =
      content.length > 10000
        ? content.slice(0, 10000) + '\n\n...[truncated]'
        : content
    pre.style.whiteSpace = 'pre-wrap'
    pre.style.maxHeight = '480px'
    pre.style.overflowY = 'auto'
    pre.style.padding = '1rem'
    pre.style.backgroundColor = '#f5f5f5'

    this.container.appendChild(pre)
  }

  private async renderAudio(file: File | Blob) {
    const url = URL.createObjectURL(file)
    const audio = document.createElement('audio')

    audio.src = url
    audio.controls = true
    audio.onload = () => {
      URL.revokeObjectURL(url)
    }

    this.container.appendChild(audio)
  }

  private async renderVideo(file: File | Blob) {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')

    video.src = url
    video.controls = true
    video.style.maxWidth = '100%'
    video.style.maxHeight = '480px'
    video.onload = () => {
      URL.revokeObjectURL(url)
    }

    this.container.appendChild(video)
  }

  private renderPdfPlaceholder(file: File | Blob) {
    const box = document.createElement('div')
    box.style.padding = '1rem'
    box.style.textAlign = 'center'

    box.innerHTML = `<p>PDF preview placeholder</p><p>Type: ${
      file.type || 'application/pdf'
    }</p>`

    this.container.appendChild(box)
  }

  private renderUnknown(file: File | Blob) {
    const box = document.createElement('div')
    box.style.padding = '1rem'
    box.style.textAlign = 'center'

    box.innerHTML = `<p>Preview is not available for this file type.</p><p>Name: ${
      (file as File).name || 'unknown'
    }</p>`

    this.container.appendChild(box)
  }

  private readAsText(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => resolve((e.target?.result as string) || '')
      reader.onerror = () => reject(reader.error)
      reader.readAsText(file, this.textEncoding)
    })
  }
}
