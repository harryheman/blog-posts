import supabase from 's'

async function fetchAllData() {
  try {
    const { data: users } = await supabase
      .from('users')
      .select('id, email, user_name')
    const { data: posts } = await supabase
      .from('posts')
      .select('id, title, content, user_id, created_at')
    const { data: comments } = await supabase
      .from('comments')
      .select('id, content, user_id, post_id, created_at')
    return { users, posts, comments }
  } catch (e) {
    console.error(e)
  }
}

const dbApi = { fetchAllData }

export default dbApi
