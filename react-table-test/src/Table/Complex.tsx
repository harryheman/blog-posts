import getData, { User } from '@/utils/getData'
import { BiSortAlt2, BiSortDown, BiSortUp } from 'react-icons/bi'
import {
  Row,
  useFilters,
  useGlobalFilter,
  usePagination,
  useRowSelect,
  useSortBy,
  useTable,
  Column
} from 'react-table'
// типы сортировки
import { sortTypes } from './Sortable'
// кастомная функция фильтрации, типы фильтрации и компоненты фильтров
import {
  filterGreaterThanOrEqual,
  filterTypes,
  GlobalFilter,
  NumberRangeColumnFilter,
  SelectColumnFilter,
  SliderColumnFilter
} from './Filterable/filters'
// дефолтные настройки колонки
import { defaultColumn } from './Filterable'
// компонент пагинации
import Pagination from './Paginated/Pagination'
// компонент чекбокса
import { IndeterminateCheckbox } from './Selectable'

// данные
const data = getData(60)

// определения колонок
const columns: Column<User>[] = [
  {
    Header: 'ID',
    accessor: 'id',
    // отключаем сортировку и фильтрацию
    disableSortBy: true,
    disableFilters: true
  },
  {
    Header: 'Name',
    columns: [
      {
        Header: 'First Name',
        accessor: 'firstName',
        // встроенный тип сортировки
        sortType: 'string'
      },
      {
        Header: 'Last Name',
        accessor: 'lastName',
        sortType: 'string',
        // кастомный тип фильтрации
        filter: 'fuzzyText'
      }
    ]
  },
  {
    Header: 'Info',
    columns: [
      {
        Header: 'Age',
        accessor: 'age',
        sortType: 'number',
        // кастомный компонент фильтра
        Filter: SliderColumnFilter,
        // встроенный тип фильтрации
        filter: 'equals'
      },
      {
        Header: 'Visits',
        accessor: 'visits',
        Filter: NumberRangeColumnFilter,
        filter: 'between'
      },
      {
        Header: 'Status',
        accessor: 'status',
        Filter: SelectColumnFilter,
        filter: 'includes'
      },
      {
        Header: 'Profile Progress',
        accessor: 'progress',
        Filter: SliderColumnFilter,
        // кастомная функция фильтрации
        filter: filterGreaterThanOrEqual
      }
    ]
  }
]

export default function Complex() {
  const {
    // обязательные штуки
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    // состояние
    state: { globalFilter, pageIndex, pageSize, filters },
    // фильтрация
    visibleColumns,
    preGlobalFilteredRows,
    setGlobalFilter,
    // пагинация
    page,
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    // выбор строк
    selectedFlatRows
  } = useTable(
    // настройки
    {
      columns,
      data,
      sortTypes,
      defaultColumn,
      filterTypes,
      initialState: {
        pageSize: 10
      }
    },
    // плагины
    useGlobalFilter,
    useFilters,
    useSortBy,
    usePagination,
    useRowSelect,
    // встроенные хуки
    ({ visibleColumns }) => {
      visibleColumns.push((cols) => [
        {
          id: 'selection',
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
          ),
          Cell: ({ row }: { row: Row<User> }) => (
            <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
          )
        },
        ...cols
      ])
    }
  )

  return (
    <>
      <h1>Complex Table</h1>
      <div className='table-wrapper'>
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map((hG) => (
              <tr {...hG.getHeaderGroupProps()}>
                {hG.headers.map((col) => (
                  <th {...col.getHeaderProps(col.getSortByToggleProps())}>
                    {col.render('Header')}
                    {/* иконка сортировки */}
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
                    {/* UI фильтра */}
                    {col.canFilter ? <div>{col.render('Filter')}</div> : null}
                  </th>
                ))}
              </tr>
            ))}
            <tr>
              <th colSpan={visibleColumns.length}>
                {/* глобальный фильтр */}
                <GlobalFilter
                  preGlobalFilteredRows={preGlobalFilteredRows}
                  globalFilter={globalFilter}
                  setGlobalFilter={setGlobalFilter}
                />
              </th>
            </tr>
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row) => {
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
      {/* информация */}
      <div>
        {/* выбранные фильтры */}
        <p>Filters</p>
        <pre>
          <code>{JSON.stringify(filters, null, 2)}</code>
        </pre>
        {/* состояние пагинации */}
        <p>Pagination state</p>
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
        {/* выбранные строки */}
        <p>Selected rows</p>
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
