import React from 'react';
import {AgGridReact} from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
export default function PreviewGrid({rowData}:{rowData:any[]}){
  const cols = React.useMemo(()=>rowData.length?Object.keys(rowData[0]).map(f=>({field:f})):[],[rowData]);
  return <div className="ag-theme-alpine" style={{height:300}}>
    <AgGridReact rowData={rowData} columnDefs={cols} pagination autoSizeStrategy="fitGridWidth"/>
  </div>;
}
