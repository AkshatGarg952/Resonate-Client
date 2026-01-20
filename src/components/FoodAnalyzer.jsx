
import React, { useState } from "react";
import { analyzeFoodImage } from "../api";
import { Upload, Loader2, Utensils, AlertCircle, Info } from "lucide-react";

const FoodAnalyzer = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [cuisine, setCuisine] = useState("General");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
            setError("");
            setResult(null);
        }
    };

    const handleAnalyze = async () => {
        if (!file) {
            setError("Please upload an image first.");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const response = await analyzeFoodImage(file, cuisine);
            setResult(response.data);
        } catch (err) {
            setError(err.message || "Failed to analyze food. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">

                <header className="space-y-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent flex items-center gap-2">
                        <Utensils className="text-orange-500" /> AI Food Analyzer
                    </h1>
                    <p className="text-gray-400">Upload a picture of your meal to get instant nutritional insights.</p>
                </header>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Upload Section */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-300">Cuisine Context (Optional)</label>
                            <input
                                type="text"
                                value={cuisine}
                                onChange={(e) => setCuisine(e.target.value)}
                                placeholder="e.g., Italian, Indian, Homemade"
                                className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 outline-none transition"
                            />
                        </div>

                        <div className="border-2 border-dashed border-zinc-700 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-orange-500/50 hover:bg-zinc-800/50 transition relative overflow-hidden group">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                            />

                            {preview ? (
                                <img src={preview} alt="Preview" className="max-h-64 rounded-lg shadow-lg object-contain" />
                            ) : (
                                <>
                                    <div className="bg-zinc-800 p-4 rounded-full mb-4 group-hover:scale-110 transition">
                                        <Upload className="w-8 h-8 text-orange-400" />
                                    </div>
                                    <p className="text-gray-300 font-medium">Click to upload or drag and drop</p>
                                    <p className="text-xs text-gray-500 mt-2">JPG, PNG, WEBP up to 5MB</p>
                                </>
                            )}
                        </div>

                        <button
                            onClick={handleAnalyze}
                            disabled={loading || !file}
                            className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${loading || !file
                                ? "bg-zinc-800 text-gray-500 cursor-not-allowed"
                                : "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white shadow-lg hover:shadow-orange-500/20"
                                }`}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Analyze Food"}
                        </button>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-start gap-3 text-sm">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                        {loading && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 min-h-[300px]">
                                <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                                <p className="animate-pulse">Parsing ingredients and calculating macros...</p>
                            </div>
                        )}

                        {!loading && !result && (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-4 min-h-[300px] border border-zinc-900 rounded-2xl bg-zinc-900/30">
                                <Info className="w-12 h-12 opacity-50" />
                                <p>Analysis results will appear here</p>
                            </div>
                        )}

                        {result && !loading && (
                            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 slide-in-bottom">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-1">{result.food_name}</h2>
                                    <p className="text-gray-400 text-sm leading-relaxed">{result.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-black p-4 rounded-xl border border-zinc-800">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Calories</p>
                                        <p className="text-2xl font-bold text-white">{result.nutritional_info.calories}</p>
                                    </div>
                                    <div className="bg-black p-4 rounded-xl border border-zinc-800">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Health Score</p>
                                        <div className="flex items-baseline gap-1">
                                            <p className={`text-2xl font-bold ${result.health_rating >= 7 ? 'text-green-500' : result.health_rating >= 4 ? 'text-yellow-500' : 'text-red-500'}`}>
                                                {result.health_rating}
                                            </p>
                                            <span className="text-sm text-gray-500">/10</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-sm font-medium text-gray-300 uppercase tracking-wider">Macronutrients</p>
                                    <div className="grid grid-cols-4 gap-2 text-center text-sm">
                                        <div className="bg-zinc-800/50 p-2 rounded-lg">
                                            <div className="text-blue-400 font-bold">{result.nutritional_info.protein}</div>
                                            <div className="text-xs text-gray-500">Protein</div>
                                        </div>
                                        <div className="bg-zinc-800/50 p-2 rounded-lg">
                                            <div className="text-yellow-400 font-bold">{result.nutritional_info.carbohydrates}</div>
                                            <div className="text-xs text-gray-500">Carbs</div>
                                        </div>
                                        <div className="bg-zinc-800/50 p-2 rounded-lg">
                                            <div className="text-red-400 font-bold">{result.nutritional_info.fats}</div>
                                            <div className="text-xs text-gray-500">Fats</div>
                                        </div>
                                        <div className="bg-zinc-800/50 p-2 rounded-lg">
                                            <div className="text-green-400 font-bold">{result.nutritional_info.fiber}</div>
                                            <div className="text-xs text-gray-500">Fiber</div>
                                        </div>
                                    </div>
                                </div>

                                {result.suggestions && (
                                    <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl">
                                        <p className="text-xs text-blue-400 uppercase tracking-wider mb-2 font-bold">Coach's Tip</p>
                                        <p className="text-sm text-gray-300 italic">"{result.suggestions}"</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FoodAnalyzer;
