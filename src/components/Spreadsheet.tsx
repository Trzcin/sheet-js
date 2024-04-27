import React, { useEffect, useMemo, useRef, useState } from 'react';
import CellMap from '../CellMap';
import { CellPosition, CellSelection } from '../types';
import { useModifierKeys } from '../hooks/useModifierKeys';
import parseCellData from '../parseCellData';
import { inSelection } from '../utils';
import Cell from './Cell';

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

    useEffect(() => {
        if (selection !== undefined && table.current) {
            table.current.focus();
        } else if (selection === undefined && table.current) {
            table.current.blur();
        }
    }, [selection]);

    function handleClick(position: CellPosition) {
        if (selection && inSelection(position, selection)) {
            const cellData = data.get(position);
            if (typeof cellData === 'object' && 'selection' in cellData) {
                return;
            }

            setSelection(undefined);
            setEditingPos(position);
            if (typeof cellData === 'string') {
                setCellValue(cellData);
            } else if (typeof cellData === 'number') {
                setCellValue(cellData.toString());
            } else if (typeof cellData === 'object' && 'src' in cellData) {
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

    function deselect(ev: React.KeyboardEvent): boolean {
        if (ev.key !== 'Escape') {
            return false;
        }
        setSelection(undefined);
        return true;
    }

    function deleteCells(ev: React.KeyboardEvent): boolean {
        if (selection === undefined || ev.key !== 'Delete') {
            return false;
        }

        const updatedData = new CellMap(data.map);
        for (let y = selection.start.y; y <= selection.end.y; y++) {
            for (let x = selection.start.x; x <= selection.end.x; x++) {
                updatedData.delete({ x, y });
            }
        }
        setData(updatedData);

        return true;
    }

    function arrowKeyMove(ev: React.KeyboardEvent): boolean {
        if (
            selection === undefined ||
            (ev.key !== 'ArrowUp' &&
                ev.key !== 'ArrowDown' &&
                ev.key !== 'ArrowLeft' &&
                ev.key !== 'ArrowRight')
        ) {
            return false;
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

        return true;
    }

    function updateCell() {
        if (!editingPos) return;

        if (
            cellValue.trim() !== '' &&
            cellValue.trim() !== data.get(editingPos)
        ) {
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

    function handleCopy(ev: React.KeyboardEvent): boolean {
        if (!selection || !ev.ctrlKey || ev.key !== 'c') {
            return false;
        }

        setCopiedArea({
            start: { ...selection.start },
            end: { ...selection.end },
        });
        return true;
    }

    function handlePaste(ev: React.KeyboardEvent): boolean {
        if (!selection || !copiedArea || !ev.ctrlKey || ev.key !== 'v') {
            return false;
        }

        const updatedData = new CellMap(data.map);
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

        return true;
    }

    function handleAddChart(ev: React.KeyboardEvent): boolean {
        if (!selection || !ev.ctrlKey || ev.key !== 'g') {
            return false;
        }
        ev.preventDefault();

        setData((prev) =>
            prev.set(
                { x: selection.end.x + 1, y: selection.start.y },
                {
                    selection: {
                        start: { ...selection.start },
                        end: { ...selection.end },
                    },
                },
            ),
        );

        return true;
    }

    function startEditingSelected(ev: React.KeyboardEvent) {
        if (!selection || ev.shiftKey || ev.ctrlKey) {
            return;
        }

        const cellData = data.get(selection.start);
        if (typeof cellData === 'object' && 'selection' in cellData) {
            return;
        }

        setSelection(undefined);
        setEditingPos({ ...selection.start });
        if (typeof cellData === 'string') {
            setCellValue(cellData);
        } else if (typeof cellData === 'number') {
            setCellValue(cellData.toString());
        } else if (typeof cellData === 'object' && 'src' in cellData) {
            setCellValue(cellData.src);
        }
    }

    function updateCellOnEnter(ev: React.KeyboardEvent): boolean {
        if (!editingPos || ev.key !== 'Enter') {
            return false;
        }

        updateCell();
        const yPos =
            editingPos.y < props.height - 1 ? editingPos.y + 1 : editingPos.y;
        setSelection({
            start: { ...editingPos, y: yPos },
            end: { ...editingPos, y: yPos },
        });
        return true;
    }

    return (
        <table
            tabIndex={0}
            ref={table}
            onKeyDown={(ev) => {
                let shortcut = arrowKeyMove(ev);
                shortcut = shortcut || deselect(ev);
                shortcut = shortcut || deleteCells(ev);
                shortcut = shortcut || handleCopy(ev);
                shortcut = shortcut || handlePaste(ev);
                shortcut = shortcut || handleAddChart(ev);
                shortcut = shortcut || updateCellOnEnter(ev);

                if (!shortcut) startEditingSelected(ev);
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
                                key={`${row}-${col}`}
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
