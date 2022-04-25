const API_URI = 'http://localhost:5000/api/todo'

const fetchTodos = async () => {
  try {
    const response = await fetch(API_URI)
    if (!response.ok) throw response
    return await response.json()
  } catch (e) {
    throw e
  }
}

const addTodo = async (newTodo) => {
  try {
    const response = await fetch(API_URI, {
      method: 'POST',
      body: JSON.stringify(newTodo),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) throw response
    return await response.json()
  } catch (e) {
    throw e
  }
}

const updateTodo = async (id, changes) => {
  try {
    const response = await fetch(`${API_URI}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(changes),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) throw response
    return await response.json()
  } catch (e) {
    throw e
  }
}

const removeTodo = async (id) => {
  try {
    const response = await fetch(`${API_URI}/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw response
  } catch (e) {
    throw e
  }
}

const todoApi = { fetchTodos, addTodo, updateTodo, removeTodo }

export default todoApi
