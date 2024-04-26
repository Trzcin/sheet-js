import { useEffect, useRef } from 'react';
import CellMap from '../CellMap';
import { CellSelection } from '../types';
import { Chart } from 'chart.js/auto';

interface LineChartProps {
    data: CellMap;
    selection: CellSelection;
}

export default function LineChart(props: LineChartProps) {
    const canvas = useRef<HTMLCanvasElement>(null);
    const chart = useRef<Chart>();

    useEffect(() => {
        if (!canvas.current) return;

        if (chart.current === undefined) {
            chart.current = new Chart(canvas.current, {
                type: 'line',
                data: {
                    labels: getXLabels(props.data, props.selection),
                    datasets: [
                        {
                            data: getYLabels(props.data, props.selection),
                        },
                    ],
                },
                options: {
                    plugins: {
                        legend: {
                            display: false,
                        },
                    },
                },
            });
        }

        return () => {
            chart.current?.destroy();
            chart.current = undefined;
        };
        // in this case I want this effect to run just once to initialize the chart
        // the next effect is responsible for updates when props change
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!chart.current) return;

        chart.current.data.labels = getXLabels(props.data, props.selection);
        chart.current.data.datasets[0].data = getYLabels(
            props.data,
            props.selection,
        );
        chart.current.update();
    }, [props.data, props.selection]);

    return (
        <div className="canvas-container">
            <canvas width={400} height={200} ref={canvas}></canvas>
        </div>
    );
}

function getXLabels(data: CellMap, selection: CellSelection): number[] {
    const labels: number[] = [];

    for (let row = selection.start.y; row <= selection.end.y; row++) {
        const cell = data.get({ x: selection.start.x, y: row });
        if (cell && typeof cell === 'number') {
            labels.push(cell);
        }
    }

    return labels;
}

function getYLabels(data: CellMap, selection: CellSelection): number[] {
    const labels: number[] = [];

    for (let row = selection.start.y; row <= selection.end.y; row++) {
        const cell = data.get({ x: selection.end.x, y: row });
        if (cell && typeof cell === 'number') {
            labels.push(cell);
        }
    }

    return labels;
}
