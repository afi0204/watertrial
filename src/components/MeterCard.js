// src/components/MeterCard.js
import React from 'react';
// Corrected import: BatteryFullIcon changed to Battery100Icon
import { ClockIcon, WifiIcon as WifiOutlineIcon, Battery100Icon, EyeIcon } from '@heroicons/react/24/outline'; // Renamed WifiIcon to avoid conflict
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ExclamationCircleIcon,
    XCircleIcon,
    InformationCircleIcon,
    QuestionMarkCircleIcon,
    WifiIcon, // Solid WifiIcon for status
    BellAlertIcon // Import an alert icon
} from '@heroicons/react/24/solid';

// Helper function or object for status display
const getStatusDisplay = (statusCode) => {
    switch (statusCode?.toUpperCase()) { // Add toUpperCase for case-insensitivity
        case 'OK':
            return { text: 'OK', color: 'bg-green-500', icon: <CheckCircleIcon className="h-4 w-4 inline mr-1" /> };
        case 'LOW_BATT':
            return { text: 'Low Battery', color: 'bg-yellow-500', icon: <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" /> };
        case 'NO_SIGNAL':
            return { text: 'No Signal', color: 'bg-orange-500', icon: <WifiIcon className="h-4 w-4 inline mr-1 text-red-400" /> }; // Example
        case 'FORMAT_WARN':
            return { text: 'Format Warning', color: 'bg-amber-500', icon: <ExclamationCircleIcon className="h-4 w-4 inline mr-1" /> };
        case 'DATA_ERR':
            return { text: 'Data Error', color: 'bg-red-600', icon: <XCircleIcon className="h-4 w-4 inline mr-1" /> };
        case 'S_TYPE': // Keep existing or map them
             return { text: 'S-Type', color: 'bg-purple-500', icon: <InformationCircleIcon className="h-4 w-4 inline mr-1" /> };
        case '8': // Example for other specific codes
             return { text: 'Status 8', color: 'bg-blue-500', icon: <InformationCircleIcon className="h-4 w-4 inline mr-1" /> };
        default:
            return { text: statusCode || 'Unknown', color: 'bg-gray-500', icon: <QuestionMarkCircleIcon className="h-4 w-4 inline mr-1" /> };
    }
};

function MeterCard({ meter, onSelect }) {
    const formatBattery = (mv) => {
        if (!mv) return "N/A";
        const voltage = parseFloat(mv) / 1000;
        return `${voltage.toFixed(2)}V`;
    };

    const statusInfo = getStatusDisplay(meter.status_code);

    // Determine card border based on alert_status
    let cardBorderColor = "border-transparent"; // Default no alert border
    if (meter.alert_status) {
        if (meter.alert_status.includes("Low Battery") || meter.alert_status.includes("No/Low Signal")) {
            cardBorderColor = "border-orange-500"; // Warning
        } else if (meter.alert_status.includes("Data Issue") || meter.alert_status.includes("Invalid")) {
            cardBorderColor = "border-red-500"; // Error
        } else {
            cardBorderColor = "border-yellow-400"; // Generic alert
        }
    }

    return (
        <div
            className={`bg-slate-800/70 backdrop-blur-lg border-2 ${cardBorderColor} text-white rounded-xl shadow-2xl p-6 hover:scale-105 transform transition-all duration-300 cursor-pointer flex flex-col justify-between`}
            onClick={onSelect}
        >
            <div>
                <div className="flex justify-between items-center mb-1"> {/* Reduced mb */}
                    <h3 className="text-xl font-semibold text-sky-400">{meter.MID}</h3>
                    <span
                        title={statusInfo.text} // Add a tooltip for full status text
                        className={`px-3 py-1 text-xs font-bold rounded-full ${statusInfo.color} text-white flex items-center shadow`} // Adjusted padding and added shadow
                    >
                        {statusInfo.icon}
                        {statusInfo.text.length > 10 ? meter.status_code : statusInfo.text} {/* Show full text or code if too long */}
                    </span>
                </div>
                <p className="text-3xl font-bold text-emerald-400 mb-4">{meter.WH} <span className="text-lg font-normal text-slate-400">Liters</span></p>

                <div className="space-y-2 text-sm text-slate-300">
                    <div className="flex items-center">
                        {/* Corrected usage */}
                        <Battery100Icon className="h-5 w-5 mr-2 text-lime-400" />
                        Battery: {formatBattery(meter.battery_vol)}
                    </div>
                    <div className="flex items-center">
                        <WifiOutlineIcon className="h-5 w-5 mr-2 text-teal-400" />
                        Network: {meter.network || "N/A"}
                    </div>
                    <div className="flex items-center">
                        <ClockIcon className="h-5 w-5 mr-2 text-slate-400" />
                        Last Update: {meter.timestamp ? new Date(meter.timestamp).toLocaleString() : "N/A"}
                    </div>
                </div>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); onSelect(); }}
                className="mt-6 w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
            >
                <EyeIcon className="h-5 w-5 mr-2" />
                View Details
            </button>
        </div>
    );
}

export default MeterCard;