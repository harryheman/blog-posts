import { Link, useNavigate } from 'react-router-dom'
import useStore from 'h/useStore'
import { VscComment, VscEdit, VscTrash } from 'react-icons/vsc'

const PostItem = ({ post }) => {
  const removePost = useStore(({ removePost }) => removePost)
  const navigate = useNavigate()

  return (
    <Link
      to={`/blog/post/${post.id}`}
      className='post-item'
      onClick={(e) => {
        if (e.target.localName === 'button' || e.target.localName === 'svg') {
          e.preventDefault()
        }
      }}
    >
      <h3>{post.title}</h3>
      {post.editable && (
        <div>
          <button
            onClick={() => {
              navigate(`/blog/post/${post.id}?edit=true`)
            }}
            className='info'
          >
            <VscEdit />
          </button>
          <button
            onClick={() => {
              removePost(post.id)
            }}
            className='danger'
          >
            <VscTrash />
          </button>
        </div>
      )}
      <p>Author: {post.author}</p>
      <p className='date'>{new Date(post.created_at).toLocaleString()}</p>
      {post.commentCount > 0 && (
        <p>
          <VscComment />
          <span className='badge'>
            <sup>{post.commentCount}</sup>
          </span>
        </p>
      )}
    </Link>
  )
}

export const PostList = ({ posts }) => (
  <div className='post-list'>
    {posts.length > 0 ? (
      posts.map((post) => <PostItem key={post.id} post={post} />)
    ) : (
      <h3>No posts</h3>
    )}
  </div>
)
