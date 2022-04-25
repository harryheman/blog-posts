const SERVER_URI = process.env.SERVER_URI || 'http://localhost:5000'

export async function getServerSideProps() {
  let categories = []

  try {
    const res = await fetch(`${SERVER_URI}/current-categories`)
    categories = await res.json()
  } catch (err) {
    console.error(err)
  }

  return { props: { categories } }
}

export default function Catalog({ categories }) {
  return (
    <>
      <h2>This is Catalog Page</h2>
      <ul>
        {categories.map((category) => (
          <li key={category.id}>{category.title}</li>
        ))}
      </ul>
    </>
  )
}
