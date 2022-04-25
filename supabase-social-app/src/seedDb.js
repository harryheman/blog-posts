import { createClient } from '@supabase/supabase-js'
import serializeUser from './utils/serializeUser.js'
import { config } from 'dotenv'

config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_KEY
)

async function seedDb() {
  try {
    const { user: aliceAuth } = await supabase.auth.signUp(
      {
        email: 'alice@mail.com',
        password: 'password'
      },
      {
        data: {
          user_name: 'Alice'
        }
      }
    )
    const { user: bobAuth } = await supabase.auth.signUp(
      {
        email: 'bob@mail.com',
        password: 'password'
      },
      {
        data: {
          user_name: 'Bob'
        }
      }
    )
    const {
      data: [alice, bob]
    } = await supabase
      .from('users')
      .insert([serializeUser(aliceAuth), serializeUser(bobAuth)])

    const { data: alicePosts } = await supabase.from('posts').insert([
      {
        title: `Alice's first post`,
        content: `This is Alice's first post`,
        user_id: alice.id
      },
      {
        title: `Alice's second post`,
        content: `This is Alice's second post`,
        user_id: alice.id
      }
    ])
    const { data: bobPosts } = await supabase.from('posts').insert([
      {
        title: `Bob's's first post`,
        content: `This is Bob's first post`,
        user_id: bob.id
      },
      {
        title: `Bob's's second post`,
        content: `This is Bob's second post`,
        user_id: bob.id
      }
    ])
    for (const post of alicePosts) {
      await supabase.from('comments').insert([
        {
          user_id: alice.id,
          post_id: post.id,
          content: `This is Alice's comment on Alice's post "${post.title}"`
        },
        {
          user_id: bob.id,
          post_id: post.id,
          content: `This is Bob's comment on Alice's post "${post.title}"`
        }
      ])
    }
    for (const post of bobPosts) {
      await supabase.from('comments').insert([
        {
          user_id: alice.id,
          post_id: post.id,
          content: `This is Alice's comment on Bob's post "${post.title}"`
        },
        {
          user_id: bob.id,
          post_id: post.id,
          content: `This is Bob's comment on Bob's post "${post.title}"`
        }
      ])
    }
    console.log('Done')
  } catch (e) {
    console.error(e)
  }
}
seedDb()
