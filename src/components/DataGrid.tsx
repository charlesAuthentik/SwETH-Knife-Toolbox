import * as React from 'react';
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridValueGetterParams,
} from '@mui/x-data-grid';

const columns: GridColDef[] = [
  { field: 'address', headerName: 'Address', width: 400 },
  { field: 'ens', headerName: 'Address', width: 400 },
  {
    field: 'ethBalance',
    headerName: 'ETH Balance',
    type: 'number',
    width: 130,
  },
];

export default function DataTable({ data }: { data: any }) {
  console.log('Table', data);
  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={data}
        columns={columns}
        pageSize={25}
        rowsPerPageOptions={[5, 25, 50, 100]}
        checkboxSelection
        getRowId={(row) => row.address}
        components={{ Toolbar: GridToolbar }}
      />
    </div>
  );
}
