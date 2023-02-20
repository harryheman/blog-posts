import getData, { User } from '@/utils/getData'
import MaterialReactTable, { MRT_ColumnDef } from 'material-react-table'

const data = getData(40)

// сигнатура определения колонки немного отличается от React Table
export const columns: MRT_ColumnDef<User>[] = [
  {
    header: 'ID',
    accessorKey: 'id',
    // отключаем сортировку и фильтрацию
    enableSorting: false,
    enableColumnFilter: false
  },
  {
    header: 'First Name',
    accessorKey: 'firstName'
  },
  {
    header: 'Last Name',
    accessorKey: 'lastName'
  },
  {
    header: 'Age',
    accessorKey: 'age'
  },
  {
    header: 'Email',
    accessorKey: 'email'
  },
  {
    header: 'Phone',
    accessorKey: 'phone'
  },
  {
    header: 'Address',
    accessorFn: ({ address }) => `${address.city}, ${address.street}`
  },
  {
    header: 'Company',
    accessorFn: ({ job }) => `${job.position} in ${job.company}`
  }
]

export default function Material() {
  // вуаля!
  return (
    <MaterialReactTable
      columns={columns}
      data={data}
      enableRowSelection
      initialState={{ density: 'compact' }}
    />
  )
}
