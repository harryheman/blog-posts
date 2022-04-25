import postApi from 'a/post'
import commentApi from 'a/comment'
import { Form, Protected, CommentList } from 'c'
import useStore from 'h/useStore'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { VscEdit, VscTrash } from 'react-icons/vsc'

const createCommentFields = [
  {
    id: 'content',
    label: 'Content',
    type: 'text'
  }
]

export const Post = () => {
  const { user, setLoading, setError, postsById, removePost } = useStore(
    ({ user, setLoading, setError, postsById, removePost }) => ({
      user,
      setLoading,
      setError,
      postsById,
      removePost
    })
  )
  const { id } = useParams()
  const { search } = useLocation()
  const edit = new URLSearchParams(search).get('edit')
  const post = postsById[id]
  const navigate = useNavigate()

  const updatePost = (data) => {
    setLoading(true)
    data.id = post.id
    postApi
      .update(data)
      .then(() => {
        navigate(`/blog/post/${post.id}`)
      })
      .catch(setError)
  }

  const createComment = (data) => {
    setLoading(true)
    data.post_id = post.id
    commentApi.create(data).catch(setError)
  }

  if (edit) {
    const editPostFields = [
      {
        id: 'title',
        label: 'Title',
        type: 'text',
        value: post.title
      },
      {
        id: 'content',
        label: 'Content',
        type: 'text',
        value: post.content
      }
    ]

    return (
      <Protected>
        <h2>Update post</h2>
        <Form fields={editPostFields} submit={updatePost} button='Update' />
      </Protected>
    )
  }

  return (
    <div className='page post'>
      <h1>Post</h1>
      {post && (
        <div className='post-item' style={{ width: '512px' }}>
          <h2>{post.title}</h2>
          {post.editable ? (
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
                  navigate('/blog')
                }}
                className='danger'
              >
                <VscTrash />
              </button>
            </div>
          ) : (
            <p>Author: {post.author}</p>
          )}
          <p className='date'>{new Date(post.created_at).toLocaleString()}</p>
          <p>{post.content}</p>
          {user && (
            <div className='new-comment'>
              <h3>New comment</h3>
              <Form
                fields={createCommentFields}
                submit={createComment}
                button='Create'
              />
            </div>
          )}
          {post.comments.length > 0 && <CommentList comments={post.comments} />}
        </div>
      )}
    </div>
  )
}
