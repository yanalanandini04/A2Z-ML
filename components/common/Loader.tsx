
import React from 'react';

export const Loader: React.FC<{ text: string }> = ({ text }) => (
    <div className="mt-8 flex flex-col items-center justify-center p-6 bg-white rounded-lg border border-slate-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-slate-600">{text}</p>
    </div>
);
