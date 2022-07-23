import * as React from 'react';
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridValueGetterParams,
} from '@mui/x-data-grid';

export default function DataTable({
  data,
  columns,
}: {
  data: any;
  columns: GridColDef[];
}) {
  console.log('Table', data);
  return (
    <div style={{ height: 500, width: '100%' }}>
      <DataGrid
        rows={data}
        columns={columns}
        // pageSize={25}
        rowsPerPageOptions={[5, 25, 50, 100]}
        checkboxSelection
        getRowId={(row) => row.address}
        components={{ Toolbar: GridToolbar }}
      />
    </div>
  );
}
