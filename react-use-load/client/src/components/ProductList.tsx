import { ProductCard } from 'components'
import { Item } from 'types'

type Props = {
  products: Item[]
}

export const ProductList: React.FC<Props> = ({ products }) => (
  <ul>
    {products.map((product) => (
      <ProductCard key={product.id} product={product} />
    ))}
  </ul>
)
