import { CellData, CellPosition } from "./types";

export default class CellMap {
    private map: Map<string, CellData>;

    constructor() {
        this.map = new Map();
    }
    
    public has(position: CellPosition): boolean {
        return this.map.has(JSON.stringify(position));
    }
    
    public set(position: CellPosition, value: CellData): void {
        this.map.set(JSON.stringify(position), value);
    }
    
    public get(position: CellPosition): CellData | undefined {
        return this.map.get(JSON.stringify(position));
    }
}