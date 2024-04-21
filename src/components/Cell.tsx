import CellMap from '../CellMap';
import { CellPosition, CellSelection } from '../types';
import { inSelection } from '../utils';
import { computeFormula } from '../formula';

interface CellProps {
    col: number;
    row: number;
    selection?: CellSelection;
    editingPos?: CellPosition;
    cellValue: string;
    setCellValue: React.Dispatch<React.SetStateAction<string>>;
    handleClick(pos: CellPosition): void;
    updateCell(): void;
    data: CellMap;
}

export default function Cell({ data, col, row, ...props }: CellProps) {
    const cellData = data.get({ x: col, y: row });
    const value =
        typeof cellData === 'object'
            ? computeFormula(cellData, data)
            : cellData;

    return (
        <td
            onClick={() => props.handleClick({ x: col, y: row })}
            className={`${props.selection && inSelection({ x: col, y: row }, props.selection) && 'selected'}`}
        >
            {props.editingPos &&
            props.editingPos.x === col &&
            props.editingPos.y === row ? (
                <input
                    value={props.cellValue}
                    onInput={(ev) => props.setCellValue(ev.currentTarget.value)}
                    onBlur={props.updateCell}
                    autoFocus
                />
            ) : (
                value
            )}
        </td>
    );
}
