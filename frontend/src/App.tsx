import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, MessageSquare, Upload, Users, LogOut, FileText, 
  Send, Loader2, ChevronRight, X, User as UserIcon, Sparkles,
  Search, Bot
} from 'lucide-react';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword 
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
  ownerId?: string;
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
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [activeDoc, setActiveDoc] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [docLoading, setDocLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- EFFECTS ---
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  useEffect(() => {
    if (user) fetchLibrary();
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
        const content = await fetchDocumentContent(doc.id);
        setActiveDoc({ ...doc, content: content });
        setChatMessages([]);
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
      fetchLibrary(); 

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

  // --- AUTH HELPERS ---
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
    } catch (err: any) { setAuthError("Invalid credentials."); } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setAuthError(null);
    const { email, password, confirmPassword, name } = getFormValues(e, ['email', 'password', 'confirmPassword', 'name']);
    if (password !== confirmPassword) { setAuthError("Passwords do not match"); setLoading(false); return; }
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      setUser({ uid: cred.user.uid, email: email, name: name || 'User' });
      setView('library');
    } catch (err: any) { setAuthError(err.message); } finally { setLoading(false); }
  };

  // --- RENDERERS ---

  const renderAuthScreen = () => (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 text-zinc-200">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-2xl shadow-2xl max-w-md w-full relative z-10">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-indigo-500/10 rounded-xl">
            <BookOpen className="w-8 h-8 text-indigo-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center mb-2 text-white">DocuMind AI</h1>
        <p className="text-center text-zinc-500 mb-8 text-sm">Your intelligent document companion</p>
        
        {authError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm text-center">
            {authError}
          </div>
        )}

        <form onSubmit={view === 'login' ? handleLogin : handleRegister} className="space-y-4">
          {view === 'register' && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400 ml-1">Full Name</label>
              <input name="name" className="w-full p-3 bg-zinc-950/50 border border-zinc-800 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" required />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400 ml-1">Email Address</label>
            <input name="email" type="email" className="w-full p-3 bg-zinc-950/50 border border-zinc-800 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400 ml-1">Password</label>
            <input name="password" type="password" className="w-full p-3 bg-zinc-950/50 border border-zinc-800 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" required />
          </div>
          {view === 'register' && (
             <div className="space-y-1">
             <label className="text-xs font-medium text-zinc-400 ml-1">Confirm Password</label>
             <input name="confirmPassword" type="password" className="w-full p-3 bg-zinc-950/50 border border-zinc-800 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" required />
           </div>
          )}
          <button disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex justify-center items-center">
            {loading ? <Loader2 className="animate-spin w-5 h-5"/> : (view === 'login' ? "Sign In" : "Create Account")}
          </button>
        </form>
        
        <div className="mt-6 text-center pt-6 border-t border-white/5">
          <button onClick={() => setView(view === 'login' ? 'register' : 'login')} className="text-zinc-400 text-sm hover:text-indigo-400 transition-colors">
            {view === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderLibrary = () => (
    <div className="p-8 md:p-12 h-full overflow-y-auto bg-zinc-950">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
            <h2 className="text-3xl font-bold text-white mb-2">Library</h2>
            <p className="text-zinc-400">Manage and analyze your technical documentation.</p>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="application/pdf" className="hidden" />
        <button onClick={() => fileInputRef.current?.click()} className="bg-white text-zinc-950 px-6 py-3 rounded-lg flex items-center gap-2 font-semibold hover:bg-zinc-200 transition-colors shadow-lg shadow-zinc-900/50">
          <Upload size={18} /> Upload PDF
        </button>
      </div>
      
      {docLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl shadow-2xl flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-indigo-500 w-8 h-8"/> 
                <span className="text-zinc-300">Processing Document...</span>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
                    <Upload className="text-zinc-600 w-8 h-8" />
                </div>
                <p className="text-zinc-500 font-medium">No documents found</p>
                <p className="text-zinc-600 text-sm mt-1">Upload a PDF to get started</p>
            </div>
        ) : (
            documents.map(doc => (
            <div key={doc.id} onClick={() => handleDocumentClick(doc)} className="group bg-zinc-900/50 border border-white/5 p-6 rounded-2xl hover:border-indigo-500/50 hover:bg-zinc-900 transition-all cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="p-3 bg-zinc-800 rounded-lg group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors text-zinc-400">
                        <FileText className="w-6 h-6" />
                    </div>
                    {doc.page_count && <span className="text-xs font-mono text-zinc-500 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">{doc.page_count} PG</span>}
                </div>
                <h3 className="font-bold text-zinc-100 mb-2 truncate relative z-10 text-lg">{doc.title}</h3>
                <p className="text-zinc-500 text-sm line-clamp-2 relative z-10 leading-relaxed">{doc.summary}</p>
                <div className="mt-6 text-xs text-zinc-600 flex items-center gap-2 relative z-10">
                    <span className="w-2 h-2 rounded-full bg-zinc-700"></span> {doc.uploadDate}
                </div>
            </div>
            ))
        )}
      </div>
    </div>
  );

  if (!user) return renderAuthScreen();

  return (
    <div className="min-h-screen bg-zinc-950 flex font-sans text-zinc-200">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-950 border-r border-white/5 hidden md:flex flex-col fixed h-full z-20">
        <div className="p-6">
          <div className="flex items-center gap-3 text-white font-bold text-xl tracking-tight">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" /> 
            </div>
            DocuMind
          </div>
        </div>
        
        <nav className="flex-1 px-3 py-4 space-y-1">
          <button onClick={() => setView('library')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${view === 'library' ? 'bg-white/5 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}>
            <BookOpen size={18} /> Library
          </button>
          {/* Placeholder for future feature */}
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all opacity-50 cursor-not-allowed">
            <Users size={18} /> Team <span className="ml-auto text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">SOON</span>
          </button>
        </nav>

        <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-zinc-900/50 border border-white/5">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg">
                    {user.name.charAt(0)}
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-medium text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-zinc-500 truncate">Pro Plan</p>
                </div>
                <button onClick={() => setUser(null)} className="text-zinc-500 hover:text-red-400 transition-colors p-1">
                    <LogOut size={16} />
                </button>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 h-screen overflow-hidden">
        {view === 'library' && renderLibrary()}
        
        {view === 'document' && activeDoc && (
          <div className="flex h-full flex-col lg:flex-row"> 
            
            {/* Left: Document Reader */}
            <div className="w-full lg:w-[55%] h-1/2 lg:h-full flex flex-col border-b lg:border-b-0 lg:border-r border-white/5 bg-zinc-950 relative">
                <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
                     <div className="flex items-center gap-4 overflow-hidden">
                        <button onClick={() => setView('library')} className="text-zinc-500 hover:text-white transition-colors">
                            <ChevronRight className="rotate-180 w-5 h-5"/> 
                        </button>
                        <h1 className="font-semibold text-zinc-200 truncate">{activeDoc.title}</h1>
                     </div>
                     <div className="flex gap-2">
                        <button className="p-2 text-zinc-500 hover:bg-white/5 rounded-lg transition-colors"><Search size={18}/></button>
                     </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 lg:p-12 scroll-smooth">
                    <div className="max-w-3xl mx-auto space-y-6">
                        {activeDoc.content.map((paragraph, i) => {
                            const isReferenced = chatMessages.some(m => m.referenceId === i);
                            return (
                                <div key={i} className={`relative transition-all duration-500 ${isReferenced ? 'bg-indigo-500/10 p-4 -mx-4 rounded-lg' : ''}`}>
                                    {isReferenced && <div className="absolute left-0 top-4 bottom-4 w-1 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>}
                                    <span className="absolute -left-8 md:-left-12 top-1 text-[10px] font-mono text-zinc-700 select-none opacity-0 hover:opacity-100">{i}</span>
                                    <p className={`text-lg leading-relaxed ${isReferenced ? 'text-indigo-100' : 'text-zinc-300'}`}>
                                        {paragraph}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Right: AI Chat */}
            <div className="w-full lg:w-[45%] h-1/2 lg:h-full flex flex-col bg-zinc-900">
              <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between bg-zinc-900">
                  <h3 className="font-bold text-zinc-200 flex items-center gap-2">
                      <Sparkles className="text-indigo-500 w-4 h-4" /> AI Assistant
                  </h3>
                  <span className="text-xs text-zinc-500 bg-zinc-950 px-2 py-1 rounded-full border border-white/5">GPT-4o Model</span>
              </div>
              
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                {chatMessages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 opacity-50">
                        <Bot className="w-12 h-12 mb-4" />
                        <p>Ask questions about this document</p>
                    </div>
                )}
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-md ${
                        msg.sender === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-sm' 
                        : 'bg-zinc-800 border border-white/5 text-zinc-200 rounded-bl-sm'
                    }`}>
                      <p>{msg.text}</p>
                      {msg.referenceId !== undefined && msg.referenceId !== null && (
                          <button 
                            onClick={() => {
                                // Simple logic to scroll to paragraph would go here
                            }}
                            className="mt-3 flex items-center gap-2 text-xs font-medium text-indigo-300 bg-indigo-500/10 px-2 py-1.5 rounded hover:bg-indigo-500/20 transition-colors w-fit"
                          >
                              <BookOpen size={12}/> Reference: Paragraph {msg.referenceId}
                          </button>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start w-full">
                        <div className="bg-zinc-800 border border-white/5 p-4 rounded-2xl rounded-bl-sm shadow-sm flex gap-1">
                            <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                    </div>
                )}
              </div>

              <div className="p-4 bg-zinc-900 border-t border-white/5">
                <form onSubmit={handleSendMessage} className="relative">
                  <input 
                    value={chatInput} 
                    onChange={(e) => setChatInput(e.target.value)} 
                    placeholder="Ask something about the document..." 
                    className="w-full pl-4 pr-12 py-4 bg-zinc-950 border border-zinc-800 rounded-xl outline-none text-zinc-200 placeholder-zinc-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner" 
                  />
                  <button 
                    type="submit" 
                    disabled={isTyping || !chatInput} 
                    className="absolute right-2 top-2 bottom-2 aspect-square bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 flex items-center justify-center transition-colors shadow-lg shadow-indigo-900/20"
                  >
                      <Send size={18} />
                  </button>
                </form>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-zinc-600">AI responses can be inaccurate. Verify with document source.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}