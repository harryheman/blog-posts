import useStore from 'h/useStore'

const tabs = [
  {
    name: 'All'
  },
  {
    name: 'My',
    protected: true
  },
  {
    name: 'New',
    protected: true
  }
]

export const PostTabs = ({ tab, setTab }) => {
  const user = useStore(({ user }) => user)

  return (
    <nav className='post-tabs'>
      <ul>
        {tabs.map((t) => {
          const tabId = t.name.toLowerCase()
          if (t.protected) {
            return user ? (
              <li key={tabId}>
                <button
                  className={tab === tabId ? 'active' : ''}
                  onClick={() => setTab(tabId)}
                >
                  {t.name}
                </button>
              </li>
            ) : null
          }
          return (
            <li key={tabId}>
              <button
                className={tab === tabId ? 'active' : ''}
                onClick={() => setTab(tabId)}
              >
                {t.name}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
