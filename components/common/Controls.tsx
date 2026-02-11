import React from 'react';
import { DetailLevel } from '../../types';

interface ControlsProps {
    topic: string;
    setTopic: (topic: string) => void;
    detailLevel?: DetailLevel; // Made optional
    setDetailLevel?: (level: DetailLevel) => void; // Made optional
    onGenerate: () => void;
    isLoading: boolean;
    buttonText: string;
    topicPlaceholder: string;
    detailLevelLabel?: string;
}

export const Controls: React.FC<ControlsProps> = ({
    topic,
    setTopic,
    detailLevel,
    setDetailLevel, // Destructure as optional
    onGenerate,
    isLoading,
    buttonText,
    topicPlaceholder,
    detailLevelLabel = "Explanation Depth"
}) => {
    return (
        <div className="p-6 bg-white rounded-lg border border-slate-200 space-y-4 shadow-sm">
            <div>
                <label htmlFor="topic" className="block text-sm font-medium text-slate-700 mb-1">
                    Machine Learning Topic
                </label>
                <input
                    type="text"
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder={topicPlaceholder}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
            {setDetailLevel && ( // Conditionally render detail level if setter is provided
                <div>
                    <label htmlFor="length" className="block text-sm font-medium text-slate-700 mb-1">
                        {detailLevelLabel}
                    </label>
                    <select
                        id="length"
                        value={detailLevel}
                        onChange={(e) => setDetailLevel(e.target.value as DetailLevel)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value={DetailLevel.BRIEF}>Brief - Quick summary</option>
                        <option value={DetailLevel.DETAILED}>Detailed - In-depth explanation</option>
                        <option value={DetailLevel.COMPREHENSIVE}>Comprehensive - Exhaustive coverage</option>
                    </select>
                </div>
            )}
            <button
                onClick={onGenerate}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? 'Generating...' : buttonText}
            </button>
        </div>
    );
};