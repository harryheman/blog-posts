import { rest } from 'msw'
import { setupServer } from 'msw/node'
import userEvent from '@testing-library/user-event'
import { render, fireEvent, waitFor, screen } from 'test-utils'
import '@testing-library/jest-dom'
import FetchGreeting from '../src/FetchGreeting'

const server = setupServer(
  rest.get('/greeting', (req, res, ctx) =>
    res(ctx.json({ greeting: 'Привет!' }))
  )
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('получение приветствия', () => {
  test('-> успешное получение и отображение приветствия', async function () {
    const { container, getByDataCy } = render(<FetchGreeting url='/greeting' />)
    expect(container).toMatchSnapshot()

    fireEvent.click(screen.getByText('Получить приветствие'))

    await waitFor(() => screen.getByRole('heading'))
    expect(container).toMatchSnapshot()

    expect(getByDataCy('heading')).toHaveTextContent('Привет!')
    expect(screen.getByRole('button')).toHaveTextContent('Готово')
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('-> обработка ошибки сервера', async () => {
    server.use(rest.get('/greeting', (req, res, ctx) => res(ctx.status(500))))

    const { container } = render(<FetchGreeting url='greeting' />)
    expect(container).toMatchSnapshot()

    const user = userEvent.setup()
    await user.click(screen.getByText('Получить приветствие'))

    await waitFor(() => screen.getByRole('alert'))
    expect(container).toMatchSnapshot()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Не удалось получить приветствие'
    )
    expect(screen.getByRole('button')).not.toBeDisabled()
  })
})
