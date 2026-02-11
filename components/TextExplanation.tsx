
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { generateExplanation } from '../services/geminiService';
import { DetailLevel, TextGenerationResult } from '../types';
import { Loader } from './common/Loader';
import { PageHeader } from './common/PageHeader';
import { Controls } from './common/Controls';
import { ResultCard } from './common/ResultCard';
import { downloadTextFile } from '../utils/file';
import { Download, Lightbulb, Youtube } from 'lucide-react';
import { usePathway } from '../context/PathwayContext';
import { useUIAction } from '../context/UIActionContext'; // Import useUIAction

const TextExplanation: React.FC = () => {
    const location = useLocation();
    const { markStepAsCompleted, cachedContent, addCachedContent } = usePathway();
    const { openApiKeyModal } = useUIAction(); // Use the UIActionContext
    const [topic, setTopic] = useState('');
    const [length, setLength] = useState<DetailLevel>(DetailLevel.DETAILED);
    const [result, setResult] = useState<TextGenerationResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const topicFromState = location.state?.topic;
        if (topicFromState) {
            setTopic(topicFromState);
            markStepAsCompleted(topicFromState);
        }
    }, [location.state, markStepAsCompleted]);

    const handleGenerate = async () => {
        if (!topic) {
            setError('Please enter a topic.');
            return;
        }

        const cacheKey = `text-${topic}-${length}`;
        if (cachedContent.has(cacheKey)) {
            setResult(cachedContent.get(cacheKey));
            setError('');
            return;
        }

        setIsLoading(true);
        setError('');
        setResult(null);
        try {
            const genResult = await generateExplanation(topic, length);
            setResult(genResult);
            addCachedContent(cacheKey, genResult);
        } catch (err: any) {
            setError(err.message || 'An error occurred.');
            if (err.message.startsWith('MissingApiKey:') || err.message.startsWith('QuotaExceeded:')) {
                openApiKeyModal(); // Automatically open modal
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!result) return;
        const content = `# ${topic}\n\n## Explanation\n${result.explanation}\n\n## Real-World Example\n${result.example}`;
        downloadTextFile(content, `${topic.replace(/\s+/g, '_')}_explanation.md`);
    };

    return (
        <div>
            <PageHeader
                title="Text Explanation"
                description="Get comprehensive text-based explanations of any Machine Learning topic."
            />

            <Controls
                topic={topic}
                setTopic={setTopic}
                detailLevel={length}
                setDetailLevel={setLength}
                onGenerate={handleGenerate}
                isLoading={isLoading}
                buttonText="Generate Explanation"
                topicPlaceholder="e.g., neural networks, decision trees, clustering"
            />
            
            {error && <div className="mt-4 text-red-700 bg-red-100 p-3 rounded-md border border-red-200">{error}</div>}

            {isLoading && <Loader text="GyanGuru is thinking..." />}
            
            {result && (
                 <div className="mt-8 space-y-8">
                    <ResultCard title="Explanation">
                        <button onClick={handleDownload} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors" aria-label="Download explanation">
                            <Download size={16} />
                        </button>
                        <article className="prose max-w-none prose-p:text-slate-600 prose-headings:text-slate-800 prose-strong:text-slate-800 prose-code:text-indigo-600 prose-a:text-indigo-600 prose-blockquote:border-l-indigo-500">
                            <ReactMarkdown>{result.explanation}</ReactMarkdown>
                        </article>
                    </ResultCard>

                    <ResultCard title="Real-World Example">
                         <Lightbulb className="absolute top-4 right-4 text-yellow-500" />
                         <article className="prose max-w-none">
                            <ReactMarkdown>{result.example}</ReactMarkdown>
                        </article>
                    </ResultCard>
                    
                    <ResultCard title="Recommended Videos">
                        <Youtube className="absolute top-4 right-4 text-red-600" />
                        <div className="space-y-4">
                            {result.youtubeLinks.map((video, index) => (
                                <a key={index} href={video.url} target="_blank" rel="noopener noreferrer" className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200">
                                    <p className="font-semibold text-indigo-600">{video.title}</p>
                                    <p className="text-sm text-slate-500 truncate">{video.url}</p>
                                </a>
                            ))}
                        </div>
                    </ResultCard>
                </div>
            )}
        </div>
    );
};

export default TextExplanation;