
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { generateLearningPathway } from '../services/geminiService';
import { usePathway } from '../context/PathwayContext';
import { Loader } from './common/Loader';
import { PageHeader } from './common/PageHeader';
import { ResultCard } from './common/ResultCard';
import { BookOpen, Code, Headphones, Image as ImageIcon, Target, Check } from 'lucide-react';
import { useUIAction } from '../context/UIActionContext'; // Import useUIAction

const LearningPathway: React.FC = () => {
    const { goal, setGoal, pathway, setPathway, completedSteps, resetCompletedSteps } = usePathway();
    const { openApiKeyModal } = useUIAction(); // Use the UIActionContext
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!goal) {
            setError('Please enter a learning goal.');
            return;
        }
        setIsLoading(true);
        setError('');
        setPathway(null);
        resetCompletedSteps(); // Reset progress for the new pathway
        try {
            const result = await generateLearningPathway(goal);
            setPathway(result);
        } catch (err: any) {
            setError(err.message || 'An error occurred.');
            if (err.message.startsWith('MissingApiKey:') || err.message.startsWith('QuotaExceeded:')) {
                openApiKeyModal(); // Automatically open modal
            }
        } finally {
            setIsLoading(false);
        }
    };

    const ToolLink: React.FC<{ to: string; topic: string; icon: React.ReactNode; label: string }> = ({ to, topic, icon, label }) => (
        <Link 
            to={to}
            state={{ topic }}
            className="flex items-center space-x-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-100 px-2 py-1 rounded-md transition-colors"
            aria-label={`${label} for ${topic}`}
            title={`${label} for ${topic}`}
        >
            {icon}
        </Link>
    );

    return (
        <div>
            <PageHeader
                title="Learning Pathway Generator"
                description="Enter your AI/ML learning goal, and we'll generate a customized, step-by-step roadmap for you."
            />
            
            <div className="p-6 bg-white rounded-lg border border-slate-200 space-y-4 shadow-sm">
                <div>
                    <label htmlFor="goal" className="block text-sm font-medium text-slate-700 mb-1">
                        Your Learning Goal
                    </label>
                    <input
                        type="text"
                        id="goal"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder="e.g., Learn deep learning, become a data scientist, master NLP"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? 'Generating...' : 'Generate New Pathway'}
                </button>
            </div>
            
            {error && <div className="mt-4 text-red-700 bg-red-100 p-3 rounded-md border border-red-200">{error}</div>}
            
            {isLoading && <Loader text="GyanGuru is building your custom learning path..." />}

            {pathway && (
                <ResultCard title={`Your Pathway to "${goal}"`}>
                    <div className="relative pl-8">
                        {/* The vertical line */}
                        <div className="absolute left-4 top-5 h-full w-0.5 bg-indigo-200" aria-hidden="true"></div>

                        <div className="space-y-12">
                            {pathway.map((step, index) => {
                                const isCompleted = completedSteps.has(step.title);
                                return (
                                <div key={index} className="relative">
                                    <div className={`absolute -left-[22px] top-0 h-9 w-9 rounded-full ${isCompleted ? 'bg-green-600' : 'bg-indigo-600'} text-white flex items-center justify-center font-bold text-sm ring-8 ring-slate-50`}>
                                        {isCompleted ? <Check size={20} /> : index + 1}
                                    </div>
                                    <div className="pl-6">
                                        <h3 className={`font-bold text-lg transition-colors ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{step.title}</h3>
                                        <p className="text-slate-500 mt-1 mb-3">{step.description}</p>
                                        <div className="flex items-center space-x-1 bg-slate-100 border border-slate-200 rounded-full p-1 w-fit">
                                            <ToolLink to="/text" topic={step.title} icon={<BookOpen size={16} />} label="Text Explanation" />
                                            <ToolLink to="/code" topic={step.title} icon={<Code size={16} />} label="Code Example" />
                                            <ToolLink to="/audio" topic={step.title} icon={<Headphones size={16} />} label="Audio Lesson" />
                                            <ToolLink to="/images" topic={step.title} icon={<ImageIcon size={16} />} label="Image Visualization" />
                                            <ToolLink to="/practice" topic={step.title} icon={<Target size={16} />} label="Practice & Assess" />
                                        </div>
                                    </div>
                                </div>
                            )})}
                        </div>
                    </div>
                </ResultCard>
            )}
        </div>
    );
};

export default LearningPathway;