import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Spreadsheet from './components/Spreadsheet';
import CellMap from './CellMap';

const data = new CellMap();
data.set({ x: 1, y: 1 }, 0.3);
data.set({ x: 1, y: 2 }, 5);
data.set({ x: 1, y: 3 }, 2.7);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Spreadsheet width={16} height={20} initialData={data} />
    </React.StrictMode>,
);
