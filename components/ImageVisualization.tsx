import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { generateImagePrompts, generateImage } from '../services/geminiService';
import { DetailLevel } from '../types';
import { Loader } from './common/Loader';
import { PageHeader } from './common/PageHeader';
import { Controls } from './common/Controls';
import { ResultCard } from './common/ResultCard';
import { usePathway } from '../context/PathwayContext';
import { useUIAction } from '../context/UIActionContext'; // Import useUIAction

const ImageVisualization: React.FC = () => {
    const location = useLocation();
    const { markStepAsCompleted, cachedContent, addCachedContent } = usePathway();
    const { openApiKeyModal } = useUIAction(); // Use the UIActionContext
    const [topic, setTopic] = useState('');
    // DetailLevel is now fixed for image generation, no longer a user-selectable state.
    // const [detailLevel, setDetailLevel] = useState<DetailLevel>(DetailLevel.DETAILED);
    const fixedDetailLevel: DetailLevel = DetailLevel.DETAILED; // Use a fixed detail level
    const [prompts, setPrompts] = useState<string[]>([]);
    const [images, setImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
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
            setError('Please enter a topic to visualize.');
            return;
        }
        
        // Update cacheKey to not include variable detailLevel
        const cacheKey = `images-${topic}-${fixedDetailLevel}`;
        if (cachedContent.has(cacheKey)) {
            const cachedData = cachedContent.get(cacheKey);
            setPrompts(cachedData.prompts);
            setImages(cachedData.images);
            setError('');
            return;
        }

        setIsLoading(true);
        setError('');
        setPrompts([]);
        setImages([]);

        try {
            setLoadingMessage('Generating visualization concepts...');
            // Use fixedDetailLevel when generating prompts
            const generatedPrompts = await generateImagePrompts(topic, fixedDetailLevel);
            setPrompts(generatedPrompts);

            const imagePromises = generatedPrompts.map((prompt, index) => {
                setLoadingMessage(`Generating image ${index + 1} of ${generatedPrompts.length}...`);
                return generateImage(prompt);
            });

            const generatedImages = await Promise.all(imagePromises);
            setImages(generatedImages);
            addCachedContent(cacheKey, { prompts: generatedPrompts, images: generatedImages });

        } catch (err: any) {
            setError(err.message || 'An error occurred.');
            if (err.message.startsWith('MissingApiKey:') || err.message.startsWith('QuotaExceeded:')) {
                openApiKeyModal(); // Automatically open modal
            }
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    return (
        <div>
            <PageHeader
                title="Image Visualization"
                description="Generate AI-powered visual diagrams and illustrations to understand complex ML concepts intuitively."
            />

            <Controls
                topic={topic}
                setTopic={setTopic}
                // Removed detailLevel and setDetailLevel props
                onGenerate={handleGenerate}
                isLoading={isLoading}
                buttonText="Generate Images"
                topicPlaceholder="e.g., convolutional neural network architecture"
                // No detailLevelLabel needed here as the control is hidden
            />
            
            {error && <div className="mt-4 text-red-700 bg-red-100 p-3 rounded-md border border-red-200">{error}</div>}

            {isLoading && <Loader text={loadingMessage} />}
            
            {images.length > 0 && (
                <ResultCard title="Generated Visualizations">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {images.map((image, index) => (
                            <div key={index} className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                                <img src={image} alt={`Generated visualization ${index + 1}`} className="rounded-md w-full h-auto object-cover"/>
                                <p className="text-xs text-slate-500 mt-2 p-2">{prompts[index]}</p>
                            </div>
                        ))}
                    </div>
                </ResultCard>
            )}
        </div>
    );
};

export default ImageVisualization;