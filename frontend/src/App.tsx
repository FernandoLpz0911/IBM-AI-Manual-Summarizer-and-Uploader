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

// Firebase Imports
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential } from 'firebase/auth';

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${(import.meta as any).env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: "YOUR_SENDER_ID", 
  appId: "YOUR_APP_ID" 
};

// Initialize Firebase
let firebaseApp: FirebaseApp;
let auth: any;

try {
  firebaseApp = initializeApp(firebaseConfig);
  auth = getAuth(firebaseApp);
} catch (error) {
  console.error("Firebase Initialization Error: Check your .env variables!", error);
}

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

  // --- Helpers ---
  const getFormValues = (e: React.FormEvent<HTMLFormElement>, names: string[]) => {
    return names.reduce((acc, name) => {
      const element = (e.currentTarget.elements.namedItem(name) as HTMLInputElement);
      if (element) {
        acc[name] = element.value;
      }
      return acc;
    }, {} as Record<string, string>);
  };

  // --- Authentication Actions ---
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    const values = getFormValues(e as React.FormEvent<HTMLFormElement>, ['email', 'password']);
    const { email, password } = values;

    try {
      // Firebase Sign In
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userData: User = { 
        uid: firebaseUser.uid, 
        email: firebaseUser.email || email, 
        name: firebaseUser.displayName || email.split('@')[0], // Fallback name
        role: 'User', // Default role
        company: 'Tech Corp', // Default company
        theme: 'dark', 
        storageUsed: 0,
        storageLimit: 1000,
        preferences: { aiSuggestions: true, topics: [] }
      };

      setUser(userData);
      setView('dashboard');

    } catch (error: any) {
      console.error("Firebase Login Error:", error);
      let message = 'Login failed. Please check your credentials.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'Invalid email or password.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'The email address is not valid.';
      }
      setAuthError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    const values = getFormValues(e as React.FormEvent<HTMLFormElement>, ['email', 'password', 'confirmPassword', 'name', 'company', 'theme']);
    const { email, password, confirmPassword, name, company, theme: formTheme } = values;
    
    if (password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      // Firebase Create User
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const newUser: User = { 
        uid: firebaseUser.uid, 
        email: email, 
        name: name || 'New User',
        company: company || 'Company',
        role: 'Admin',
        theme: (formTheme as Theme) || 'dark',
        storageUsed: 0,
        storageLimit: 1000,
        preferences: { aiSuggestions: true, topics: [] }
      };

      setUser(newUser);
      setTheme(newUser.theme); 
      setView('dashboard'); 

    } catch (error: any) {
      console.error("Firebase Registration Error:", error);
      let message = 'Registration failed. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        message = 'This email is already registered.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password must be at least 6 characters';
      }
      setAuthError(message);
    } finally {
      setLoading(false);
    }
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
       return <RegisterScreen onRegister={handleRegister} onNavigateToLogin={() => setView('login')} loading={loading} error={authError} />;
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