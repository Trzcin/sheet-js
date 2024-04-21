import { Formula } from './formula';

/** Represents a position of a cell starting at (0,0) */
export interface CellPosition {
    x: number;
    y: number;
}

export type CellData = number | string | Formula;

export interface CellSelection {
    start: CellPosition;
    end: CellPosition;
}
