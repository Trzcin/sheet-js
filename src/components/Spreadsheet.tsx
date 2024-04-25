import React, { useEffect, useMemo, useRef, useState } from 'react';
import CellMap from '../CellMap';
import { CellPosition, CellSelection } from '../types';
import { useModifierKeys } from '../hooks/useModifierKeys';
import parseCellData from '../parseCellData';
import { inSelection } from '../utils';
import Cell from './Cell';
import { Chart } from 'chart.js/auto';
import { ChartData, updateChart } from '../chart';

interface SpreadsheetProps {
    width: number;
    height: number;
    initialData?: CellMap;
}

export default function Spreadsheet(props: SpreadsheetProps) {
    const columnNames = useMemo(
        () => Array.from({ length: props.width }, (_, i) => columnName(i)),
        [props.width],
    );
    const [data, setData] = useState<CellMap>(
        props.initialData ?? new CellMap(),
    );
    const [selection, setSelection] = useState<CellSelection | undefined>(
        undefined,
    );
    const modKeys = useModifierKeys();
    const table = useRef<HTMLTableElement>(null);
    const [editingPos, setEditingPos] = useState<CellPosition | undefined>(
        undefined,
    );
    const [cellValue, setCellValue] = useState('');
    const [copiedArea, setCopiedArea] = useState<CellSelection | undefined>(
        undefined,
    );
    const [charts, setCharts] = useState<ChartData[]>([]);

    useEffect(() => {
        if (selection !== undefined && table.current) {
            table.current.focus();
        } else if (selection === undefined && table.current) {
            table.current.blur();
        }
    }, [selection]);

    useEffect(() => {
        console.log('aaa');
        charts.forEach((c) => updateChart(c, data));
    }, [charts, data]);

    function handleClick(position: CellPosition) {
        if (selection && inSelection(position, selection)) {
            setSelection(undefined);
            setEditingPos(position);
            const cellData = data.get(position);
            if (typeof cellData === 'string') {
                setCellValue(cellData);
            } else if (typeof cellData === 'number') {
                setCellValue(cellData.toString());
            } else if (typeof cellData === 'object') {
                setCellValue(cellData.src);
            }
        } else if (selection && modKeys.shift) {
            setSelection((prev) => {
                return {
                    start: {
                        x: Math.min(prev!.start.x, position.x),
                        y: Math.min(prev!.start.y, position.y),
                    },
                    end: {
                        x: Math.max(prev!.end.x, position.x),
                        y: Math.max(prev!.end.y, position.y),
                    },
                };
            });
        } else {
            setSelection({
                start: position,
                end: position,
            });
        }
    }

    function deselect(ev: React.KeyboardEvent) {
        if (ev.key !== 'Escape') {
            return;
        }
        setSelection(undefined);
    }

    function deleteCells(ev: React.KeyboardEvent) {
        if (selection === undefined || ev.key !== 'Delete') {
            return;
        }

        const updatedData = data;
        for (let y = selection.start.y; y <= selection.end.y; y++) {
            for (let x = selection.start.x; x <= selection.end.x; x++) {
                updatedData.delete({ x, y });
            }
        }
        setData(updatedData);
    }

    function arrowKeyMove(ev: React.KeyboardEvent) {
        if (
            selection === undefined ||
            (ev.key !== 'ArrowUp' &&
                ev.key !== 'ArrowDown' &&
                ev.key !== 'ArrowLeft' &&
                ev.key !== 'ArrowRight')
        ) {
            return;
        }
        ev.preventDefault();

        switch (ev.key) {
            case 'ArrowUp':
                if (selection.end.y - 1 >= 0) {
                    handleClick({ ...selection.end, y: selection.end.y - 1 });
                }
                break;
            case 'ArrowDown':
                if (selection.end.y + 1 < props.height) {
                    handleClick({ ...selection.end, y: selection.end.y + 1 });
                }
                break;
            case 'ArrowLeft':
                if (selection.end.x - 1 >= 0) {
                    handleClick({ ...selection.end, x: selection.end.x - 1 });
                }
                break;
            case 'ArrowRight':
                if (selection.end.x + 1 < props.width) {
                    handleClick({ ...selection.end, x: selection.end.x + 1 });
                }
                break;
        }
    }

    function updateCell() {
        if (!editingPos) return;

        if (cellValue.trim() !== '') {
            setData((prev) => prev.set(editingPos, parseCellData(cellValue)));
        }

        if (cellValue.trim() === '' && data.has(editingPos)) {
            const newData = data;
            newData.delete(editingPos);
            setData(newData);
        }

        setEditingPos(undefined);
        setCellValue('');
    }

    function handleCopy(ev: React.KeyboardEvent) {
        if (!selection || !ev.ctrlKey || ev.key !== 'c') return;

        setCopiedArea({
            start: { ...selection.start },
            end: { ...selection.end },
        });
    }

    function handlePaste(ev: React.KeyboardEvent) {
        if (!selection || !copiedArea || !ev.ctrlKey || ev.key !== 'v') return;

        const updatedData = data;
        for (let y = copiedArea.start.y; y <= copiedArea.end.y; y++) {
            for (let x = copiedArea.start.x; x <= copiedArea.end.x; x++) {
                const pos: CellPosition = {
                    x: selection.start.x + x - copiedArea.start.x,
                    y: selection.start.y + y - copiedArea.start.y,
                };
                updatedData.set(pos, updatedData.get({ x, y })!);
            }
        }
        setData(updatedData);
    }

    function handleAddChart(ev: React.KeyboardEvent) {
        if (!selection || !ev.ctrlKey || ev.key !== 'g') {
            return;
        }
        ev.preventDefault();

        const xValues: number[] = [];
        for (let row = selection.start.y; row <= selection.end.y; row++) {
            const cell = data.get({ x: selection.start.x, y: row });
            if (cell && typeof cell === 'number') {
                xValues.push(cell);
            }
        }
        const yValues: number[] = [];
        for (let row = selection.start.y; row <= selection.end.y; row++) {
            const cell = data.get({ x: selection.end.x, y: row });
            if (cell && typeof cell === 'number') {
                yValues.push(cell);
            }
        }

        const canv = document.createElement('canvas');
        canv.style.position = 'absolute';
        document.body.appendChild(canv);
        const chart = new Chart(canv, {
            type: 'line',
            data: {
                labels: xValues,
                datasets: [
                    {
                        data: yValues,
                    },
                ],
            },
        });
        setCharts((prev) => [...prev, { selection, chart }]);
    }

    return (
        <table
            tabIndex={0}
            ref={table}
            onKeyDown={(ev) => {
                arrowKeyMove(ev);
                deselect(ev);
                deleteCells(ev);
                handleCopy(ev);
                handlePaste(ev);
                handleAddChart(ev);
            }}
            onBlur={() => setSelection(undefined)}
        >
            <thead>
                <tr>
                    <th></th>
                    {columnNames.map((name, i) => (
                        <th
                            key={i}
                            className={`${selection && i >= selection.start.x && i <= selection.end.x && 'selected-label'}`}
                        >
                            {name}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: props.height }, (_, row) => (
                    <tr key={row}>
                        <td
                            className={`${selection && row >= selection.start.y && row <= selection.end.y && 'selected-label'}`}
                        >
                            {row + 1}
                        </td>
                        {Array.from({ length: props.width }, (_, col) => (
                            <Cell
                                key={col}
                                row={row}
                                col={col}
                                data={data}
                                cellValue={cellValue}
                                editingPos={editingPos}
                                handleClick={handleClick}
                                selection={selection}
                                setCellValue={setCellValue}
                                updateCell={updateCell}
                            />
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function columnName(index: number): string {
    let name = '';
    let currNum = index + 1;

    while (currNum > 0) {
        const remainder = currNum % 26;
        if (remainder == 0) {
            name = 'Z' + name;
            currNum = Math.floor(currNum / 26) - 1;
        } else {
            name = String.fromCharCode(65 - 1 + remainder) + name;
            currNum = Math.floor(currNum / 26);
        }
    }

    return name;
}
