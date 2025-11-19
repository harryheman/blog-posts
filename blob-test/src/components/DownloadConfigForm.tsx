import { downloadConfigAsFile } from '../utils'

export default function DownloadConfigForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const object = Object.fromEntries(formData.entries())
    downloadConfigAsFile(object)
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
      <button>Download</button>
    </form>
  )
}
