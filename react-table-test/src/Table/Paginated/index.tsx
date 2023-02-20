import getData from '@/utils/getData'
import { usePagination, useTable } from 'react-table'
// берем колонки из предыдущего примера
import { columns } from '../Filterable'
import Pagination from './Pagination'

const data = getData(60)

export default function Paginated() {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    // новые штуки
    state: { pageIndex, pageSize },
    page,
    // возможно, здесь стоило использовать `...otherProps` :)
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize
  } = useTable(
    {
      columns,
      data,
      // начальный размер страницы
      initialState: {
        pageSize: 10
      }
    },
    usePagination
  )

  return (
    <>
      <h1>Paginated Table</h1>
      <div className='table-wrapper'>
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map((hG) => (
              <tr {...hG.getHeaderGroupProps()}>
                {hG.headers.map((col) => (
                  <th {...col.getHeaderProps()}>{col.render('Header')}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row, i) => {
              prepareRow(row)
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <br />
      <div>
        {/* пагинация */}
        <Pagination
          gotoPage={gotoPage}
          canPreviousPage={canPreviousPage}
          canNextPage={canNextPage}
          pageCount={pageCount}
          nextPage={nextPage}
          previousPage={previousPage}
          setPageSize={setPageSize}
          pageIndex={pageIndex}
          pageSize={pageSize}
        />
        {/* информация о пагинации */}
        <pre>
          <code>
            {JSON.stringify(
              {
                pageIndex,
                pageSize,
                pageCount,
                canNextPage,
                canPreviousPage
              },
              null,
              2
            )}
          </code>
        </pre>
      </div>
    </>
  )
}
