import React, { useState, useEffect } from 'react';
import { createIntervention, updateIntervention } from '../api';

export default function AddInterventionModal({ isOpen, onClose, onInterventionAdded, initialData = null }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        type: 'supplement',
        name: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        dosage: '',
        frequency: '',
        status: 'active',
        notes: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                type: initialData.type || 'supplement',
                name: initialData.name || '',
                startDate: initialData.startDate ? initialData.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
                endDate: initialData.endDate ? initialData.endDate.split('T')[0] : '',
                dosage: initialData.dosage || '',
                frequency: initialData.frequency || '',
                status: initialData.status || 'active',
                notes: initialData.notes || ''
            });
        } else {
            // Reset if adding new
            setFormData({
                type: 'supplement',
                name: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                dosage: '',
                frequency: '',
                status: 'active',
                notes: ''
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Prepare payload - filter out empty endDate if active
            const payload = { ...formData };
            if (payload.status === 'active') {
                payload.endDate = null;
            }

            if (initialData) {
                await updateIntervention(initialData._id, payload);
            } else {
                await createIntervention(payload);
            }

            onInterventionAdded();
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to save intervention');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/30">
                    <h3 className="text-lg font-bold text-white">
                        {initialData ? 'Edit Intervention' : 'Add New Intervention'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                            Type
                        </label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 
                       focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all outline-none appearance-none"
                        >
                            <option value="supplement">💊 Supplement</option>
                            <option value="diet">🥗 Diet / Nutrition</option>
                            <option value="fitness">💪 Fitness / Workout</option>
                            <option value="meditation">🧘 Meditation / Mindfulness</option>
                            <option value="other">⚡ Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                            Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            placeholder="e.g. Vitamin D3, Keto Diet"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 
                       focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 
                           focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all outline-none appearance-none"
                            >
                                <option value="active">🟢 Active (Ongoing)</option>
                                <option value="completed">✅ Completed</option>
                                <option value="discontinued">🛑 Discontinued</option>
                                <option value="paused">⏸️ Paused</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                Start Date
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                required
                                value={formData.startDate}
                                onChange={handleChange}
                                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 
                          focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all outline-none"
                            />
                        </div>
                    </div>

                    {formData.status !== 'active' && (
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                End Date
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                required={formData.status !== 'active'}
                                value={formData.endDate}
                                onChange={handleChange}
                                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 
                          focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all outline-none"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        {(formData.type === 'supplement' || formData.type === 'fitness') && (
                            <div className={formData.status !== 'active' ? "" : "col-span-2"}>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                    {formData.type === 'supplement' ? 'Dosage' : 'Duration'}
                                </label>
                                <input
                                    type="text"
                                    name="dosage"
                                    placeholder={formData.type === 'supplement' ? "e.g. 5000 IU" : "e.g. 30 mins"}
                                    value={formData.dosage}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 
                            focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all outline-none"
                                />
                            </div>
                        )}

                        <div className={(formData.type !== 'supplement' && formData.type !== 'fitness') ? "col-span-2" : ""}>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                Frequency
                            </label>
                            <input
                                type="text"
                                name="frequency"
                                placeholder="e.g. Daily, 3x/week"
                                value={formData.frequency}
                                onChange={handleChange}
                                required
                                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 
                        focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                            Notes (Optional)
                        </label>
                        <textarea
                            name="notes"
                            rows="3"
                            placeholder="Any specific protocols or goals..."
                            value={formData.notes}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 
                       focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all outline-none resize-none"
                        ></textarea>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-medium 
                       hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-slate-950 font-bold 
                       hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : (initialData ? 'Update Intervention' : 'Start Intervention')}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

