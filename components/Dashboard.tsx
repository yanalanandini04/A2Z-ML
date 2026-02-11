import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Code, Headphones, Image as ImageIcon, Rocket, BrainCircuit, ShieldCheck, Target, HelpCircle } from 'lucide-react';

const FeatureCard: React.FC<{ to: string; icon: React.ReactNode; title: string; description: string; }> = ({ to, icon, title, description }) => (
    <Link to={to} className="bg-white p-6 rounded-lg border border-slate-200 hover:shadow-lg hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-1 group relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 opacity-50"></div>
        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-100 text-indigo-600 mb-4 border border-indigo-200 group-hover:bg-indigo-200/50 relative z-10">
            {icon}
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2 relative z-10">{title}</h3>
        <p className="text-slate-500 relative z-10">{description}</p>
        <div className="mt-4 text-indigo-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
            Start Learning &rarr;
        </div>
    </Link>
);

const InfoCard: React.FC<{ icon: React.ReactNode; title: string; description: string; }> = ({ icon, title, description }) => (
    <div className="bg-white p-6 rounded-lg text-center border border-slate-200">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 text-indigo-600 mx-auto mb-4">
            {icon}
        </div>
        <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-500 text-sm">{description}</p>
    </div>
);

const Dashboard: React.FC = () => {
    return (
        <div className="space-y-12">
            <section className="text-center pt-16 pb-8">
                <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
                    GyanGuru AI
                </h1>
                <p className="max-w-3xl mx-auto text-lg text-slate-600">
                    Your personal AI tutor. Generate custom learning pathways, get detailed explanations, code examples, audio lessons, and visual diagrams for any ML topic.
                </p>
            </section>

            <section>
                <h2 className="text-3xl font-bold text-center mb-8 text-slate-800">Choose Your Learning Tool</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Removed Pathway Card:
                    <FeatureCard
                        to="/pathway"
                        icon={<GitMerge size={24} />}
                        title="Learning Pathway"
                        description="Enter your learning goal and get a customized, step-by-step roadmap to mastery."
                    /> */}
                    <FeatureCard
                        to="/text"
                        icon={<BookOpen size={24} />}
                        title="Text Explanations"
                        description="Get comprehensive text-based explanations of any ML topic with clear examples."
                    />
                    <FeatureCard
                        to="/code"
                        icon={<Code size={24} />}
                        title="Code Examples"
                        description="Generate working Python code with detailed explanations. Run in Colab or locally."
                    />
                    <FeatureCard
                        to="/audio"
                        icon={<Headphones size={24} />}
                        title="Audio Lessons"
                        description="Listen to audio explanations, perfect for learning on the go. Download WAV files."
                    />
                     <FeatureCard
                        to="/images"
                        icon={<ImageIcon size={24} />}
                        title="Visual Diagrams"
                        description="Generate AI-powered diagrams to understand complex ML concepts intuitively."
                    />
                    <FeatureCard
                        to="/practice"
                        icon={<Target size={24} />}
                        title="Practice & Assess"
                        description="Test your knowledge with interactive quizzes and review with quick-reference cheatsheets."
                    />
                    <FeatureCard
                        to="/qa"
                        icon={<HelpCircle size={24} />}
                        title="Q&A / Doubt Solver"
                        description="Ask specific questions, get code feedback, and receive personalized guidance to overcome learning hurdles."
                    />
                </div>
            </section>
            
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center pt-8">
                <InfoCard 
                    icon={<BrainCircuit size={24}/>}
                    title="Learn at Your Pace"
                    description="Choose between brief, detailed, or comprehensive content based on your learning needs."
                />
                 <InfoCard 
                    icon={<ShieldCheck size={24}/>}
                    title="Secure & Private"
                    description="Your API key is required but never stored. All processing happens securely in your browser."
                />
                 <InfoCard 
                    icon={<Rocket size={24}/>}
                    title="Cutting-Edge AI"
                    description="Built with the latest models from Google Gemini for fast, accurate, and multi-modal learning."
                />
            </section>
        </div>
    );
};

export default Dashboard;