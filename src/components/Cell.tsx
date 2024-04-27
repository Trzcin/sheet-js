import CellMap from '../CellMap';
import { CellPosition, CellSelection } from '../types';
import { inSelection } from '../utils';
import { computeFormula } from '../formula';
import LineChart from './LineChart';

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
    let value: string | number | undefined | React.ReactNode;

    if (
        props.editingPos &&
        props.editingPos.x === col &&
        props.editingPos.y == row
    ) {
        value = (
            <input
                value={props.cellValue}
                onInput={(ev) => props.setCellValue(ev.currentTarget.value)}
                onBlur={props.updateCell}
                autoFocus
            />
        );
    } else if (typeof cellData === 'object') {
        if ('src' in cellData) {
            value = computeFormula(cellData, data);
        } else {
            value = <LineChart data={data} selection={cellData.selection} />;
        }
    } else {
        value = cellData;
    }

    return (
        <td
            onClick={() => props.handleClick({ x: col, y: row })}
            className={`${props.selection && inSelection({ x: col, y: row }, props.selection) && 'selected'}`}
        >
            {value}
        </td>
    );
}
