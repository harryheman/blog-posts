import getData, { User } from '@/utils/getData'
import { BiSortAlt2, BiSortDown, BiSortUp } from 'react-icons/bi'
import { Column, SortByFn, useSortBy, useTable } from 'react-table'

// данные
const data = getData(20)

// определения колонок
export const columns: Column<User>[] = [
  {
    Header: 'ID',
    // user['id']
    accessor: 'id',
    // отключаем сортировку
    disableSortBy: true
  },
  {
    Header: 'First Name',
    accessor: 'firstName',
    // определяем тип сортировки
    sortType: 'string'
  },
  {
    Header: 'Last Name',
    accessor: 'lastName',
    sortType: 'string'
  },
  {
    Header: 'Age',
    accessor: 'age',
    sortType: 'number'
  },
  {
    Header: 'Email',
    accessor: 'email'
  },
  {
    Header: 'Phone',
    accessor: 'phone'
  },
  {
    Header: 'Address',
    // user['address'].city, user['address'].street
    accessor: ({ address }) => `${address.city}, ${address.street}`
  },
  {
    Header: 'Company',
    accessor: ({ job }) => `${job.position} in ${job.company}`
  }
]

// типы сортировок
export const sortTypes: Record<string, SortByFn<User>> = {
  // перезаписывает встроенный тип `string`
  string: (rowA, rowB, columnId, desc) => {
    const [a, b] = [rowA.values[columnId], rowB.values[columnId]] as [
      string,
      string
    ]

    return a.localeCompare(b, 'en')
  }
}

export default function Sortable() {
  // создаем экземпляр таблицы
  const {
    // эти штуки являются обязательными
    getTableProps,
    getTableBodyProps,
    // о том, почему мы используем группы заголовков, а не сами заголовки, мы поговорим в следующем разделе
    headerGroups,
    rows,
    prepareRow
  } = useTable({ columns, data, sortTypes }, useSortBy)

  return (
    <>
      <h1>Sortable Table</h1>
      <div className='table-wrapper'>
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map((hG) => (
              <tr {...hG.getHeaderGroupProps()}>
                {hG.headers.map((col) => (
                  <th {...col.getHeaderProps(col.getSortByToggleProps())}>
                    {col.render('Header')}{' '}
                    {/* если колонка является сортируемой, рендерим рядом с заголовком соответствующую иконку в зависимости от того, включена ли сортировка, а также от порядка сортировки */}
                    {col.canSort && (
                      <span>
                        {col.isSorted ? (
                          col.isSortedDesc ? (
                            <BiSortUp />
                          ) : (
                            <BiSortDown />
                          )
                        ) : (
                          <BiSortAlt2 />
                        )}
                      </span>
                    )}
                  </th>
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
    </>
  )
}
