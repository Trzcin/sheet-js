import CellMap from './CellMap';
import { CellData, CellPosition, CellSelection } from './types';

export interface Formula {
    func: keyof typeof formulaFuncs;
    area: CellSelection;
    src: string;
    error?: string;
}

type FormulaFunc = (
    data: CellMap,
    area: CellSelection,
) => Exclude<CellData, Formula>;

const sum: FormulaFunc = (data, area) => {
    let elemSum = 0;
    for (let y = area.start.y; y <= area.end.y; y++) {
        for (let x = area.start.x; x <= area.end.x; x++) {
            const cellValue = data.get({ x, y });
            if (typeof cellValue === 'number') {
                elemSum += cellValue;
            }
        }
    }
    return elemSum;
};

export const formulaFuncs = {
    sum,
};

export function parseFormula(input: string): Formula {
    const funcName = input.slice(1, input.indexOf('('));
    if (!(funcName in formulaFuncs)) {
        return {
            func: 'sum',
            area: { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } },
            src: input,
            error: 'Unknown Function',
        };
    }

    const startStr = input.slice(input.indexOf('(') + 1, input.indexOf(':'));
    const start = posStrToCellPosition(startStr);
    const endStr = input.slice(input.indexOf(':') + 1, input.indexOf(')'));
    const end = posStrToCellPosition(endStr);

    return {
        func: funcName as keyof typeof formulaFuncs,
        area: { start, end },
        src: input,
    };
}

function posStrToCellPosition(pos: string): CellPosition {
    let col = 0;
    let row = 0;
    let first = true;

    for (const ch of pos) {
        if (ch >= '0' && ch <= '9') {
            row = row * 10 + parseInt(ch) - 1;
        } else {
            if (first) {
                col = col * 26 + ch.charCodeAt(0) - 65;
                first = false;
            } else {
                col = (col + 1) * 26 + ch.charCodeAt(0) - 65;
            }
        }
    }

    return { x: col, y: row };
}

export function computeFormula(
    formula: Formula,
    data: CellMap,
): Exclude<CellData, Formula> {
    if (formula.error) {
        return formula.error;
    }

    return formulaFuncs[formula.func](data, formula.area);
}
