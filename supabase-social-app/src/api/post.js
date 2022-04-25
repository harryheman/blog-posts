import supabase from 's'

const create = async (postData) => {
  const user = supabase.auth.user()
  if (!user) return
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert([{ ...postData, user_id: user.id }])
      .single()
    if (error) throw error
    return data
  } catch (e) {
    throw e
  }
}

const update = async (data) => {
  const user = supabase.auth.user()
  if (!user) return
  try {
    const { data: _data, error } = await supabase
      .from('posts')
      .update({ ...postData })
      .match({ id: data.id, user_id: user.id })
    if (error) throw error
    return _data
  } catch (e) {
    throw e
  }
}

const remove = async (id) => {
  const user = supabase.auth.user()
  if (!user) return
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .match({ id, user_id: user.id })
    if (error) throw error
    const { error: _error } = await supabase
      .from('comments')
      .delete()
      .match({ post_id: id })
    if (_error) throw _error
  } catch (e) {
    throw e
  }
}

const postApi = { create, update, remove }

export default postApi
