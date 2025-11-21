import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  MessageSquare, 
  Upload, 
  Users, 
  LogOut,  
  FileText, 
  Send, 
  Loader2, 
  ChevronRight, 
  Menu,
  X,
  Highlighter,
  User as UserIcon,
  Building,
  Moon,
  Sun
} from 'lucide-react';
import { 
  initializeApp,
  FirebaseApp 
} from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  UserCredential
} from 'firebase/auth'; 

/**
 * 1. FIREBASE CONFIGURATION
 * Uses Vite environment variables passed from Docker
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: "YOUR_SENDER_ID", // Optional: Add to .env if needed
  appId: "YOUR_APP_ID" // Optional: Add to .env if needed
};

// Initialize Firebase client and Auth instance
// We add a try-catch block to prevent the white screen if config is missing
let firebaseApp: FirebaseApp;
let auth: any;

try {
  firebaseApp = initializeApp(firebaseConfig);
  auth = getAuth(firebaseApp);
} catch (error) {
  console.error("Firebase Initialization Error: Check your .env variables!", error);
}

/**
 * TYPES & INTERFACES
 */
interface User {
  uid: string;
  email: string;
  name: string;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  referenceId?: number; 
}

interface DocumentData {
  id: string;
  title: string;
  ownerId: string;
  ownerName: string;
  isPublic: boolean;
  summary: string;
  content: string[];
  uploadDate: string;
}

type ViewType = 'login' | 'register' | 'library' | 'community' | 'document';

// MOCK DATA
const MOCK_DOCS: DocumentData[] = [
  {
    id: 'doc-1',
    title: 'Project Omega Technical Manual',
    ownerId: 'user-1',
    ownerName: 'Current User',
    isPublic: true,
    uploadDate: '2023-10-15',
    summary: 'Overview of the Omega propulsion system standards and safety protocols.',
    content: [
      "1. Introduction: The Omega Propulsion System is designed for high-efficiency orbital transfers.",
      "2. Safety Protocols: All operators must wear Class-4 hazmat suits when handling the fuel cells.",
      "3. Maintenance: The core cylinder requires flushing every 400 operational hours to prevent residue buildup.",
      "4. Emergency Procedures: In case of containment breach, initiate Sequence Alpha immediately.",
      "5. Legal: Use of this technology is restricted to licensed entities under the Galactic Trade Agreement."
    ]
  },
  {
    id: 'doc-2',
    title: 'Q3 Financial Report',
    ownerId: 'user-2',
    ownerName: 'Jane Doe',
    isPublic: true,
    uploadDate: '2023-11-01',
    summary: 'Quarterly earnings breakdown and projection for Q4.',
    content: [
      "Executive Summary: Q3 saw a 15% increase in net revenue due to market expansion.",
      "Expenses: Operational costs rose by 5% attributed to new hiring initiatives.",
      "Forecast: We project a flat Q4 due to seasonal supply chain constraints."
    ]
  }
];

/**
 * MAIN APP COMPONENT
 */
export default function App() {
  // --- State Management ---
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewType>('login');
  const [documents, setDocuments] = useState<DocumentData[]>(MOCK_DOCS);
  const [activeDoc, setActiveDoc] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Helper to extract form data
  const getFormValues = (e: React.FormEvent, names: string[]) => {
    return names.reduce((acc, name) => {
      const element = (e.currentTarget.elements.namedItem(name) as HTMLInputElement);
      if (element) {
        acc[name] = element.value;
      }
      return acc;
    }, {} as Record<string, string>);
  };

  // --- Authentication Handlers ---
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    const values = getFormValues(e, ['email', 'password']);
    const { email, password } = values;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      setUser({ 
        uid: firebaseUser.uid, 
        email: firebaseUser.email || email, 
        name: firebaseUser.displayName || 'Demo User' 
      });
      setView('library');

    } catch (error: any) {
      console.error("Firebase Login Error:", error);
      let message = 'Login failed. Please check your credentials.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
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

    const values = getFormValues(e, ['email', 'password', 'confirmPassword', 'name']);
    const { email, password, confirmPassword, name } = values;
    
    if (password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      setUser({ 
        uid: firebaseUser.uid, 
        email: email, 
        name: name || 'New User'
      });
      setView('library');

    } catch (error: any) {
      console.error("Firebase Registration Error:", error);
      let message = 'Registration failed. Please try again.';
      
      // --- FIX: Syntax Error Fixed Here ---
      if (error.code === 'auth/email-already-in-use') {
        message = 'This email is already registered.';
      } else if (error.code === 'auth/weak-password') {
        // Fixed the broken string literal from your original code
        message = 'Password must be at least 8 characters';
      }
      setAuthError(message);
    } finally {
      setLoading(false);
    }
  };

  // --- UI RENDERERS ---

  const renderAuthScreen = () => (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-slate-200">
        <div className="text-center mb-8">
          <div className="h-12 w-12 bg-blue-600 rounded-lg mx-auto flex items-center justify-center mb-4">
            <BookOpen className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {view === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-slate-600 mt-2">IBM AI Manual Summarizer</p>
        </div>

        {authError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 flex items-center">
             <X className="w-4 h-4 mr-2" /> {authError}
          </div>
        )}

        <form onSubmit={view === 'login' ? handleLogin : handleRegister} className="space-y-4">
          {view === 'register' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input name="name" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="John Doe" />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input name="email" type="email" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="name@company.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input name="password" type="password" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" />
          </div>

          {view === 'register' && (
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
               <input name="confirmPassword" type="password" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" />
             </div>
          )}

          <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all flex justify-center items-center">
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (view === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          {view === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setView(view === 'login' ? 'register' : 'login')} className="text-blue-600 font-semibold hover:underline">
            {view === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderLibrary = () => (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Document Library</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <Upload size={18} /> Upload PDF
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map(doc => (
          <div key={doc.id} onClick={() => { setActiveDoc(doc); setView('document'); }} className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                <FileText className="text-blue-600 w-6 h-6" />
              </div>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{doc.uploadDate}</span>
            </div>
            <h3 className="font-bold text-slate-800 mb-2">{doc.title}</h3>
            <p className="text-slate-600 text-sm line-clamp-2">{doc.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // --- MAIN RENDER ---
  
  if (!user) {
    return renderAuthScreen();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-full">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 text-blue-600 font-bold text-xl">
            <BookOpen /> IBM Manuals
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setView('library')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === 'library' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <BookOpen size={18} /> Library
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Users size={18} /> Community
          </button>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-slate-700 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
            <button onClick={() => setUser(null)} className="text-slate-400 hover:text-red-500">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 transition-all duration-300">
        {view === 'library' && renderLibrary()}
        
        {view === 'document' && activeDoc && (
            <div className="p-8">
                <button onClick={() => setView('library')} className="mb-4 text-slate-500 hover:text-blue-600 flex items-center gap-2">
                    <ChevronRight className="rotate-180" size={16}/> Back to Library
                </button>
                <h1 className="text-3xl font-bold mb-4">{activeDoc.title}</h1>
                <div className="bg-white p-6 rounded-lg shadow">
                    {activeDoc.content.map((p, i) => <p key={i} className="mb-4">{p}</p>)}
                </div>
            </div>
        )}
      </main>
    </div>
  );
}