import React, { useState } from 'react';
import { User, DocumentData, Group, Message, ViewState, Theme } from './types';
import { MOCK_DOCS, MOCK_CHATS, MOCK_GROUPS } from './constants';
import Navbar from './components/Navbar';
import AuthScreen from './components/AuthScreen';
import RegisterScreen from './components/RegisterScreen';
import DashboardView from './components/DashboardView';
import LibraryView from './components/LibraryView';
import CommunityView from './components/CommunityView';
import DocumentAnalysisView from './components/DocumentAnalysisView';
import GroupChatView from './components/GroupChatView';
import SupportView from './components/SupportView';

export default function App() {
  // --- State Management ---
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState | 'group-chat'>('login');
  const [theme, setTheme] = useState<Theme>('dark');
  const [documents, setDocuments] = useState<DocumentData[]>(MOCK_DOCS);
  const [groups, setGroups] = useState<Group[]>(MOCK_GROUPS);
  const [activeDoc, setActiveDoc] = useState<DocumentData | null>(null);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // --- Actions ---
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
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
    }, 800);
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

  const handleUpload = (file: File) => {
    // Create a new document entry from the file
    const newDoc: DocumentData = {
      id: `doc-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      ownerId: user?.uid || 'unknown',
      ownerName: user?.name || 'User',
      isPublic: false,
      summary: "Uploaded document. Analysis and indexing pending...",
      content: ["Content extraction pending... In a real app, OCR would run here."], // Placeholder for real processing
      uploadDate: new Date().toISOString().split('T')[0],
      fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: file.name.split('.').pop()?.toUpperCase() || 'PDF'
    };

    setDocuments(prev => [newDoc, ...prev]);
    
    // Automatically navigate to library to see the new file
    setView('library');
  };

  const handleOpenDoc = (doc: DocumentData) => {
    setActiveDoc(doc);
    if (doc.ownerId === user?.uid || doc.ownerId === 'user-1') {
      setMessages(MOCK_CHATS[doc.id] || [{ id: 'init', sender: 'ai', text: `Ready to discuss ${doc.title}. I've analyzed the content.` }]);
    } else {
      setMessages([{ id: 'init', sender: 'ai', text: `Viewing Public Document: ${doc.title}.` }]);
    }
    setView('doc-read');
  };

  const handleJoinGroup = (group: Group) => {
    setActiveGroup(group);
    setView('group-chat');
  };

  const handleCreateGroup = (newGroup: Group) => {
    setGroups(prev => [newGroup, ...prev]);
    setActiveGroup(newGroup);
    setView('group-chat');
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
    return <AuthScreen onLogin={handleLogin} onNavigateToRegister={() => setView('register')} loading={loading} error={authError} />;
  }

  // Render Authenticated Views
  return (
    <div className={`min-h-screen ${styles.bgGradient} transition-colors duration-500 font-sans`}>
      <Navbar 
        view={view as ViewState}
        setView={(v) => setView(v)}
        user={user}
        theme={theme}
        toggleTheme={toggleTheme}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        handleLogout={handleLogout}
      />
      
      <main className="pb-12">
        {view === 'dashboard' && (
          <DashboardView 
            user={user} 
            documents={documents} 
            theme={theme} 
            setView={setView} 
            onUpload={handleUpload}
          />
        )}
        
        {view === 'library' && (
            <LibraryView 
              documents={documents} 
              theme={theme} 
              onOpenDoc={handleOpenDoc} 
              onUpload={handleUpload}
            />
        )}

        {view === 'community' && (
            <CommunityView 
              groups={groups}
              documents={documents}
              theme={theme} 
              onJoinGroup={handleJoinGroup} 
              onCreateGroup={handleCreateGroup}
            />
        )}

        {view === 'group-chat' && activeGroup && (
            <GroupChatView 
              group={activeGroup}
              currentUser={user}
              theme={theme}
              onBack={() => setView('community')}
            />
        )}

        {view === 'doc-read' && activeDoc && (
            <DocumentAnalysisView 
              document={activeDoc} 
              theme={theme} 
              initialMessages={messages}
              onBack={() => setView('library')}
            />
        )}

        {view === 'support' && (
            <SupportView 
              theme={theme} 
              onBack={() => setView('dashboard')} 
            />
        )}
      </main>
    </div>
  );
}