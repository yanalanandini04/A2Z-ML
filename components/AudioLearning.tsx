
import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { generateAudioScript, generateAudioFromScript } from '../services/geminiService';
import { DetailLevel } from '../types';
import { decode, pcmToWavBlob } from '../utils/audio';
import { downloadBlob } from '../utils/file';
import { Loader } from './common/Loader';
import { PageHeader } from './common/PageHeader';
import { Controls } from './common/Controls';
import { ResultCard } from './common/ResultCard';
import { usePathway } from '../context/PathwayContext';
import { useUIAction } from '../context/UIActionContext'; // Import useUIAction

const AudioLearning: React.FC = () => {
    const location = useLocation();
    const { markStepAsCompleted, cachedContent, addCachedContent } = usePathway();
    const { openApiKeyModal } = useUIAction(); // Use the UIActionContext
    const [topic, setTopic] = useState('');
    const [length, setLength] = useState<DetailLevel>(DetailLevel.DETAILED);
    const [script, setScript] = useState('');
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState('');
    
    const audioContextRef = useRef<AudioContext | null>(null);
    
    useEffect(() => {
        const topicFromState = location.state?.topic;
        if (topicFromState) {
            setTopic(topicFromState);
            markStepAsCompleted(topicFromState);
        }
    }, [location.state, markStepAsCompleted]);

    useEffect(() => {
        // Initialize AudioContext on user interaction for broader browser compatibility.
        const initAudioContext = () => {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            document.removeEventListener('click', initAudioContext);
        };
        document.addEventListener('click', initAudioContext);
        
        return () => {
          document.removeEventListener('click', initAudioContext);
          audioContextRef.current?.close();
        };
    }, []);


    const handleGenerate = async () => {
        if (!topic) {
            setError('Please enter a topic.');
            return;
        }

        const cacheKey = `audio-${topic}-${length}`;
        if (cachedContent.has(cacheKey)) {
            const cachedData = cachedContent.get(cacheKey);
            setScript(cachedData.script);
            setAudioBlob(cachedData.audioBlob);
            setAudioUrl(URL.createObjectURL(cachedData.audioBlob));
            setError('');
            return;
        }
        
        setIsLoading(true);
        setError('');
        setScript('');
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
        setAudioUrl(null);
        setAudioBlob(null);

        try {
            setLoadingMessage('Generating audio script...');
            const generatedScript = await generateAudioScript(topic, length);
            setScript(generatedScript);

            setLoadingMessage('Synthesizing audio...');
            const base64Audio = await generateAudioFromScript(generatedScript);
            const audioBytes = decode(base64Audio);
            
            const wavBlob = pcmToWavBlob(audioBytes, 24000, 1, 16);
            
            setAudioBlob(wavBlob);
            const url = URL.createObjectURL(wavBlob);
            setAudioUrl(url);

            addCachedContent(cacheKey, { script: generatedScript, audioBlob: wavBlob });

        } catch (err: any)
 {
            setError(err.message || 'An error occurred.');
            if (err.message.startsWith('MissingApiKey:') || err.message.startsWith('QuotaExceeded:')) {
                openApiKeyModal(); // Automatically open modal
            }
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const handleDownload = () => {
        if (audioBlob) {
            const filename = `${topic.replace(/\s+/g, '_')}_audio.wav`;
            downloadBlob(audioBlob, filename);
        }
    };
    
    // Cleanup object URL when component unmounts or audioUrl changes to prevent memory leaks
    useEffect(() => {
        return () => {
            if(audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        }
    }, [audioUrl]);

    return (
        <div>
            <PageHeader
                title="Audio Learning"
                description="Listen to AI-generated audio explanations of ML concepts - perfect for learning on the go."
            />

            <Controls
                topic={topic}
                setTopic={setTopic}
                detailLevel={length}
                setDetailLevel={setLength}
                onGenerate={handleGenerate}
                isLoading={isLoading}
                buttonText="Generate Audio"
                topicPlaceholder="e.g., support vector machines, gradient descent"
                detailLevelLabel="Audio Length"
            />
            
            {error && <div className="mt-4 text-red-700 bg-red-100 p-3 rounded-md border border-red-200">{error}</div>}

            {isLoading && <Loader text={loadingMessage} />}
            
            {audioUrl && (
                <ResultCard title="Audio Lesson">
                    <audio controls src={audioUrl} className="w-full" aria-label="Generated audio lesson player"></audio>
                    <button onClick={handleDownload} className="mt-4 w-full text-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">Download WAV</button>
                </ResultCard>
            )}

            {script && (
                <ResultCard title="Audio Script">
                    <p className="text-slate-600 whitespace-pre-wrap">{script}</p>
                </ResultCard>
            )}
        </div>
    );
};

export default AudioLearning;