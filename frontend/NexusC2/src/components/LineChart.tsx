import { useRef, useEffect } from "react"
import React from "react"
import Chart from "chart.js/auto"

interface LineChartProps {
    data: number[];
    labels: string[];
    width?: number;
    height?: number;
}

const LineChart: React.FC<LineChartProps> = ({data, labels, width, height}) => {
    const chartRef = useRef<HTMLCanvasElement>(null)
    const chartValueRef = useRef<Chart>()

    useEffect(() => {
        if(chartRef.current){
            if(chartValueRef.current){
                chartValueRef.current.destroy()
            }
            const ctx = chartRef.current.getContext('2d')

            if (ctx) {
                chartValueRef.current = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels,
                        datasets: [
                            {
                                data,
                                fill: false,
                                borderColor: 'rgba(75, 192, 192, 1)',
                                borderWidth: 2,
                                tension: 0.4,
                            },
                        ],
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true,
                            },
                        },
                        plugins: {
                            legend: {
                                display: false,
                            },
                        },
                    },
                })
            }
        }

        return () => {
            if(chartValueRef.current){
                chartValueRef.current.destroy()
            }
        }
    }, [data, labels])

    return <canvas ref={chartRef} width={width} height={height} />
}

export default LineChart