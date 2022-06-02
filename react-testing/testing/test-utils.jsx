import { render, queries } from '@testing-library/react'
import { GreetingProvider } from '../src/GreetingProvider'
import { jest } from '@jest/globals'
const customQueries = jest.requireActual('./custom-queries')

const AllProviders = ({ children }) => (
  <GreetingProvider>{children}</GreetingProvider>
)

const customRender = (ui, options) =>
  render(ui, {
    wrapper: AllProviders,
    queries: { ...queries, ...customQueries },
    ...options
  })

export * from '@testing-library/react'
export { customRender as render }
