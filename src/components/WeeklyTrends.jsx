import React, { useEffect, useState } from "react";
import { fetchWeeklyLogs } from "../api";

const WeeklyTrends = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const getLogs = async () => {
            try {
                const data = await fetchWeeklyLogs();
                if (data.success) {
                    setLogs(data.logs);
                } else {
                    setError("Failed to load logs");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        getLogs();
    }, []);

    if (loading) return <div className="p-4 text-center">Loading trends...</div>;
    if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

    if (logs.length === 0) {
        return <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center text-gray-500">No logs for this week yet. Start checking in!</div>;
    }

    // Helper to format date
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", { weekday: 'short', month: 'numeric', day: 'numeric' });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Weekly Trends</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Energy</th>
                            <th scope="col" className="px-6 py-3">Sleep</th>
                            <th scope="col" className="px-6 py-3">Stress</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                    {formatDate(log.date)}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${log.energyLevel >= 7 ? 'bg-green-100 text-green-800' :
                                            log.energyLevel >= 4 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {log.energyLevel}/10
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${log.sleepQuality >= 7 ? 'bg-green-100 text-green-800' :
                                            log.sleepQuality >= 4 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {log.sleepQuality}/10
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${log.stressLevel <= 4 ? 'bg-green-100 text-green-800' :
                                            log.stressLevel <= 7 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {log.stressLevel}/10
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WeeklyTrends;
