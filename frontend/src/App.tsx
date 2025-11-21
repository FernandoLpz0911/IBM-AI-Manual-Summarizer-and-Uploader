import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, MessageSquare, Upload, Users, LogOut, FileText, 
  Send, Loader2, ChevronRight, X, User as UserIcon 
} from 'lucide-react';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  UserCredential 
} from 'firebase/auth'; 

/** CONFIGURATION */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: "YOUR_SENDER_ID", 
  appId: "YOUR_APP_ID" 
};

let firebaseApp: FirebaseApp;
let auth: any;
try {
  firebaseApp = initializeApp(firebaseConfig);
  auth = getAuth(firebaseApp);
} catch (error) {
  console.error("Firebase Init Error:", error);
}

/** INTERFACES */
interface User { uid: string; email: string; name: string; }
interface Message { id: string; sender: 'user' | 'ai'; text: string; referenceId?: number; }
interface DocumentData {
  id: string;
  title: string;
  ownerId?: string; // Optional
  summary: string;
  content: string[];
  uploadDate: string;
  page_count?: number;
}

type ViewType = 'login' | 'register' | 'library' | 'document';

export default function App() {
  // --- State ---
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewType>('login');
  const [documents, setDocuments] = useState<DocumentData[]>([]); // Starts empty!
  const [activeDoc, setActiveDoc] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [docLoading, setDocLoading] = useState(false); // New loading state for fetching content
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- EFFECTS ---

  // 1. Auto-Scroll Chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // 2. Load Library on Login
  useEffect(() => {
    if (user) {
      fetchLibrary();
    }
  }, [user]);

  // --- API ACTIONS ---

  const fetchLibrary = async () => {
    if (!auth.currentUser) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch('http://localhost:8000/api/library/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      // Backend returns 'documents' list
      setDocuments(data.documents || []);
    } catch (error) {
      console.error("Failed to load library:", error);
    }
  };

  const fetchDocumentContent = async (docId: string) => {
    if (!auth.currentUser) return [];
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch('http://localhost:8000/api/doc-content/', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ doc_id: docId })
      });
      const data = await response.json();
      return data.content || [];
    } catch (error) {
      console.error("Failed to load content:", error);
      return [];
    }
  };

  const handleDocumentClick = async (doc: DocumentData) => {
    setDocLoading(true);
    try {
        // Fetch the full text content (lazy load)
        const content = await fetchDocumentContent(doc.id);
        
        // Update state with full content and switch view
        setActiveDoc({ ...doc, content: content });
        setChatMessages([]); // Clear previous chat
        setView('document');
    } catch (e) {
        alert("Could not load document.");
    } finally {
        setDocLoading(false);
    }
  };

  // --- UPLOAD HANDLER ---

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (!user) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    // Optimistic UI: Add temp doc
    const tempId = Date.now().toString();
    const tempDoc: DocumentData = {
      id: tempId, title: file.name, summary: 'Uploading...', content: [], uploadDate: 'Just now'
    };
    setDocuments(prev => [tempDoc, ...prev]);

    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch('http://localhost:8000/api/upload/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');
      
      alert("Upload Complete!");
      fetchLibrary(); // Refresh list to get real data from DB

    } catch (error) {
      console.error("Upload Error:", error);
      alert("Failed to upload PDF.");
      setDocuments(prev => prev.filter(d => d.id !== tempId));
    }
  };

  // --- CHAT HANDLER ---

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !activeDoc) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMsg.text,
          
          // --- CHANGE THIS ---
          // OLD: full_document_text: activeDoc.content.join('\n')
          // NEW: Send the ID so backend can perform RAG
          doc_id: activeDoc.id 
        })
      });
      
      const data = await response.json();
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.answer || "I'm sorry, I couldn't generate an answer.",
        referenceId: data.reference_index 
      };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      setChatMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', text: "Error connecting to AI server." }]);
    } finally {
      setIsTyping(false);
    }
  };

  // --- AUTH HANDLERS (Login/Register) ---
  const getFormValues = (e: React.FormEvent, names: string[]) => {
    return names.reduce((acc, name) => {
      const element = (e.currentTarget.elements.namedItem(name) as HTMLInputElement);
      if (element) acc[name] = element.value;
      return acc;
    }, {} as Record<string, string>);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setAuthError(null);
    const { email, password } = getFormValues(e, ['email', 'password']);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      setUser({ uid: cred.user.uid, email: cred.user.email || email, name: cred.user.displayName || 'User' });
      setView('library');
    } catch (err: any) { setAuthError("Login failed."); } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setAuthError(null);
    const { email, password, confirmPassword, name } = getFormValues(e, ['email', 'password', 'confirmPassword', 'name']);
    if (password !== confirmPassword) { setAuthError("Passwords match error"); setLoading(false); return; }
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      setUser({ uid: cred.user.uid, email: email, name: name || 'User' });
      setView('library');
    } catch (err: any) { setAuthError(err.message); } finally { setLoading(false); }
  };

  // --- RENDERERS ---

  const renderAuthScreen = () => (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        {/* Simplified for brevity - same UI as before */}
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-slate-200">
             <h1 className="text-2xl font-bold text-center mb-6">IBM Manual Summarizer</h1>
             {authError && <div className="text-red-500 mb-4 text-sm text-center">{authError}</div>}
             <form onSubmit={view === 'login' ? handleLogin : handleRegister} className="space-y-4">
                 {view === 'register' && <input name="name" placeholder="Full Name" className="w-full p-2 border rounded" required />}
                 <input name="email" type="email" placeholder="Email" className="w-full p-2 border rounded" required />
                 <input name="password" type="password" placeholder="Password" className="w-full p-2 border rounded" required />
                 {view === 'register' && <input name="confirmPassword" type="password" placeholder="Confirm Password" className="w-full p-2 border rounded" required />}
                 <button disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                    {loading ? "Loading..." : (view === 'login' ? "Sign In" : "Create Account")}
                 </button>
             </form>
             <button onClick={() => setView(view === 'login' ? 'register' : 'login')} className="w-full mt-4 text-blue-600 text-sm hover:underline">
                {view === 'login' ? 'Need an account? Sign up' : 'Have an account? Log in'}
             </button>
        </div>
    </div>
  );

  const renderLibrary = () => (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Document Library</h2>
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="application/pdf" className="hidden" />
        <button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <Upload size={18} /> Upload PDF
        </button>
      </div>
      
      {docLoading && <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"><div className="bg-white p-4 rounded shadow flex items-center gap-3"><Loader2 className="animate-spin"/> Opening Document...</div></div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.length === 0 ? (
            <p className="text-slate-500 col-span-full text-center py-10">No documents found. Upload one to get started.</p>
        ) : (
            documents.map(doc => (
            <div key={doc.id} onClick={() => handleDocumentClick(doc)} className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-lg transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <FileText className="text-blue-600 w-6 h-6" />
                </div>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{doc.page_count ? `${doc.page_count} pages` : 'PDF'}</span>
                </div>
                <h3 className="font-bold text-slate-800 mb-2 truncate">{doc.title}</h3>
                <p className="text-slate-600 text-sm line-clamp-2">{doc.summary}</p>
                <div className="mt-4 text-xs text-slate-400">{doc.uploadDate}</div>
            </div>
            ))
        )}
      </div>
    </div>
  );

  if (!user) return renderAuthScreen();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-full">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 text-blue-600 font-bold text-xl"><BookOpen /> IBM Manuals</div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setView('library')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === 'library' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <BookOpen size={18} /> Library
          </button>
        </nav>
        <div className="p-4 border-t border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">{user.name.charAt(0)}</div>
            <div className="flex-1 overflow-hidden"><p className="text-sm font-medium text-slate-700 truncate">{user.name}</p></div>
            <button onClick={() => setUser(null)} className="text-slate-400 hover:text-red-500"><LogOut size={18} /></button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        {view === 'library' && renderLibrary()}
        {view === 'document' && activeDoc && (
          <div className="flex h-screen"> 
            <div className="w-1/2 p-8 overflow-y-auto border-r border-slate-200 pb-32">
              <button onClick={() => setView('library')} className="mb-4 text-slate-500 hover:text-blue-600 flex items-center gap-2"><ChevronRight className="rotate-180" size={16}/> Back</button>
              <h1 className="text-3xl font-bold mb-6">{activeDoc.title}</h1>
              <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-4">
                {activeDoc.content.map((paragraph, i) => (
                  <p key={i} className={`text-slate-700 leading-relaxed p-2 rounded ${chatMessages.some(m => m.referenceId === i) ? 'bg-yellow-100 ring-2 ring-yellow-300' : ''}`}>
                    <span className="text-xs font-bold text-slate-400 mr-2">[{i}]</span>{paragraph}
                  </p>
                ))}
              </div>
            </div>
            <div className="w-1/2 flex flex-col bg-slate-50 border-l border-slate-200">
              <div className="p-4 border-b bg-white flex justify-between items-center"><h3 className="font-bold text-slate-700 flex items-center gap-2"><MessageSquare className="text-blue-600" size={20} /> AI Assistant</h3></div>
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'}`}>
                      <p>{msg.text}</p>
                      {msg.referenceId !== undefined && msg.referenceId !== null && <div className="mt-2 text-xs opacity-80 border-t border-blue-200/30 pt-1">Ref: Para [{msg.referenceId}]</div>}
                    </div>
                  </div>
                ))}
                {isTyping && <div className="flex justify-start"><div className="bg-white p-3 rounded-lg shadow-sm"><Loader2 className="animate-spin text-blue-600 w-4 h-4" /></div></div>}
              </div>
              <div className="p-4 bg-white border-t border-slate-200">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask something..." className="flex-1 px-4 py-2 border border-slate-300 rounded-lg outline-none" />
                  <button type="submit" disabled={isTyping || !chatInput} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"><Send size={20} /></button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}