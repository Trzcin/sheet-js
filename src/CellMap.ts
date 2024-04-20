import { CellData, CellPosition } from "./types";

export default class CellMap {
    private map: Map<string, CellData>;

    constructor(map?: Map<string, CellData>) {
        this.map = map ? map : new Map();
    }
    
    public has(position: CellPosition): boolean {
        return this.map.has(JSON.stringify(position));
    }
    
    public set(position: CellPosition, value: CellData): CellMap {
        return new CellMap(this.map.set(JSON.stringify(position), value));
    }
    
    public get(position: CellPosition): CellData | undefined {
        return this.map.get(JSON.stringify(position));
    }
    
    public delete(position: CellPosition) {
        this.map.delete(JSON.stringify(position));
    }
}