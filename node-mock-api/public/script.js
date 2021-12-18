import simpleFetch from '/node_modules/very-simple-fetch/index.js'
import todos from './data/todos.js'
import { isJson } from './utils.js'

simpleFetch.baseUrl = 'http://localhost:5000/project'

async function fetchProjects() {
  const { data, error } = await simpleFetch.get({ customCache: false })

  if (error) {
    return console.error(error)
  }

  project_list.innerHTML = ''

  if (data.length < 1) {
    return (project_list.innerHTML = /*html*/ `
      <li
        class="list-group-item d-flex align-items-center"
      >
        You have no projects. Why don't create one?
      </li>
    `)
  }

  const projects = data.map((p) =>
    p.replace(/.+projects\//, '').replace('.json', '')
  )

  for (const p of projects) {
    project_list.innerHTML += /*html*/ `
      <li
        class="list-group-item d-flex align-items-center"
        data-name="${p}"
      >
        <span class="flex-grow-1">
          ${p}
        </span>
        <button
          class="btn btn-outline-success"
          data-action="edit"
        >
          <i class="bi bi-pencil"></i>
        </button>
        <button
          class="btn btn-outline-danger"
          data-action="remove"
        >
          <i class="bi bi-trash"></i>
        </button>
      </li>
    `
  }
}

function initProject(name, data) {
  project_name.value = name
  project_data_paste.value = isJson(data) ? data : JSON.stringify(data, null, 2)
}

function initHandlers() {
  project_list.onclick = ({ target }) => {
    const button = target.matches('button') ? target : target.closest('button')

    const { action } = button.dataset

    const { name } = target.closest('li').dataset

    if (button && action && name) {
      switch (action) {
        case 'edit':
          return editProject(name)
        case 'remove':
          return removeProject(name)
        default:
          return
      }
    }
  }

  project_create.onsubmit = async (e) => {
    e.preventDefault()

    if (!project_name.value.trim()) return

    let data, response

    if (project_data_upload.value) {
      data = new FormData(project_create)

      data.delete('project_data_paste')

      response = await simpleFetch.post('/upload', data, {
        headers: {}
      })
    } else {
      data = project_data_paste.value.trim()

      const name = project_name.value.trim()

      if (!data || !name) return

      const body = {
        project_name: name,
        project_data: isJson(data) ? JSON.parse(data) : data
      }

      response = await simpleFetch.post('/create', body)
    }

    project_name.value = ''
    project_data_paste.value = ''
    project_data_upload.value = ''

    await handleResponse(response)
  }
}

async function editProject(name) {
  const { data, error } = await simpleFetch.get(`?project_name=${name}`)

  if (error) {
    return console.error(error)
  }

  initProject(name, data)

  project_data_details.open = true
}

async function removeProject(name) {
  const response = await simpleFetch.remove(`?project_name=${name}`)

  await handleResponse(response)
}

async function handleResponse(response) {
  const { data, error } = response

  if (error) {
    return console.error(error)
  }

  console.log(data.message)

  await fetchProjects()
}

fetchProjects()
initProject('todos', todos)
initHandlers()
