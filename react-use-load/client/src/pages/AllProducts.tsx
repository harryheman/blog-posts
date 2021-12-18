import { useState, useEffect } from 'react'
import Loader from 'react-loader-spinner'
import { ProductList } from 'components'
import { fetchAllItems } from 'api'
import { Item } from 'types'

export const AllProducts = () => {
  const [products, setProducts] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchAllItems().then(({ items }) => {
      setProducts(items)
      setLoading(false)
    })
  }, [])

  if (loading)
    return (
      <Loader type='Oval' color='lightblue' width={50} className='loader' />
    )

  return <ProductList products={products} />
}
