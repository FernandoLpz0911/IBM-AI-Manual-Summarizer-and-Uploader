import React, { useState } from 'react';
import { User, DocumentData, Group, Message, ViewState, Theme } from './types';
import { MOCK_DOCS, MOCK_CHATS } from './constants';
import Navbar from './components/Navbar';
import AuthScreen from './components/AuthScreen';
import RegisterScreen from './components/RegisterScreen';
import DashboardView from './components/DashboardView';
import LibraryView from './components/LibraryView';
import CommunityView from './components/CommunityView';

export default function App() {
  // --- State Management ---
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('login');
  const [theme, setTheme] = useState<Theme>('dark');
  const [documents, setDocuments] = useState<DocumentData[]>(MOCK_DOCS);
  const [activeDoc, setActiveDoc] = useState<DocumentData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- Actions ---
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      // Simulate API Response
      const mockUser: User = { 
        uid: 'user-1', 
        email: 'user@example.com', 
        name: 'John Doe',
        role: 'Senior Engineer',
        company: 'Tech Corp',
        theme: 'dark', 
        storageUsed: 450,
        storageLimit: 1000,
        preferences: { aiSuggestions: true, topics: ['Engineering'] }
      };
      setUser(mockUser);
      setTheme(mockUser.theme);
      setView('dashboard');
      setLoading(false);
    }, 1500);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const company = formData.get('company') as string;
    const preferredTheme = formData.get('theme') as Theme;

    setTimeout(() => {
      const newUser: User = { 
        uid: 'user-new', 
        email: email, 
        name: name,
        company: company,
        role: 'Admin',
        theme: preferredTheme,
        storageUsed: 0,
        storageLimit: 1000,
        preferences: { aiSuggestions: true, topics: [] }
      };
      setUser(newUser);
      setTheme(newUser.theme); 
      setView('dashboard'); 
      setLoading(false);
    }, 1500);
  };

  const handleOpenDoc = (doc: DocumentData) => {
    setActiveDoc(doc);
    if (doc.ownerId === user?.uid) {
      setMessages(MOCK_CHATS[doc.id] || [{ id: 'init', sender: 'ai', text: `Ready to discuss ${doc.title}.` }]);
    } else {
      setMessages([{ id: 'init', sender: 'ai', text: `Viewing Public Document: ${doc.title}.` }]);
    }
    setView('doc-read');
  };

  const handleJoinGroup = (group: Group) => {
     // Simple alert for demo, in real app would navigate to chat
     alert(`Joined group: ${group.name}`);
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleLogout = () => {
      setUser(null);
      setView('login');
  };

  // --- Dynamic Styles ---
  const getThemeClasses = () => {
    const isDark = theme === 'dark';
    return {
      bgGradient: isDark 
        ? 'bg-[linear-gradient(-45deg,#020617,#0f172a,#1e1b4b,#0f172a)] animate-gradient-wave' 
        : 'bg-[linear-gradient(-45deg,#f8fafc,#e2e8f0,#dbeafe,#f1f5f9)] animate-gradient-wave',
    };
  };

  const styles = getThemeClasses();

  // --- Render Logic ---

  if (!user) {
    if (view === 'register') {
       return <RegisterScreen onRegister={handleRegister} onNavigateToLogin={() => setView('login')} loading={loading} />;
    }
    return <AuthScreen onLogin={handleLogin} onNavigateToRegister={() => setView('register')} loading={loading} />;
  }

  // Render Authenticated Views
  return (
    <div className={`min-h-screen ${styles.bgGradient} transition-colors duration-500 font-sans`}>
      <Navbar 
        view={view}
        setView={setView}
        user={user}
        theme={theme}
        toggleTheme={toggleTheme}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        handleLogout={handleLogout}
      />
      
      <main className="pb-12">
        {view === 'dashboard' && <DashboardView user={user} documents={documents} theme={theme} setView={setView} />}
        
        {view === 'library' && (
            <LibraryView documents={documents} theme={theme} onOpenDoc={handleOpenDoc} />
        )}

        {view === 'community' && (
            <CommunityView theme={theme} onJoinGroup={handleJoinGroup} />
        )}

        {/* Placeholder for Doc Read/Support as they weren't fully fleshed out in the prompt, utilizing generic container */}
        {(view === 'doc-read' || view === 'support') && (
            <div className="max-w-4xl mx-auto p-8 mt-10 bg-white/10 backdrop-blur-md rounded-xl text-center border border-white/20">
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {view === 'doc-read' && activeDoc ? activeDoc.title : 'Support Center'}
                </h2>
                <p className={`mt-4 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                    {view === 'doc-read' ? 'Document viewer implementation would go here.' : 'How can we help you today?'}
                </p>
                <button 
                    onClick={() => setView('dashboard')}
                    className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
                >
                    Back to Dashboard
                </button>
            </div>
        )}
      </main>
    </div>
  );
}