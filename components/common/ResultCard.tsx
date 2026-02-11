
import React from 'react';

export const ResultCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-slate-800">{title}</h2>
        <div className="relative p-6 bg-white rounded-lg border border-slate-200 shadow-sm">
            {children}
        </div>
    </div>
);
