
import React, { useEffect, useState } from 'react';
import { fetchAdminStats, fetchAdminInsights, fetchUserAdminMemory } from '../api';

const AdminMemoryDashboard = () => {
    const [stats, setStats] = useState(null);
    const [insights, setInsights] = useState([]);
    const [userIdInput, setUserIdInput] = useState('');
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const statsData = await fetchAdminStats();
            setStats(statsData.stats);

            const insightsData = await fetchAdminInsights();
            setInsights(insightsData.insights || []); // Expecting array
        } catch (err) {
            console.error("Failed to load dashboard data", err);
        }
    };

    const handleUserSearch = async (e) => {
        e.preventDefault();
        if (!userIdInput) return;

        setLoading(true);
        setError(null);
        setUserData(null);

        try {
            const data = await fetchUserAdminMemory(userIdInput);
            setUserData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-8 text-indigo-900">🧠 Resonate Memory Layer Admin</h1>

            {/* Connectivity Status */}
            <div className="mb-6 flex gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1">
                    <h3 className="text-sm uppercase text-gray-500 font-semibold mb-1">System Status</h3>
                    <p className="text-2xl font-bold text-green-600">{stats?.system_status || 'Checking...'}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1">
                    <h3 className="text-sm uppercase text-gray-500 font-semibold mb-1">Total Memories</h3>
                    <p className="text-2xl font-bold text-indigo-600">{stats?.total_memories || '-'}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1">
                    <h3 className="text-sm uppercase text-gray-500 font-semibold mb-1">Last Updated</h3>
                    <p className="text-sm text-gray-700">{stats?.last_updated ? new Date(stats.last_updated).toLocaleString() : '-'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* User Inspector */}
                <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">User Memory Inspector</h2>
                    <form onSubmit={handleUserSearch} className="flex gap-2 mb-6">
                        <input
                            type="text"
                            placeholder="Enter User ID (UUID)"
                            className="flex-1 border p-2 rounded-lg"
                            value={userIdInput}
                            onChange={(e) => setUserIdInput(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? 'Fetching...' : 'Inspect'}
                        </button>
                    </form>

                    {error && <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>}

                    {userData && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-lg text-gray-700">Memory Timeline ({userData.count})</h3>
                                <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">User: {userData.userId}</span>
                            </div>

                            <div className="space-y-4 max-h-[600px] overflow-y-auto">
                                {userData.memories && userData.memories.length > 0 ? (
                                    userData.memories.map((mem) => (
                                        <div key={mem.id} className="border-l-4 border-indigo-400 pl-4 py-2 hover:bg-gray-50 transition">
                                            <p className="text-gray-800 text-lg font-medium">{mem.memory}</p>
                                            <div className="flex gap-2 mt-2 text-xs text-gray-500">
                                                <span>📅 {new Date(mem.created_at).toLocaleString()}</span>
                                                {mem.metadata?.category && <span className="bg-gray-200 px-2 rounded">{mem.metadata.category}</span>}
                                                {mem.metadata?.data_source && <span className="bg-blue-100 text-blue-800 px-2 rounded">{mem.metadata.data_source}</span>}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic">No memories found for this user.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent Insights Stream */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Recent Insights</h2>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                        {insights.length > 0 ? (
                            insights.map((insight, idx) => (
                                <div key={idx} className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                    <div className="flex justify-between mb-1">
                                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${insight.type === 'warning' ? 'bg-red-200 text-red-800' :
                                                insight.type === 'positive' ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'
                                            }`}>
                                            {insight.type}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-indigo-900">{insight.title}</h4>
                                    <p className="text-sm text-gray-700 mt-1">{insight.message}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm italic">No recent insights generated stream available yet.</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminMemoryDashboard;
