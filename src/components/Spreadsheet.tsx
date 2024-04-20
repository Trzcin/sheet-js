import React, { useEffect, useMemo, useRef, useState } from 'react';
import CellMap from '../CellMap';
import { CellPosition, CellSelection } from '../types';
import { useModifierKeys } from '../hooks/useModifierKeys';

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

    useEffect(() => {
        if (selection !== undefined && table.current) {
            table.current.focus();
        } else if (selection === undefined && table.current) {
            table.current.blur();
        }
    }, [selection]);

    function handleClick(position: CellPosition) {
        if (selection && inSelection(position, selection)) {
            setSelection(undefined);
            setEditingPos(position);
            const cellData = data.get(position);
            if (typeof cellData === 'string') {
                setCellValue(cellData);
            } else if (typeof cellData === 'number') {
                setCellValue(cellData.toString());
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
            const valueNum = parseFloat(cellValue.trim().replace(',', '.'));
            if (!isNaN(valueNum)) {
                setData((prev) => prev.set(editingPos, valueNum));
            } else {
                setData((prev) => prev.set(editingPos, cellValue));
            }
        }
        setEditingPos(undefined);
        setCellValue('');
    }

    return (
        <table
            tabIndex={0}
            ref={table}
            onKeyDown={(ev) => {
                arrowKeyMove(ev);
                deselect(ev);
                deleteCells(ev);
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
                            <td
                                onClick={() => handleClick({ x: col, y: row })}
                                key={col}
                                className={`${selection && inSelection({ x: col, y: row }, selection) && 'selected'}`}
                            >
                                {editingPos &&
                                editingPos.x === col &&
                                editingPos.y === row ? (
                                    <input
                                        value={cellValue}
                                        onInput={(ev) =>
                                            setCellValue(ev.currentTarget.value)
                                        }
                                        onBlur={updateCell}
                                        autoFocus
                                    />
                                ) : (
                                    data.get({ x: col, y: row })
                                )}
                            </td>
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

function inSelection(
    position: CellPosition,
    selection: CellSelection,
): boolean {
    return (
        position.x >= selection.start.x &&
        position.x <= selection.end.x &&
        position.y >= selection.start.y &&
        position.y <= selection.end.y
    );
}
