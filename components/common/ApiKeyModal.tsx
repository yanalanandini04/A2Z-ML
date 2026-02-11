
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
    const [apiKey, setApiKey] = useState('');

    useEffect(() => {
        if (isOpen) {
            const storedKey = localStorage.getItem('user_api_key') || '';
            setApiKey(storedKey);
        }
    }, [isOpen]);

    const handleSave = () => {
        localStorage.setItem('user_api_key', apiKey);
        onClose();
    };

    const handleClear = () => {
        localStorage.removeItem('user_api_key');
        setApiKey('');
        onClose();
    };
    
    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative m-4"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                    aria-label="Close settings modal"
                >
                    <X size={24} />
                </button>
                
                <h2 className="text-2xl font-bold text-slate-800 mb-4">API Key Settings</h2>
                
                <p className="text-slate-600 mb-4 text-sm">
                    You can add your own Google AI API key to bypass the free tier's rate limits. Your key is stored securely in your browser's local storage and is never sent to our servers.
                    For higher usage, you might need an API key from a <strong className="text-slate-800">paid Google Cloud Platform (GCP) project</strong>.
                </p>

                <div>
                    <label htmlFor="apiKey" className="block text-sm font-medium text-slate-700 mb-1">
                        Your Google AI API Key
                    </label>
                    <input
                        type="password"
                        id="apiKey"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your API key here"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                     <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline mt-1 block">
                        Get your API key from Google AI Studio &rarr;
                    </a>
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline mt-1 block">
                        Learn about Gemini API billing &rarr;
                    </a>
                </div>

                <div className="mt-6 flex justify-end space-x-2">
                    <button 
                        onClick={handleClear} 
                        className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                    >
                        Clear & Use Default
                    </button>
                    <button 
                        onClick={handleSave} 
                        className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Save Key
                    </button>
                </div>
            </div>
        </div>
    );
};