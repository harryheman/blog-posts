import './App.scss'
import { Switch, Route } from 'react-router-dom'
import { Navbar } from 'components'
import { AllProducts, ProductsByPage, MoreProducts } from 'pages'

const routes = [
  {
    path: '/',
    name: 'All products',
    exact: true,
    component: AllProducts
  },
  {
    path: '/more-products',
    name: 'More products',
    component: MoreProducts
  },
  {
    path: '/products-by-page',
    name: 'Products by page',
    component: ProductsByPage
  }
]

export default function App() {
  return (
    <>
      <header>
        <h1>App</h1>
        <Navbar routes={routes} />
      </header>
      <main>
        <h2>Products</h2>
        <Switch>
          {routes.map(({ name, ...rest }, i) => (
            <Route key={i} {...rest} />
          ))}
        </Switch>
      </main>
    </>
  )
}
