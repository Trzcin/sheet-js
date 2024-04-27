import CellMap from './CellMap';
import { CellPosition, CellSelection } from './types';

export interface Formula {
    func: keyof typeof formulaFuncs;
    area: CellSelection;
    src: string;
    error?: string;
}

type FormulaFunc = (data: CellMap, area: CellSelection) => number | string;

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

const avg: FormulaFunc = (data, area) => {
    let elemSum = 0;
    let count = 0;
    for (let y = area.start.y; y <= area.end.y; y++) {
        for (let x = area.start.x; x <= area.end.x; x++) {
            const cellValue = data.get({ x, y });
            if (typeof cellValue === 'number') {
                elemSum += cellValue;
                count++;
            }
        }
    }
    return elemSum / count;
};

const min: FormulaFunc = (data, area) => {
    let minValue = Infinity;
    for (let y = area.start.y; y <= area.end.y; y++) {
        for (let x = area.start.x; x <= area.end.x; x++) {
            const cellValue = data.get({ x, y });
            if (typeof cellValue === 'number' && cellValue < minValue) {
                minValue = cellValue;
            }
        }
    }
    return minValue;
};

const max: FormulaFunc = (data, area) => {
    let maxValue = -Infinity;
    for (let y = area.start.y; y <= area.end.y; y++) {
        for (let x = area.start.x; x <= area.end.x; x++) {
            const cellValue = data.get({ x, y });
            if (typeof cellValue === 'number' && cellValue > maxValue) {
                maxValue = cellValue;
            }
        }
    }
    return maxValue;
};

export const formulaFuncs = {
    sum,
    avg,
    min,
    max,
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
            row = row * 10 + parseInt(ch);
        } else {
            if (first) {
                col = col * 26 + ch.charCodeAt(0) - 65;
                first = false;
            } else {
                col = (col + 1) * 26 + ch.charCodeAt(0) - 65;
            }
        }
    }

    return { x: col, y: row - 1 };
}

export function computeFormula(
    formula: Formula,
    data: CellMap,
): number | string {
    if (formula.error) {
        return formula.error;
    }

    return formulaFuncs[formula.func](data, formula.area);
}
