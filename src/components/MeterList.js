// src/components/MeterList.js
import React, { useState, useEffect, useMemo } from 'react'; // Add useMemo
import { fetchMeters } from '../services/api';
import MeterCard from './MeterCard';
import { DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline'; // Icon for initial empty state
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'; // Icon for search bar
import MeterDetailModal from './MeterDetailModal';

const REFRESH_INTERVAL = 30000; // 30 seconds

function MeterList() {
    const [meters, setMeters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMeter, setSelectedMeter] = useState(null);
    const [searchTerm, setSearchTerm] = useState(""); // State for search term

    const loadMeters = async () => {
        try {
            const result = await fetchMeters();
            setMeters(result || []); // Assuming fetchMeters directly returns the array or throws an error
            setError(null);
        } catch (err) {
            setMeters([]); // Clear meters on error
            setError('Error loading meters. Is the API available?');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMeters(); // Initial fetch

        const intervalId = setInterval(() => {
            console.log('Auto-refresh: Fetching meters...');
            loadMeters();
        }, REFRESH_INTERVAL);

        return () => clearInterval(intervalId);
    }, []);

    // Memoize the filtered meters to avoid re-filtering on every render unless meters or searchTerm changes
    const filteredMeters = useMemo(() => {
        if (!searchTerm) {
            return meters; // If no search term, return all meters
        }
        return meters.filter(meter =>
            meter.MID.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [meters, searchTerm]);

    if (loading && meters.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-slate-400">
                <svg className="animate-spin h-10 w-10 text-sky-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-xl">Loading Meter Data...</p>
                <p className="text-sm">Please wait a moment.</p>
            </div>
        );
    }

    if (error) {
        return <p className="text-center text-red-500 p-8">{error}</p>;
    }

    // Check based on filteredMeters after initial load
    // This handles the case where there are meters, but the search yields no results
    if (!loading && filteredMeters.length === 0 && searchTerm) {
         return (
            <div className="container mx-auto p-4">
                {/* Search Bar will be here */}
                <div className="mb-6 relative">
                    <input
                        type="text"
                        placeholder="Search by Meter ID..."
                        className="w-full p-3 pl-10 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
                <p className="text-center text-slate-400 p-8">No meters found matching "{searchTerm}".</p>
            </div>
        );
    }

    // Original empty state - only show if NOT loading, no meters, AND no search term
    if (!loading && meters.length === 0 && !searchTerm) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-slate-400">
                <DocumentMagnifyingGlassIcon className="h-20 w-20 text-slate-500 mb-4" /> {/* Example Icon */}
                <p className="text-2xl font-semibold mb-2">No Meter Data Found</p>
                <p className="text-sm">It looks like there are no meters to display right now.</p>
                <p className="text-sm">Once data is submitted, it will appear here.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold text-center mb-6 text-sky-600">Water Meter Dashboard</h1>

            {/* Search Bar */}
            <div className="mb-8 relative">
                <input
                    type="text"
                    placeholder="Search by Meter ID..."
                    className="w-full p-3 pl-10 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-shadow"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Grid now uses filteredMeters */}
            {filteredMeters.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredMeters.map(meter => (
                        <MeterCard key={meter.MID} meter={meter} onSelect={() => setSelectedMeter(meter.MID)} />
                    ))}
                </div>
            ) : (
                 // This case should ideally be caught by the specific empty/no results checks above,
                 // but as a fallback, show a message if filteredMeters is empty and not loading.
                 // The specific checks for searchTerm handle the different empty states better.
                 !loading && <p className="text-center text-slate-400 p-8">No meters to display. {searchTerm ? `No matches for "${searchTerm}".`: ""}</p>
            )}

            {selectedMeter && (
                <MeterDetailModal
                    meterId={selectedMeter}
                    isOpen={!!selectedMeter}
                    onClose={() => setSelectedMeter(null)}
                />
            )}
        </div>
    );
}

export default MeterList;
