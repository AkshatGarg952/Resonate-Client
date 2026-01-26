import React, { useState, useEffect } from 'react';
import AddInterventionModal from '../components/AddInterventionModal';
import { getAllInterventions, stopIntervention } from '../api';

export default function InterventionsPage() {
    const [interventions, setInterventions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIntervention, setEditingIntervention] = useState(null);
    const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'

    const fetchInterventions = async () => {
        try {
            setLoading(true);
            const data = await getAllInterventions();
            setInterventions(data.interventions);
        } catch (err) {
            console.error(err);
            setError('Failed to load interventions');
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (id, name) => {
        if (!window.confirm(`Mark ${name} as successfully completed?`)) return;

        try {
            await stopIntervention(id, 'completed');
            fetchInterventions();
        } catch (err) {
            console.error(err);
            alert("Failed to update intervention");
        }
    };

    const handleDiscontinue = async (id, name) => {
        const reason = window.prompt(`Why are you stopping ${name}? (Optional)`);
        if (reason === null) return; // User cancelled

        try {
            await stopIntervention(id, 'discontinued', reason);
            fetchInterventions();
        } catch (err) {
            console.error(err);
            alert("Failed to stop intervention");
        }
    };

    const handleEdit = (intervention) => {
        setEditingIntervention(intervention);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingIntervention(null);
    };

    useEffect(() => {
        fetchInterventions();
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'supplement': return '💊';
            case 'diet': return '🥗';
            case 'fitness': return '💪';
            case 'meditation': return '🧘';
            default: return '⚡';
        }
    };

    const activeInterventions = interventions.filter(i => i.status === 'active');
    const historyInterventions = interventions.filter(i => i.status !== 'active');
    const displayedInterventions = activeTab === 'active' ? activeInterventions : historyInterventions;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-primary/30">

            <main className="max-w-7xl mx-auto px-5 py-8">

                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight mb-1">
                            Interventions <span className="text-primary">Manager</span>
                        </h1>
                        <p className="text-slate-400">Track your active protocols and health experiments.</p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="group px-5 py-3 rounded-2xl bg-primary text-slate-950 font-bold hover:bg-white transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                        <span className="text-lg bg-slate-950/20 w-6 h-6 rounded-full flex items-center justify-center text-slate-950 group-hover:bg-slate-950/20 transition-colors">+</span>
                        New Intervention
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-slate-800 mb-6">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'active' ? 'text-primary border-primary' : 'text-slate-500 border-transparent hover:text-slate-300'
                            }`}
                    >
                        Active Protocols ({activeInterventions.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'history' ? 'text-primary border-primary' : 'text-slate-500 border-transparent hover:text-slate-300'
                            }`}
                    >
                        History ({historyInterventions.length})
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-slate-800 border-t-primary rounded-full animate-spin"></div>
                    </div>
                ) : error ? (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-center">
                        {error}
                    </div>
                ) : displayedInterventions.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800/50 border-dashed">
                        <div className="text-6xl mb-4 opacity-50">🧪</div>
                        <h3 className="text-xl font-bold text-white mb-2">No {activeTab} interventions</h3>
                        <p className="text-slate-400 max-w-md mx-auto mb-6">
                            {activeTab === 'active'
                                ? "You're not tracking any active protocols right now. Start an experiment!"
                                : "You haven't completed or discontinued any protocols yet."}
                        </p>
                        {activeTab === 'active' && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="text-primary hover:text-white font-bold underline decoration-primary/50 hover:decoration-white transition-all"
                            >
                                Add your first protocol
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {displayedInterventions.map((item) => (
                            <div key={item._id} className={`group relative bg-slate-900 border ${item.status === 'active' ? 'border-slate-800' : 'border-slate-800/50 opacity-75'} rounded-3xl p-6 hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5`}>

                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl border border-slate-700 group-hover:scale-110 transition-transform">
                                        {getIcon(item.type)}
                                    </div>
                                    <div className='flex gap-2'>
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                                            title="Edit"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border flex items-center ${item.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                item.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">
                                    {item.name}
                                </h3>
                                {item.notes && <p className="text-sm text-slate-500 line-clamp-2 mb-3">{item.notes}</p>}

                                <div className="space-y-2 mt-4 text-sm text-slate-400">
                                    {item.dosage && (
                                        <div className="flex items-center gap-2">
                                            <span className="w-4 text-center">📏</span>
                                            <span>{item.dosage}</span>
                                        </div>
                                    )}
                                    {item.frequency && (
                                        <div className="flex items-center gap-2">
                                            <span className="w-4 text-center">🔄</span>
                                            <span>{item.frequency}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <span className="w-4 text-center">📅</span>
                                        <span>Started {new Date(item.startDate).toLocaleDateString()}</span>
                                    </div>

                                    {item.endDate && item.status !== 'active' && (
                                        <div className="flex items-center gap-2 text-red-400">
                                            <span className="w-4 text-center">🛑</span>
                                            <span>Ended {new Date(item.endDate).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Active: Progress Bar, Inactive: Nothing/Completed message */}
                                <div className="mt-6 flex items-center justify-between gap-4">
                                    {item.status === 'active' ? (
                                        <>
                                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex-1">
                                                <div className="h-full bg-gradient-to-r from-primary to-emerald-400 w-full animate-pulse opacity-50"></div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleComplete(item._id, item.name)}
                                                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-bold hover:bg-emerald-500/20 transition-colors"
                                                >
                                                    Complete
                                                </button>
                                                <button
                                                    onClick={() => handleDiscontinue(item._id, item.name)}
                                                    className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-colors"
                                                >
                                                    Discontinue
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full text-center text-xs text-slate-500 font-medium bg-slate-800/50 py-1.5 rounded-lg">
                                            Protocol {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                        </div>
                                    )}
                                </div>

                            </div>
                        ))}
                    </div>
                )}

            </main>

            <AddInterventionModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onInterventionAdded={fetchInterventions}
                initialData={editingIntervention}
            />

        </div>
    );
}

