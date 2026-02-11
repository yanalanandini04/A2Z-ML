
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { generatePracticeContent } from '../services/geminiService';
import { DetailLevel, PracticeContent, MCQ } from '../types';
import { Loader } from './common/Loader';
import { PageHeader } from './common/PageHeader';
import { Controls } from './common/Controls';
import { ResultCard } from './common/ResultCard';
import { Accordion } from './common/Accordion';
import { Lightbulb } from 'lucide-react';
import { usePathway } from '../context/PathwayContext';
import { useUIAction } from '../context/UIActionContext'; // Import useUIAction

const Practice: React.FC = () => {
    const location = useLocation();
    const { markStepAsCompleted, cachedContent, addCachedContent } = usePathway();
    const { openApiKeyModal } = useUIAction(); // Use the UIActionContext
    const [topic, setTopic] = useState('');
    const [detailLevel, setDetailLevel] = useState<DetailLevel>(DetailLevel.DETAILED);
    const [content, setContent] = useState<PracticeContent | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    
    useEffect(() => {
        const topicFromState = location.state?.topic;
        if (topicFromState) {
            setTopic(topicFromState);
            markStepAsCompleted(topicFromState);
        }
    }, [location.state, markStepAsCompleted]);

    const resetState = () => {
        setContent(null);
        setAnswers({});
        setSubmitted(false);
        setScore(0);
    }

    const handleGenerate = async () => {
        if (!topic) {
            setError('Please enter a topic to practice.');
            return;
        }

        const cacheKey = `practice-${topic}-${detailLevel}`;
        if (cachedContent.has(cacheKey) && !submitted) { // don't load from cache if user clicks "Practice Again"
            setContent(cachedContent.get(cacheKey));
            setError('');
            return;
        }

        setIsLoading(true);
        setError('');
        resetState();
        try {
            const result = await generatePracticeContent(topic, detailLevel);
            setContent(result);
            addCachedContent(cacheKey, result);
        } catch (err: any) {
            setError(err.message || 'An error occurred.');
            if (err.message.startsWith('MissingApiKey:') || err.message.startsWith('QuotaExceeded:')) {
                openApiKeyModal(); // Automatically open modal
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswerChange = (questionIndex: number, option: string) => {
        setAnswers(prev => ({ ...prev, [questionIndex]: option }));
    };

    const handleSubmit = () => {
        if (!content) return;
        let correctAnswers = 0;
        content.assessment.forEach((mcq, index) => {
            if (answers[index] === mcq.answer) {
                correctAnswers++;
            }
        });
        setScore(correctAnswers);
        setSubmitted(true);
    };

    const handlePracticeAgain = () => {
        handleGenerate();
    };

    const getOptionClasses = (mcq: MCQ, option: string, index: number) => {
        if (!submitted) {
            return answers[index] === option ? 'bg-indigo-600 text-white' : 'bg-slate-100 hover:bg-slate-200';
        }
        if (option === mcq.answer) {
            return 'bg-green-100 text-green-800 border-green-300'; // Correct answer
        }
        if (answers[index] === option && option !== mcq.answer) {
            return 'bg-red-100 text-red-800 border-red-300'; // User's incorrect answer
        }
        return 'bg-slate-100 text-slate-700';
    }

    return (
        <div>
            <PageHeader
                title="Practice & Assess"
                description="Study key concepts, test your knowledge with interactive quizzes, and revise with handy cheatsheets."
            />
            <Controls
                topic={topic}
                setTopic={setTopic}
                detailLevel={detailLevel}
                setDetailLevel={setDetailLevel}
                onGenerate={handleGenerate}
                isLoading={isLoading}
                buttonText="Generate Practice Module"
                topicPlaceholder="e.g., Logistic Regression, Pandas DataFrame"
                detailLevelLabel="Content Level"
            />
            {error && <div className="mt-4 text-red-700 bg-red-100 p-3 rounded-md border border-red-200">{error}</div>}
            {isLoading && <Loader text="GyanGuru is preparing your practice module..." />}
            {content && (
                <div className="mt-8 space-y-4">
                    <Accordion title="Learning Content">
                        <article className="prose max-w-none prose-p:text-slate-600">
                            <ReactMarkdown>{content.learningContent}</ReactMarkdown>
                        </article>
                    </Accordion>
                    <Accordion title="Assessment Quiz" defaultOpen>
                         {submitted && (
                            <div className="text-center p-4 bg-slate-50 rounded-lg mb-6 border border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-800">Your Score: {score} / {content.assessment.length} ({((score / content.assessment.length) * 100).toFixed(0)}%)</h3>
                                <button
                                    onClick={handlePracticeAgain}
                                    className="mt-4 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Practice Again with New Questions
                                </button>
                            </div>
                        )}
                        <div className="space-y-6">
                            {content.assessment.map((mcq, index) => (
                                <div key={index}>
                                    <p className="font-semibold mb-2 text-slate-700">{index + 1}. {mcq.question}</p>
                                    <div className="space-y-2">
                                        {mcq.options.map((option, optIndex) => (
                                            <button
                                                key={optIndex}
                                                onClick={() => !submitted && handleAnswerChange(index, option)}
                                                className={`w-full text-left p-3 rounded-md transition-colors border ${getOptionClasses(mcq, option, index)} disabled:cursor-not-allowed`}
                                                disabled={submitted}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                    {submitted && (
                                        <div className="mt-2 p-3 bg-slate-100 rounded-md flex items-start space-x-2 border border-slate-200">
                                            <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                                            <p className="text-slate-600 text-sm">{mcq.explanation}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {!submitted && (
                            <button onClick={handleSubmit} className="mt-6 w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">
                                Submit Answers
                            </button>
                        )}
                    </Accordion>
                    <Accordion title="Cheatsheet">
                        <article className="prose max-w-none prose-p:text-slate-600 prose-headings:text-slate-800 prose-code:text-indigo-600">
                            <ReactMarkdown>{content.cheatsheet}</ReactMarkdown>
                        </article>
                    </Accordion>
                </div>
            )}
        </div>
    );
};

export default Practice;