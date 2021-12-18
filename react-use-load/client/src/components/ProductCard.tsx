import type { Item } from 'types'

type Props = {
  product: Item
}

const formatCurrency = new Intl.NumberFormat([], {
  style: 'currency',
  currency: 'EUR'
})

export const ProductCard: React.FC<Props> = ({ product }) => {
  const { title, description, price, image } = product

  return (
    <li className='product'>
      <div className='image-box'>
        <img src={image} alt={title} />
      </div>
      <div className='text-box'>
        <h3>{title}</h3>
        <p>{description}</p>
        <p>{formatCurrency.format(price)}</p>
      </div>
    </li>
  )
}
