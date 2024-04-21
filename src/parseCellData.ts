import { parseFormula } from './formula';
import { CellData } from './types';

export default function parseCellData(input: string): CellData {
    if (input[0] === '=') {
        return parseFormula(input);
    }

    const valueNum = parseFloat(input.trim().replace(',', '.'));
    if (!isNaN(valueNum)) {
        return valueNum;
    }

    return input;
}
