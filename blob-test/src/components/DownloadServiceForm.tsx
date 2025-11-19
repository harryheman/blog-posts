import { DownloadService } from '../utils'

const downloadService = new DownloadService()

export default function DownloadServiceForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const object = Object.fromEntries(formData.entries())
    const button = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
    const { type } = button.dataset
    switch (type) {
      case 'json':
        downloadService.downloadJson(object)
        break
      case 'csv':
        downloadService.downloadCsv([object], undefined, Object.keys(object))
        break
      case 'text':
        downloadService.downloadText(JSON.stringify(object))
        break
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        alignItems: 'start',
      }}
    >
      <input type='text' name='login' placeholder='Login' defaultValue='John' />
      <input
        type='password'
        name='password'
        placeholder='Password'
        defaultValue='p@ssw0rd'
      />
      <select name='role'>
        <option value='user' defaultChecked>
          User
        </option>
        <option value='admin'>Admin</option>
      </select>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
        }}
      >
        <button data-type='text'>Text</button>
        <button data-type='json'>JSON</button>
        <button data-type='csv'>CSV</button>
      </div>
    </form>
  )
}
