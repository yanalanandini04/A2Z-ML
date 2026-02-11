
import React, { useState, useCallback } from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { BookOpen, Code, Headphones, Image as ImageIcon, Home, Target, HelpCircle, GitMerge, Cog } from 'lucide-react';
import Dashboard from './components/Dashboard';
import TextExplanation from './components/TextExplanation';
import CodeGeneration from './components/CodeGeneration';
import AudioLearning from './components/AudioLearning';
import ImageVisualization from './components/ImageVisualization';
import Practice from './components/Practice';
import QandA from './components/QandA';
import LearningPathway from './components/LearningPathway';
import { PathwayProvider } from './context/PathwayContext';
import { ApiKeyModal } from './components/common/ApiKeyModal';
import { UIActionProvider } from './context/UIActionContext'; // Import UIActionProvider

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openApiKeyModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  return (
    <PathwayProvider>
      <UIActionProvider onOpenApiKeyModal={openApiKeyModal}> {/* Wrap with UIActionProvider */}
        <HashRouter>
          <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
            <Navbar onSettingsClick={() => setIsModalOpen(true)} />
            <main className="flex-grow container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/pathway" element={<LearningPathway />} />
                <Route path="/text" element={<TextExplanation />} />
                <Route path="/code" element={<CodeGeneration />} />
                <Route path="/audio" element={<AudioLearning />} />
                <Route path="/images" element={<ImageVisualization />} />
                <Route path="/practice" element={<Practice />} />
                <Route path="/qa" element={<QandA />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <ApiKeyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </HashRouter>
      </UIActionProvider> {/* Close UIActionProvider */}
    </PathwayProvider>
  );
};


const Navbar: React.FC<{onSettingsClick: () => void}> = ({ onSettingsClick }) => {
  const navLinkClasses = "flex items-center px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-md transition-colors duration-200";
  const activeLinkClasses = "bg-slate-200 text-slate-900 font-semibold";

  return (
    <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-slate-200">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <NavLink to="/" className="flex items-center space-x-2 text-xl font-bold text-slate-900">
              <svg className="w-8 h-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 14.5c-2.49 0-4.5-2.01-4.5-4.5S8.01 7.5 10.5 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm6-2.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              <span>GyanGuru</span>
            </NavLink>
          </div>
          <div className="flex items-center">
            <div className="hidden md:flex items-center space-x-1">
              <NavLink to="/" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}><Home className="w-4 h-4 mr-2" /> Home</NavLink>
              <NavLink to="/pathway" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}><GitMerge className="w-4 h-4 mr-2" /> Pathway</NavLink>
              <NavLink to="/text" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}><BookOpen className="w-4 h-4 mr-2" /> Text</NavLink>
              <NavLink to="/code" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}><Code className="w-4 h-4 mr-2" /> Code</NavLink>
              <NavLink to="/audio" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}><Headphones className="w-4 h-4 mr-2" /> Audio</NavLink>
              <NavLink to="/images" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}><ImageIcon className="w-4 h-4 mr-2" /> Images</NavLink>
              <NavLink to="/practice" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}><Target className="w-4 h-4 mr-2" /> Practice</NavLink>
              <NavLink to="/qa" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}><HelpCircle className="w-4 h-4 mr-2" /> Q&A</NavLink>
            </div>
             <button onClick={onSettingsClick} className="ml-4 p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-full transition-colors" aria-label="Settings">
              <Cog size={20} />
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};


const Footer: React.FC = () => {
    return (
        <footer className="bg-white border-t border-slate-200 mt-12">
            <div className="container mx-auto py-6 px-4 text-center text-slate-500 text-sm">
                <p>&copy; {new Date().getFullYear()} ML Learning Assistant. Built with React & Google Gemini.</p>
                <p className="mt-1">This tool is designed for educational purposes. Always verify information from multiple sources.</p>
            </div>
        </footer>
    );
}

export default App;