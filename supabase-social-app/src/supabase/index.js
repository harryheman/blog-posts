import { createClient } from '@supabase/supabase-js'
import useStore from 'h/useStore'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
)

supabase.auth.onAuthStateChange((event, session) => {
  console.log(event, session)
  useStore.getState().fetchAllData()
})

supabase
  .from('*')
  .on('*', (payload) => {
    console.log(payload)
    useStore.getState().fetchAllData()
  })
  .subscribe()

export default supabase
