import { User } from '@/utils/getData'
import React from 'react'
import { TableInstance } from 'react-table'

type Props = Pick<
  TableInstance<User>,
  | 'gotoPage'
  | 'previousPage'
  | 'nextPage'
  | 'canPreviousPage'
  | 'canNextPage'
  | 'pageCount'
  | 'pageIndex'
  | 'pageSize'
  | 'setPageSize'
>

export default function Pagination(props: Props) {
  // метод перехода к первой странице
  const gotoFirstPage = () => props.gotoPage(0)
  // метод перехода к последней странице
  const gotoLastPage = () => props.gotoPage(props.pageCount - 1)
  // метод перехода к указанной странице
  const gotoPage: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    // индекс массива
    const page = e.target.value ? Number(e.target.value) - 1 : 0
    props.gotoPage(page)
  }
  // метод установки размера страницы
  const setPageSize: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const size = Number(e.target.value)
    props.setPageSize(size)
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 1rem'
      }}
    >
      <span>
        <button onClick={gotoFirstPage} disabled={!props.canPreviousPage}>
          {'<<'}
        </button>
        <button onClick={props.previousPage} disabled={!props.canPreviousPage}>
          {'<'}
        </button>
        <button onClick={props.nextPage} disabled={!props.canNextPage}>
          {'>'}
        </button>
        <button onClick={gotoLastPage} disabled={!props.canNextPage}>
          {'>>'}
        </button>
      </span>
      <span>
        Page {props.pageIndex + 1} of {props.pageCount}
      </span>
      <label>
        Go to page:{' '}
        <input
          type='number'
          defaultValue={props.pageIndex + 1}
          onChange={gotoPage}
          style={{ width: '8ch' }}
        />
      </label>
      <select value={props.pageSize} onChange={setPageSize}>
        {[10, 20, 30].map((size) => (
          <option value={size} key={size}>
            Show {size}
          </option>
        ))}
      </select>
    </div>
  )
}
