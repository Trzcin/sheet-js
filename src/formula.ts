import CellMap from './CellMap';
import { CellData, CellSelection } from './types';

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
    return 'a';
};

export const formulaFuncs = {
    sum,
};

export function parseFormula(input: string): Formula {
    return {
        func: 'sum',
        area: { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } },
        src: input,
    };
}

export function computeFormula(
    formula: Formula,
    data: CellMap,
): Exclude<CellData, Formula> {
    return formulaFuncs[formula.func](data, formula.area);
}
