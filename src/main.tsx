import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Spreadsheet from './components/Spreadsheet';
import CellMap from './CellMap';

const data = new CellMap();
data.set({ x: 1, y: 1 }, 1);
data.set({ x: 1, y: 2 }, 2);
data.set({ x: 1, y: 3 }, 3);
data.set({ x: 1, y: 4 }, 4);
data.set({ x: 2, y: 1 }, 2);
data.set({ x: 2, y: 2 }, 4);
data.set({ x: 2, y: 3 }, 8);
data.set({ x: 2, y: 4 }, 16);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Spreadsheet width={32} height={40} initialData={data} />
    </React.StrictMode>,
);
