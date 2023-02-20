import { ColumnFilterT, GlobalFilterT } from '@/types'
import { User } from '@/utils/getData'
import { matchSorter } from 'match-sorter'
import { useMemo, useState } from 'react'
import { FilterType, FilterTypes, useAsyncDebounce } from 'react-table'

// UI глобального фильтра
export const GlobalFilter: GlobalFilterT<User> = ({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter
}) => {
  // количество отфильтрованных строк
  const count = preGlobalFilteredRows?.length
  // локальное состояние значения фильтра
  const [value, setValue] = useState(globalFilter as string)
  // метод модификации значения фильтра
  // выполняется с задержкой в 250 мс
  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter?.(value || undefined)
  }, 250)

  return (
    <label>
      Search:{' '}
      <input
        type='text'
        value={value || ''}
        onChange={(e) => {
          setValue(e.target.value)
          onChange(e.target.value)
        }}
        placeholder={`${count} records...`}
      />
    </label>
  )
}

// UI дефолтного фильтра
export const DefaultColumnFilter: ColumnFilterT<User> = ({
  column: { filterValue, preFilteredRows, setFilter }
}) => {
  const count = preFilteredRows.length

  return (
    <input
      type='text'
      value={filterValue || ''}
      onChange={(e) => {
        // установка фильтра в значение `undefined` приводит к удалению фильтра
        setFilter(e.target.value || undefined)
      }}
      placeholder={`${count} records...`}
    />
  )
}

// UI фильтра-слайдера
export const SliderColumnFilter: ColumnFilterT<User> = ({
  column: { filterValue, setFilter, preFilteredRows, id }
}) => {
  // вычисляем минимальное и максимальное значения
  const [min, max] = useMemo(() => {
    let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0
    let max = min
    preFilteredRows.forEach((r) => {
      min = Math.min(r.values[id], min)
      max = Math.max(r.values[id], max)
    })
    return [min, max]
  }, [id, preFilteredRows])

  return (
    <>
      <input
        type='range'
        min={min}
        max={max}
        value={filterValue || ''}
        onChange={(e) => {
          setFilter(parseInt(e.target.value, 10))
        }}
      />
      <button onClick={() => setFilter(undefined)}>Off</button>
      <p>{filterValue}</p>
    </>
  )
}

// UI фильтра-диапазона
export const NumberRangeColumnFilter: ColumnFilterT<User> = ({
  column: { filterValue = [], preFilteredRows, setFilter, id }
}) => {
  const [min, max] = useMemo(() => {
    let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0
    let max = min
    preFilteredRows.forEach((r) => {
      min = Math.min(r.values[id], min)
      max = Math.max(r.values[id], max)
    })
    return [min, max]
  }, [id, preFilteredRows])

  return (
    <div style={{ display: 'flex' }}>
      <input
        type='number'
        value={filterValue[0] || ''}
        onChange={(e) => {
          const val = e.target.value
          setFilter((prev = []) => [
            val ? parseInt(val, 10) : undefined,
            prev[1]
          ])
        }}
        placeholder={`Min ${min}`}
      />
      to
      <input
        type='number'
        value={filterValue[1] || ''}
        onChange={(e) => {
          const val = e.target.value
          setFilter((prev = []) => [
            prev[0],
            val ? parseInt(val, 10) : undefined
          ])
        }}
        placeholder={`Max ${max}`}
      />
    </div>
  )
}

// UI фильтра-селектора
export const SelectColumnFilter: ColumnFilterT<User> = ({
  column: { filterValue, setFilter, preFilteredRows, id }
}) => {
  // формируем варианты
  const options = useMemo(() => {
    const opts = new Set()
    preFilteredRows.forEach((r) => {
      opts.add(r.values[id])
    })
    return [...opts.values()]
  }, [id, preFilteredRows])

  return (
    <select
      value={filterValue}
      onChange={(e) => {
        setFilter(e.target.value || undefined)
      }}
    >
      <option value=''>All</option>
      {options.map((o: any, i) => (
        <option value={o} key={i}>
          {o}
        </option>
      ))}
    </select>
  )
}

// кастомный тип фильтрации
export const fuzzyText: FilterType<User> = (rows, ids, filterValue) => {
  return matchSorter(rows, filterValue, {
    keys: [(row) => ids.map((id) => row.values[id]).flat()]
  })
}

// удаляем фильтр при отсутствии значения
fuzzyText.autoRemove = (val: unknown) => !val

// кастомная функция фильтрации
export const filterGreaterThanOrEqual: FilterType<User> = (
  rows,
  ids,
  filterValue
) => {
  return rows.filter((row) => {
    return ids.some((id) => {
      const rowValue = row.values[id]
      return rowValue >= filterValue
    })
  })
}

// удаляем фильтр, если значение не является числом
filterGreaterThanOrEqual.autoRemove = (val: unknown) => typeof val !== 'number'

// типы фильтрации
export const filterTypes: FilterTypes<User> = {
  // добавляем новый тип
  fuzzyText,
  // перезаписываем встроенный тип `text`
  // просто для примера, встроенный тип лучше
  text: (rows, ids, filterVal) => {
    return rows.filter((row) => {
      return ids.some((id) => {
        const rowVal = String(row.values[id])
        return rowVal.toLowerCase().startsWith(String(filterVal).toLowerCase())
      })
    })
  }
}
