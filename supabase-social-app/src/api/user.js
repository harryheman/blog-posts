import supabase from 's'
import serializeUser from 'u/serializeUser'

const get = async () => {
  const user = supabase.auth.user()
  if (user) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select()
        .match({ id: user.id })
        .single()
      if (error) throw error
      console.log(data)
      return data
    } catch (e) {
      throw e
    }
  }
  return null
}

const register = async (data) => {
  const { email, password, user_name } = data
  try {
    const { user, error } = await supabase.auth.signUp(
      {
        email,
        password
      },
      {
        data: {
          user_name
        }
      }
    )
    if (error) throw error
    const { data: _user, error: _error } = await supabase
      .from('users')
      .insert([serializeUser(user)])
      .single()
    if (_error) throw _error
    return _user
  } catch (e) {
    throw e
  }
}

const login = async (data) => {
  try {
    const { user, error } = await supabase.auth.signIn(data)
    if (error) throw error
    const { data: _user, error: _error } = await supabase
      .from('users')
      .select()
      .match({ id: user.id })
      .single()
    if (_error) throw _error
    return _user
  } catch (e) {
    throw e
  }
}

const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return null
  } catch (e) {
    throw e
  }
}

const update = async (data) => {
  const user = supabase.auth.user()
  if (!user) return
  try {
    const { data: _user, error } = await supabase
      .from('users')
      .update(data)
      .match({ id: user.id })
      .single()
    if (error) throw error
    return _user
  } catch (e) {
    throw e
  }
}

const STORAGE_URL = `${
  import.meta.env.VITE_SUPABASE_URL
}/storage/v1/object/public/`

const uploadAvatar = async (file) => {
  const user = supabase.auth.user()
  if (!user) return
  const { id } = user
  const ext = file.name.split('.').at(-1)
  const name = id + '.' + ext
  try {
    const {
      data: { Key },
      error
    } = await supabase.storage.from('avatars').upload(name, file, {
      cacheControl: 'no-cache',
      upsert: true
    })
    if (error) throw error
    const avatar_url = STORAGE_URL + Key
    const { data: _user, error: _error } = await supabase
      .from('users')
      .update({ avatar_url })
      .match({ id })
      .single()
    if (_error) throw _error
    return _user
  } catch (e) {
    throw e
  }
}

const userApi = { get, register, login, logout, update, uploadAvatar }

export default userApi
