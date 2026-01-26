import React, { useState } from 'react';
import { createIntervention } from '../api';
import AddInterventionModal from './AddInterventionModal';

const COMMON_INTERVENTIONS = [
    { name: 'Vitamin D3', type: 'supplement', icon: '☀️', defaultDosage: '5000 IU', defaultFreq: 'Daily' },
    { name: 'Magnesium', type: 'supplement', icon: '💊', defaultDosage: '400mg', defaultFreq: 'Nightly' },
    { name: 'Creatine', type: 'supplement', icon: '⚡', defaultDosage: '5g', defaultFreq: 'Daily' },
    { name: 'Keto Diet', type: 'diet', icon: '🥑', defaultDosage: '', defaultFreq: 'Daily' },
    { name: 'Meditation', type: 'meditation', icon: '🧘', defaultDosage: '10 mins', defaultFreq: 'Daily' },
];

export default function QuickAddWidget({ onInterventionAdded }) {
    const [loading, setLoading] = useState(null); // 'name' of item loading
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleQuickAdd = async (item) => {
        if (loading) return;
        setLoading(item.name);

        try {
            await createIntervention({
                type: item.type,
                name: item.name,
                startDate: new Date().toISOString().split('T')[0],
                dosage: item.defaultDosage,
                frequency: item.defaultFreq,
                status: 'active',
                notes: 'Added via Quick Add'
            });

            if (onInterventionAdded) onInterventionAdded();
            alert(`Started ${item.name}!`);
        } catch (error) {
            console.error(error);
            alert("Failed to add intervention");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-50">Quick Add</h3>
                    <p className="text-xs text-slate-500">Start a common protocol</p>
                </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {COMMON_INTERVENTIONS.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => handleQuickAdd(item)}
                        disabled={loading !== null}
                        className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-28 rounded-2xl 
                                 bg-gradient-to-b from-slate-800/80 to-slate-900/80 
                                 border border-slate-700/50 shadow-sm
                                 hover:border-primary/50 hover:from-slate-800 hover:to-slate-800 hover:scale-105
                                 hover:shadow-lg hover:shadow-primary/10
                                 transition-all duration-300 active:scale-95 group relative overflow-hidden"
                    >
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <span className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">
                            {item.icon}
                        </span>

                        <span className="text-xs font-semibold text-slate-300 text-center px-1 leading-tight group-hover:text-white transition-colors">
                            {loading === item.name ? (
                                <span className="flex flex-col items-center">
                                    <svg className="animate-spin h-3 w-3 mb-1 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Adding
                                </span>
                            ) : (
                                item.name
                            )}
                        </span>
                    </button>
                ))}

                {/* Custom Add Button */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-28 rounded-2xl 
                             border-2 border-dashed border-slate-700/50 bg-slate-800/30
                             hover:border-primary/50 hover:bg-slate-800/50 hover:scale-105
                             transition-all duration-300 active:scale-95 group"
                >
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-2 group-hover:border-primary/50 group-hover:bg-primary/10 transition-colors">
                        <svg className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-primary transition-colors">
                        Custom
                    </span>
                </button>
            </div>

            <AddInterventionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onInterventionAdded={onInterventionAdded}
            />
        </div>
    );
}
