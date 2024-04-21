import { CellPosition, CellSelection } from './types';

export function inSelection(
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
