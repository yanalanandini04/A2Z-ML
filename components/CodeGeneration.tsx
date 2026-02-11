
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { generateCode } from '../services/geminiService';
import { DetailLevel, CodeGenerationResult } from '../types';
import { Loader } from './common/Loader';
import { PageHeader } from './common/PageHeader';
import { Controls } from './common/Controls';
import { ResultCard } from './common/ResultCard';
import { downloadTextFile } from '../utils/file';
import { Copy, Download, Lightbulb, Youtube } from 'lucide-react';
import { usePathway } from '../context/PathwayContext';
import { useUIAction } from '../context/UIActionContext'; // Import useUIAction

const CodeGeneration: React.FC = () => {
    const location = useLocation();
    const { markStepAsCompleted, cachedContent, addCachedContent } = usePathway();
    const { openApiKeyModal } = useUIAction(); // Use the UIActionContext
    const [topic, setTopic] = useState('');
    const [complexity, setComplexity] = useState<DetailLevel>(DetailLevel.DETAILED);
    const [result, setResult] = useState<CodeGenerationResult | null>(null);
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

        const cacheKey = `code-${topic}-${complexity}`;
        if (cachedContent.has(cacheKey)) {
            setResult(cachedContent.get(cacheKey));
            setError('');
            return;
        }

        setIsLoading(true);
        setError('');
        setResult(null);
        try {
            const genResult = await generateCode(topic, complexity);
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

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const handleDownloadCode = (code: string) => {
        const filename = `${topic.replace(/\s+/g, '_')}.py`;
        downloadTextFile(code, filename);
    };

    return (
        <div>
            <PageHeader
                title="Code Generation"
                description="Generate working Python code with detailed explanations for any ML concept."
            />

            <Controls
                topic={topic}
                setTopic={setTopic}
                detailLevel={complexity}
                setDetailLevel={setComplexity}
                onGenerate={handleGenerate}
                isLoading={isLoading}
                buttonText="Generate Code"
                topicPlaceholder="e.g., linear regression, random forest, k-means clustering"
                detailLevelLabel="Code Complexity"
            />
            
            {error && <div className="mt-4 text-red-700 bg-red-100 p-3 rounded-md border border-red-200">{error}</div>}

            {isLoading && <Loader text="GyanGuru is coding..." />}
            
            {result && (
                <div className="mt-8 space-y-8">
                    <ResultCard title="Explanation">
                        <article className="prose max-w-none prose-p:text-slate-600 prose-headings:text-slate-800 prose-strong:text-slate-800 prose-code:text-indigo-600">
                            <ReactMarkdown>{result.explanation}</ReactMarkdown>
                        </article>
                    </ResultCard>

                    <ResultCard title="Python Code">
                        <div className="absolute top-4 right-4 flex space-x-2">
                            <button onClick={() => handleCopy(result.code)} className="p-2 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors" aria-label="Copy code"><Copy size={16} /></button>
                            <button onClick={() => handleDownloadCode(result.code)} className="p-2 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors" aria-label="Download code"><Download size={16} /></button>
                        </div>
                        <SyntaxHighlighter language="python" style={oneLight} customStyle={{ margin: 0, background: 'transparent', padding: 0, fontSize: '0.875rem' }} codeTagProps={{style: {fontFamily: "inherit"}}}>
                            {result.code}
                        </SyntaxHighlighter>
                    </ResultCard>

                    <ResultCard title="Required Dependencies">
                         <p className="text-slate-500 mb-2">You can install these using pip:</p>
                        <div className="bg-slate-100 p-3 rounded-md text-indigo-700 font-mono relative border border-slate-200">
                            <button onClick={() => handleCopy(`pip install ${result.dependencies.join(' ')}`)} className="absolute top-2 right-2 p-2 bg-slate-200 rounded-md hover:bg-slate-300 transition-colors" aria-label="Copy install command"><Copy size={16} /></button>
                            pip install {result.dependencies.join(' ')}
                        </div>
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

export default CodeGeneration;