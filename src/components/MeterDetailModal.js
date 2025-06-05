// src/components/MeterDetailModal.js
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { fetchMeterHistory } from '../services/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    Filler
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import Papa from 'papaparse';
import { ChartPieIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    TimeScale,
    Title,
    Tooltip,
    Legend,
    Filler
);

const MODAL_REFRESH_INTERVAL = 30000;

function MeterDetailModal({ meterId, isOpen, onClose }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState(7);

    const loadHistory = async () => {
        if (!meterId) return;
        setLoading(true);
        try {
            const data = await fetchMeterHistory(meterId, timeRange);
            setHistory(data);
            setError(null);
        } catch (err) {
            setError(`Failed to load history for meter ${meterId}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpen || !meterId) return;

        loadHistory();
        const intervalId = setInterval(loadHistory, MODAL_REFRESH_INTERVAL);
        return () => clearInterval(intervalId);
    }, [isOpen, meterId, timeRange]);

    const handleTimeRangeChange = (days) => setTimeRange(days);

    const handleExportCSV = () => {
        if (history.length === 0) {
            alert("No data to export.");
            return;
        }

        const csvData = history.map(item => ({
            Timestamp: item.timestamp,
            Liters: item.Liters,
            Battery_mV: item.battery_vol,
            Network: item.network,
            Status: item.status_code,
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `meter_${meterId}_history_${timeRange}days.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const chartData = {
        datasets: [
            {
                label: 'Liters',
                data: history.map(h => ({
                    x: new Date(h.timestamp),
                    y: parseInt(h.WH, 10),
                })),
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.3)',
                tension: 0.4,
                fill: true,
                pointRadius: 3,
                pointBackgroundColor: 'rgb(54, 162, 235)',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
                labels: { color: '#e2e8f0' }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) label += ': ';
                        if (context.parsed.y !== null) {
                            label += `${context.parsed.y} Liters`;
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'day',
                    tooltipFormat: 'MMM d, yyyy HH:mm',
                    displayFormats: {
                        hour: 'HH:mm',
                        day: 'MMM d',
                    }
                },
                title: { display: true, text: 'Time', color: '#94a3b8' },
                ticks: { color: '#94a3b8' },
                grid: { color: 'rgba(148, 163, 184, 0.2)' }
            },
            y: {
                beginAtZero: false,
                title: { display: true, text: 'Liters', color: '#94a3b8' },
                ticks: { color: '#94a3b8' },
                grid: { color: 'rgba(148, 163, 184, 0.2)' }
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col text-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-sky-400">Meter Details: {meterId}</h2>
                    <div className="flex items-center space-x-2">
                        {history.length > 0 && (
                            <button
                                onClick={handleExportCSV}
                                title="Download CSV"
                                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-md text-slate-300 hover:text-white"
                            >
                                <ArrowDownTrayIcon className="h-5 w-5" />
                            </button>
                        )}
                        <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">×</button>
                    </div>
                </div>

                <div className="mb-4 flex space-x-2">
                    {[1, 7, 30, 90].map(days => (
                        <button
                            key={days}
                            onClick={() => handleTimeRangeChange(days)}
                            className={`px-3 py-1 rounded text-sm ${timeRange === days ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                        >
                            Last {days} Days
                        </button>
                    ))}
                </div>

                <div className="flex-grow h-96 min-h-[300px] bg-slate-700 p-2 rounded flex items-center justify-center">
                    {loading && (
                        <div className="text-center text-slate-300">
                            <svg className="animate-spin h-8 w-8 text-sky-400 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <p>Loading Chart Data...</p>
                        </div>
                    )}
                    {error && <p className="text-center text-red-400 pt-4">{error}</p>}
                    {!loading && !error && history.length > 0 && (
                        <div className="w-full h-full">
                            <Line options={chartOptions} data={chartData} />
                        </div>
                    )}
                    {!loading && !error && history.length === 0 && (
                        <div className="text-center text-slate-400">
                            <ChartPieIcon className="h-16 w-16 text-slate-500 mx-auto mb-3" />
                            <p className="font-semibold">No History Data Available</p>
                            <p className="text-sm">There's no usage data for the selected period.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MeterDetailModal;
