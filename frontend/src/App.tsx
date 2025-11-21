import React, { useState, useEffect } from 'react';
import { User, DocumentData, Group, Message, ViewState, Theme } from './types';
import { MOCK_GROUPS, MOCK_CHATS } from './constants'; // Removed MOCK_DOCS
import Navbar from './components/Navbar';
import AuthScreen from './components/AuthScreen';
import RegisterScreen from './components/RegisterScreen';
import DashboardView from './components/DashboardView';
import LibraryView from './components/LibraryView';
import CommunityView from './components/CommunityView';
import { Send, Bot, User as UserIcon, Loader2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';

export default function App() {
  // --- State Management ---
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('login');
  const [theme, setTheme] = useState<Theme>('dark');
  const [documents, setDocuments] = useState<DocumentData[]>([]); // Initialize empty
  const [activeDoc, setActiveDoc] = useState<DocumentData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);

  // --- Fetch Documents on Login ---
  useEffect(() => {
    if (user && view === 'dashboard' || view === 'library') {
      fetchLibrary();
    }
  }, [user, view]);

  const fetchLibrary = async () => {
    try {
      // Even without a token, the backend bypass will now accept this
      const response = await fetch(`${API_BASE_URL}/library/`, {
         headers: { 'Authorization': 'Bearer mock-token' }
      });
      if (response.ok) {
        const data = await response.json();
        // If DB is empty, data.documents might be empty. 
        setDocuments(data.documents);
      } else {
        console.error("Failed to fetch library");
      }
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  // --- Actions ---
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const mockUser: User = { 
        uid: 'user-1', // Matches the backend Auth Bypass ID
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
    }, 1000);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock register
    const formData = new FormData(e.target as HTMLFormElement);
    setLoading(true);
    setTimeout(() => {
      const newUser: User = { 
        uid: 'user-1', 
        email: formData.get('email') as string, 
        name: formData.get('name') as string,
        company: formData.get('company') as string,
        role: 'Admin',
        theme: formData.get('theme') as Theme,
        storageUsed: 0,
        storageLimit: 1000,
        preferences: { aiSuggestions: true, topics: [] }
      };
      setUser(newUser);
      setTheme(newUser.theme); 
      setView('dashboard'); 
      setLoading(false);
    }, 1000);
  };

  const handleOpenDoc = (doc: DocumentData) => {
    setActiveDoc(doc);
    // Reset chat or load history
    setMessages([{ id: 'init', sender: 'ai', text: `Ready to discuss ${doc.title}.` }]);
    setView('doc-read');
  };

  const handleJoinGroup = (group: Group) => {
     alert(`Joined group: ${group.name}`);
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleLogout = () => {
      setUser(null);
      setView('login');
      setDocuments([]);
  };

  // --- Chat Logic ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeDoc) return;

    const userMsg: Message = {
        id: Date.now().toString(),
        sender: 'user',
        text: chatInput
    };

    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatting(true);

    try {
        // If content is array, join it, else use summary or empty string
        const contextText = Array.isArray(activeDoc.content) 
            ? activeDoc.content.join('\n') 
            : (activeDoc.text || activeDoc.summary || "");

        const response = await fetch(`${API_BASE_URL}/chat/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: userMsg.text,
                full_document_text: contextText
            })
        });

        const data = await response.json();
        
        const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            text: data.answer || "I couldn't find an answer in the document.",
            referenceId: data.reference_index
        };
        setMessages(prev => [...prev, aiMsg]);

    } catch (err) {
        console.error(err);
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: 'ai',
            text: "Error contacting the AI server."
        }]);
    } finally {
        setIsChatting(false);
    }
  };

  // --- Styles ---
  const styles = {
    bgGradient: theme === 'dark' 
      ? 'bg-[linear-gradient(-45deg,#020617,#0f172a,#1e1b4b,#0f172a)] animate-gradient-wave' 
      : 'bg-[linear-gradient(-45deg,#f8fafc,#e2e8f0,#dbeafe,#f1f5f9)] animate-gradient-wave',
    card: theme === 'dark' ? 'bg-slate-900/80 border-slate-700 text-slate-100' : 'bg-white/80 border-slate-200 text-slate-900'
  };

  if (!user) {
    if (view === 'register') return <RegisterScreen onRegister={handleRegister} onNavigateToLogin={() => setView('login')} loading={loading} />;
    return <AuthScreen onLogin={handleLogin} onNavigateToRegister={() => setView('register')} loading={loading} />;
  }

  return (
    <div className={`min-h-screen ${styles.bgGradient} transition-colors duration-500 font-sans`}>
      <Navbar 
        view={view} setView={setView} user={user} theme={theme} toggleTheme={toggleTheme}
        mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} handleLogout={handleLogout}
      />
      
      <main className="pb-12">
        {view === 'dashboard' && <DashboardView user={user} documents={documents} theme={theme} setView={setView} />}
        
        {view === 'library' && (
            <LibraryView documents={documents} theme={theme} onOpenDoc={handleOpenDoc} />
        )}

        {view === 'community' && (
            <CommunityView theme={theme} onJoinGroup={handleJoinGroup} />
        )}

        {view === 'doc-read' && activeDoc && (
            <div className={`max-w-4xl mx-auto mt-6 h-[80vh] flex flex-col rounded-xl border overflow-hidden backdrop-blur-md ${styles.card}`}>
                <div className="p-4 border-b border-inherit flex justify-between items-center bg-white/5">
                    <div>
                        <h2 className="font-bold text-lg">{activeDoc.title}</h2>
                        <p className="text-xs opacity-70">{activeDoc.type}</p>
                    </div>
                    <button onClick={() => setView('library')} className="text-sm hover:underline">Close</button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl p-3 ${
                                msg.sender === 'user' 
                                    ? 'bg-blue-600 text-white' 
                                    : theme === 'dark' ? 'bg-slate-800 text-slate-100' : 'bg-slate-100 text-slate-800'
                            }`}>
                                <div className="flex items-center gap-2 mb-1 opacity-75 text-xs">
                                    {msg.sender === 'ai' ? <Bot size={12} /> : <UserIcon size={12} />}
                                    <span>{msg.sender === 'ai' ? 'DocuMind AI' : 'You'}</span>
                                </div>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isChatting && <div className="p-3"><Loader2 className="animate-spin w-4 h-4 text-blue-500" /></div>}
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t border-inherit bg-white/5 flex gap-2">
                    <input 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask a question about this document..."
                        className={`flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none bg-transparent ${theme === 'dark' ? 'border-slate-600 placeholder-slate-500' : 'border-slate-300 placeholder-slate-400'}`}
                    />
                    <button type="submit" disabled={isChatting || !chatInput.trim()} className="bg-blue-600 text-white p-2 rounded-lg">
                        <Send size={20} />
                    </button>
                </form>
            </div>
        )}

        {view === 'support' && (
            <div className={`max-w-4xl mx-auto p-8 mt-10 rounded-xl text-center border ${styles.card}`}>
                <h2 className="text-2xl font-bold">Support Center</h2>
                <button onClick={() => setView('dashboard')} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg">Back</button>
            </div>
        )}
      </main>
    </div>
  );
}