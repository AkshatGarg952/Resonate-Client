import React, { useState, useEffect } from 'react';
import { getWithCookie, postWithCookie } from '../api';

export default function WaterTracker() {
    const [data, setData] = useState({ amountMl: 0, goalMl: 0 });
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [newGoal, setNewGoal] = useState(0);


    const [isAddingCustom, setIsAddingCustom] = useState(false);
    const [customAmount, setCustomAmount] = useState("");

    useEffect(() => {
        fetchWaterData();
    }, []);

    const fetchWaterData = async () => {
        try {
            const res = await getWithCookie('/water');
            if (res && res.today) {
                setData(res.today);
                setNewGoal(res.today.goalMl);
            }
        } catch (error) {
            console.error("Failed to fetch water data", error);
        } finally {
            setLoading(false);
        }
    };

    const logWater = async (amount) => {
        setAdding(true);
        try {
            const res = await postWithCookie('/water/log', { amountMl: amount });
            setData(res);
            setIsAddingCustom(false);
            setCustomAmount("");
        } catch (error) {
            console.error("Failed to log water", error);
        } finally {
            setAdding(false);
        }
    };

    const updateGoal = async () => {
        try {
            const res = await postWithCookie('/water/goal', { goalMl: parseInt(newGoal) });
            setData(res);
            setIsEditingGoal(false);
        } catch (error) {
            console.error("Failed to set goal", error);
        }
    };

    const progress = Math.min((data.amountMl / data.goalMl) * 100, 100);

    if (loading) return null;

    return (
        <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-6 relative overflow-hidden group">

            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

            <div className="flex items-start justify-between mb-6 relative z-10">
                <div>
                    <h3 className="text-lg font-bold text-blue-100 flex items-center gap-2">
                        <span className="text-xl">💧</span> Hydration
                    </h3>
                    <p className="text-xs text-blue-300/80 mt-1">Daily Water Goal</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setIsAddingCustom(!isAddingCustom);
                            setIsEditingGoal(false);
                        }}
                        className={`p-2 rounded-xl transition-colors ${isAddingCustom ? 'bg-blue-500/30 text-white' : 'bg-blue-500/10 text-blue-300 hover:bg-blue-500/20'}`}
                        title="Add Custom Amount"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </button>
                    <button
                        onClick={() => {
                            setIsEditingGoal(!isEditingGoal);
                            setIsAddingCustom(false);
                        }}
                        className={`p-2 rounded-xl transition-colors ${isEditingGoal ? 'bg-blue-500/30 text-white' : 'bg-blue-500/10 text-blue-300 hover:bg-blue-500/20'}`}
                        title="Edit Goal"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-black text-white">{data.amountMl}</span>
                <span className="text-sm font-medium text-blue-300 mb-2">/ {data.goalMl} ml</span>
            </div>


            <div className="w-full h-3 bg-slate-900/50 rounded-full overflow-hidden mb-6 border border-blue-500/10">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-700 ease-out relative"
                    style={{ width: `${progress}%` }}
                >
                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                </div>
            </div>


            {isEditingGoal ? (
                <div className="flex gap-2 animate-fade-in">
                    <input
                        type="number"
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                        placeholder="Daily Goal (ml)"
                        className="flex-1 bg-slate-900/80 border border-blue-500/30 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400"
                    />
                    <button
                        onClick={updateGoal}
                        className="px-4 py-2 bg-blue-500 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors"
                    >
                        Save
                    </button>
                </div>
            ) : isAddingCustom ? (
                <div className="flex gap-2 animate-fade-in">
                    <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder="Amount (ml)"
                        autoFocus
                        className="flex-1 bg-slate-900/80 border border-blue-500/30 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && customAmount) logWater(parseInt(customAmount));
                        }}
                    />
                    <button
                        onClick={() => customAmount && logWater(parseInt(customAmount))}
                        disabled={adding || !customAmount}
                        className="px-4 py-2 bg-cyan-500 text-white rounded-xl text-xs font-bold hover:bg-cyan-600 transition-colors disabled:opacity-50"
                    >
                        Add
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => logWater(250)}
                        disabled={adding}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-100 hover:bg-blue-500/30 active:scale-95 transition-all text-sm font-semibold group/btn"
                    >
                        <span className="text-lg group-hover/btn:scale-110 transition-transform">🥛</span>
                        +250ml
                    </button>
                    <button
                        onClick={() => logWater(500)}
                        disabled={adding}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-100 hover:bg-cyan-500/30 active:scale-95 transition-all text-sm font-semibold group/btn"
                    >
                        <span className="text-lg group-hover/btn:scale-110 transition-transform">🍶</span>
                        +500ml
                    </button>
                </div>
            )}
        </div>
    );
}
