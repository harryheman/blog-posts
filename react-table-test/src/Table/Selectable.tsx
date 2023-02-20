import getData, { User } from '@/utils/getData'
import { forwardRef, useEffect, useRef } from 'react'
import {
  Row,
  TableToggleAllRowsSelectedProps,
  useRowSelect,
  useTable
} from 'react-table'
// импортируем колонки из компонента сортируемой таблицы
import { columns } from './Sortable'

const data = getData(10)

// компонент чекбокса
export const IndeterminateCheckbox = forwardRef(
  (
    { indeterminate, ...rest }: Partial<TableToggleAllRowsSelectedProps>,
    ref
  ) => {
    const defaultRef = useRef<HTMLInputElement | null>(null)
    const resolvedRef =
      (ref as React.MutableRefObject<HTMLInputElement | null>) || defaultRef

    useEffect(() => {
      if (resolvedRef.current) {
        resolvedRef.current.indeterminate = indeterminate as boolean
      }
    }, [resolvedRef, indeterminate])

    return <input type='checkbox' ref={resolvedRef} {...rest} />
  }
)

export default function Selectable() {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    // новые штуки
    selectedFlatRows,
    state: { selectedRowIds }
  } = useTable({ columns, data }, useRowSelect, ({ visibleColumns }) => {
    visibleColumns.push((cols) => [
      // добавляем колонку для выбора строки
      {
        id: 'selection',
        // компонент заголовка
        // принимает экземпляр таблицы и модель колонки
        Header: ({ getToggleAllRowsSelectedProps }) => (
          <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
        ),
        // компонент ячейки
        // принимает экземпляр таблицы и модель ячейки
        Cell: ({ row }: { row: Row<User> }) => (
          <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
        )
      },
      ...cols
    ])
  })

  return (
    <>
      <h1>Selectable Table</h1>
      <div className='table-wrapper'>
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map((hG) => (
              <tr {...hG.getHeaderGroupProps()}>
                {hG.headers.map((col) => (
                  <th {...col.getHeaderProps()}>{col.render('Header')} </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
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
      <div>
        {/* количество выбранных строк */}
        <p>Selected rows count: {Object.keys(selectedRowIds).length}</p>
        {/* выбранные строки */}
        <pre>
          <code>
            {JSON.stringify(
              selectedFlatRows.map((d) => d.original),
              null,
              2
            )}
          </code>
        </pre>
      </div>
    </>
  )
}
