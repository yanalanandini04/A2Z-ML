
import React from 'react';

export const PageHeader: React.FC<{ title: string; description: string }> = ({ title, description }) => (
    <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{title}</h1>
        <p className="mt-2 text-slate-600 max-w-2xl mx-auto">{description}</p>
    </div>
);
