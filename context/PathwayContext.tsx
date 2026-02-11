import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { PathwayStep } from '../types';

interface PathwayContextType {
    goal: string;
    setGoal: (goal: string) => void;
    pathway: PathwayStep[] | null;
    setPathway: (pathway: PathwayStep[] | null) => void;
    completedSteps: Set<string>;
    markStepAsCompleted: (stepTitle: string) => void;
    resetCompletedSteps: () => void;
    cachedContent: Map<string, any>;
    addCachedContent: (key: string, data: any) => void;
}

const PathwayContext = createContext<PathwayContextType | undefined>(undefined);

export const PathwayProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [goal, setGoal] = useState('');
    const [pathway, setPathway] = useState<PathwayStep[] | null>(null);
    const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
    const [cachedContent, setCachedContent] = useState<Map<string, any>>(new Map());

    const markStepAsCompleted = (stepTitle: string) => {
        setCompletedSteps(prev => {
            const newSet = new Set(prev);
            newSet.add(stepTitle);
            return newSet;
        });
    };
    
    const resetCompletedSteps = () => {
        setCompletedSteps(new Set());
    }

    const addCachedContent = useCallback((key: string, data: any) => {
        setCachedContent(prev => {
            const newMap = new Map(prev);
            newMap.set(key, data);
            return newMap;
        });
    }, []);

    return (
        <PathwayContext.Provider value={{ goal, setGoal, pathway, setPathway, completedSteps, markStepAsCompleted, resetCompletedSteps, cachedContent, addCachedContent }}>
            {children}
        </PathwayContext.Provider>
    );
};

export const usePathway = (): PathwayContextType => {
    const context = useContext(PathwayContext);
    if (!context) {
        throw new Error('usePathway must be used within a PathwayProvider');
    }
    return context;
};
