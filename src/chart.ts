import { Chart } from 'chart.js';
import { CellSelection } from './types';
import CellMap from './CellMap';

export interface ChartData {
    selection: CellSelection;
    chart: Chart;
}

export function updateChart(chartData: ChartData, data: CellMap) {
    const xValues: number[] = [];
    for (
        let row = chartData.selection.start.y;
        row <= chartData.selection.end.y;
        row++
    ) {
        const cell = data.get({ x: chartData.selection.start.x, y: row });
        if (cell && typeof cell === 'number') {
            xValues.push(cell);
        }
    }
    const yValues: number[] = [];
    for (
        let row = chartData.selection.start.y;
        row <= chartData.selection.end.y;
        row++
    ) {
        const cell = data.get({ x: chartData.selection.end.x, y: row });
        if (cell && typeof cell === 'number') {
            yValues.push(cell);
        }
    }

    chartData.chart.data.labels = xValues;
    chartData.chart.data.datasets[0].data = yValues;
    chartData.chart.update();
}
