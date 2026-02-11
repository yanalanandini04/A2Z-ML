import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
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
    // Initialize state from localStorage or default values
    const [goal, setGoal] = useState(() => localStorage.getItem('learningGoal') || '');
    const [pathway, setPathway] = useState<PathwayStep[] | null>(() => {
        const storedPathway = localStorage.getItem('learningPathway');
        try {
            return storedPathway ? JSON.parse(storedPathway) : null;
        } catch (e) {
            console.error("Failed to parse stored pathway from localStorage:", e);
            return null; // Return null if parsing fails
        }
    });
    const [completedSteps, setCompletedSteps] = useState<Set<string>>(() => {
        const storedCompletedSteps = localStorage.getItem('completedLearningSteps');
        try {
            return storedCompletedSteps ? new Set(JSON.parse(storedCompletedSteps)) : new Set();
        } catch (e) {
            console.error("Failed to parse stored completed steps from localStorage:", e);
            return new Set();
        }
    });
    const [cachedContent, setCachedContent] = useState<Map<string, any>>(new Map());

    // Effect to persist goal to localStorage
    useEffect(() => {
        localStorage.setItem('learningGoal', goal);
    }, [goal]);

    // Effect to persist pathway to localStorage
    useEffect(() => {
        if (pathway) {
            localStorage.setItem('learningPathway', JSON.stringify(pathway));
        } else {
            localStorage.removeItem('learningPathway'); // Clear if pathway becomes null
        }
    }, [pathway]);

    // Effect to persist completedSteps to localStorage
    useEffect(() => {
        localStorage.setItem('completedLearningSteps', JSON.stringify(Array.from(completedSteps)));
    }, [completedSteps]);

    const markStepAsCompleted = (stepTitle: string) => {
        setCompletedSteps(prev => {
            const newSet = new Set(prev);
            newSet.add(stepTitle);
            return newSet;
        });
    };
    
    const resetCompletedSteps = () => {
        setCompletedSteps(new Set());
        localStorage.removeItem('completedLearningSteps'); // Explicitly clear from localStorage
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