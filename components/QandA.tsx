
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Chat } from "@google/genai";
import { getAiClient } from '../services/geminiService';
import { Loader } from './common/Loader';
import { PageHeader } from './common/PageHeader';
import { ResultCard } from './common/ResultCard';
import { Bot, User, Send } from 'lucide-react';
import { useUIAction } from '../context/UIActionContext'; // Import useUIAction

interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

const QandA: React.FC = () => {
    const { openApiKeyModal } = useUIAction(); // Use the UIActionContext
    const [query, setQuery] = useState('');
    const [followUp, setFollowUp] = useState('');

    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [conversationStarted, setConversationStarted] = useState(false);

    const chatRef = useRef<Chat | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);


    const startConversation = async () => {
        if (!query) {
            setError('Please enter your question to start the conversation.');
            return;
        }
        setIsLoading(true);
        setError('');
        setChatHistory([]);
        
        try {
            const ai = getAiClient();
            const systemInstruction = `You are a helpful AI/ML assistant named GyanGuru. Your primary goal is to solve user doubts about AI, Machine Learning, and Deep Learning in a conversational, chat-like manner. Keep your answers concise, direct, and to the point. Avoid lengthy explanations or lectures unless the user specifically asks for more detail. Focus on solving the immediate doubt. Format responses in markdown.`;
    
            chatRef.current = ai.chats.create({
                model: 'gemini-3-flash-preview',
                config: { systemInstruction },
            });
            
            setConversationStarted(true);
            await sendMessage(query);
        } catch (err: any) {
            setError(err.message || 'An error occurred while starting the conversation.');
            if (err.message.startsWith('MissingApiKey:') || err.message.startsWith('QuotaExceeded:')) {
                openApiKeyModal(); // Automatically open modal
            }
            setIsLoading(false);
            setConversationStarted(false);
        }
    };

    const sendMessage = async (message: string) => {
        if (!message || isLoading) return;
        
        setIsLoading(true);
        setError('');

        const userMessage: ChatMessage = { role: 'user', parts: [{ text: message }] };
        setChatHistory(prev => [...prev, userMessage]);

        try {
            if (chatRef.current) {
                const result = await chatRef.current.sendMessage({ message });
                const modelMessage: ChatMessage = { role: 'model', parts: [{ text: result.text }] };
                setChatHistory(prev => [...prev, modelMessage]);
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred while sending the message.');
            if (err.message.startsWith('MissingApiKey:') || err.message.startsWith('QuotaExceeded:')) {
                openApiKeyModal(); // Automatically open modal
            }
            const modelErrorMessage: ChatMessage = { role: 'model', parts: [{ text: "I'm sorry, I encountered an error. Please try again or check your API key in settings." }] };
            setChatHistory(prev => [...prev, modelErrorMessage]);
        } finally {
            setIsLoading(false);
            setFollowUp('');
        }
    };
    
    const handleFollowUpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(followUp);
    }
    
    const startNewConversation = () => {
        setConversationStarted(false);
        setQuery('');
        setFollowUp('');
        setChatHistory([]);
        setError('');
        chatRef.current = null;
    }

    if (!conversationStarted) {
        return (
            <div>
                <PageHeader
                    title="Q&A / Doubt Solver"
                    description="Ask specific questions, provide code snippets, and get personalized feedback to overcome your learning challenges."
                />
                <div className="p-6 bg-white rounded-lg border border-slate-200 space-y-4 shadow-sm">
                    <div>
                        <label htmlFor="query" className="block text-sm font-medium text-slate-700 mb-1">Your Question & Context</label>
                        <textarea 
                            id="query" 
                            value={query} 
                            onChange={(e) => setQuery(e.target.value)} 
                            placeholder="Describe the topic, ask your question, and paste your code here. Be as detailed as possible for the best answer." 
                            rows={12} 
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm" />
                    </div>
                    <button onClick={startConversation} disabled={isLoading} className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors">
                        {isLoading ? 'Starting Conversation...' : 'Start Conversation'}
                    </button>
                </div>
                {error && <div className="mt-4 text-red-700 bg-red-100 p-3 rounded-md border border-red-200">{error}</div>}
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title="Q&A / Doubt Solver"
                description="Your conversation with GyanGuru. Ask follow-up questions to refine the answer."
            />
             <ResultCard title="Chat">
                <div ref={chatContainerRef} className="h-[500px] overflow-y-auto pr-4 space-y-4 mb-4">
                    {chatHistory.map((msg, index) => (
                        <div key={index} className={`flex items-start space-x-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && (
                                <div className="p-2 bg-indigo-100 rounded-full text-indigo-600 flex-shrink-0">
                                    <Bot size={18} />
                                </div>
                            )}
                            <div className={`p-3 rounded-lg max-w-[80%] ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                                <article className={`prose max-w-none ${msg.role === 'user' ? 'prose-invert' : ''}`}>
                                    <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                                </article>
                            </div>
                            {msg.role === 'user' && (
                                <div className="p-2 bg-slate-200 rounded-full text-slate-600 flex-shrink-0">
                                    <User size={18} />
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-center mt-4">
                            <Loader text="GyanGuru is typing..." />
                        </div>
                    )}
                    {error && <div className="mt-4 text-red-700 bg-red-100 p-3 rounded-md border border-red-200">{error}</div>}
                </div>
                <form onSubmit={handleFollowUpSubmit} className="flex items-center space-x-3 mt-4">
                    <input
                        type="text"
                        value={followUp}
                        onChange={(e) => setFollowUp(e.target.value)}
                        placeholder="Ask a follow-up question..."
                        className="flex-grow px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !followUp.trim()}
                        className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                        aria-label="Send message"
                    >
                        <Send size={20} />
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <button onClick={startNewConversation} className="text-sm text-indigo-600 hover:underline">Start a New Conversation</button>
                </div>
            </ResultCard>
        </div>
    );
};

export default QandA;