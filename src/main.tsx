import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Spreadsheet from './components/Spreadsheet';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Spreadsheet width={16} height={20}/>
    </React.StrictMode>,
);
