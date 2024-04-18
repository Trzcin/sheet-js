import { useMemo, useState } from "react";
import CellMap from "../CellMap";

interface SpreadsheetProps {
    width: number;
    height: number;
    initialData?: CellMap;
}

export default function Spreadsheet(props: SpreadsheetProps) {
    const columnNames = useMemo(() => (
        Array.from({length: props.width}, (_, i) => columnName(i))
    ), [props.width]);
    const [data] = useState<CellMap>(props.initialData ?? new CellMap());

    return <table>
        <thead>
            <tr>
                <th></th>
                {columnNames.map((name, i) => (
                    <th key={i}>{name}</th>
                ))}
            </tr>
        </thead>
        <tbody>
            {Array.from({ length: props.height }, (_, row) => (
                <tr key={row}>
                    <td>{row+1}</td>
                    {Array.from({ length: props.width }, (_, col) => (
                        <td key={col}>{data.get({x: col, y: row})}</td>
                    ))}
                </tr>
            ))}
        </tbody>
    </table>;
}

function columnName(index: number): string {
    let name = "";
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