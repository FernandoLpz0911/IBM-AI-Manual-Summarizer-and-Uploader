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
  Highlighter
} from 'lucide-react';

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
  // If the AI references a specific part of the doc, we include the paragraphId
  referenceId?: number; 
}

interface DocumentData {
  id: string;
  title: string;
  ownerId: string;
  ownerName: string;
  isPublic: boolean;
  summary: string;
  content: string[]; // Array of paragraphs for simulation
  uploadDate: string;
}

// MOCK DATA - Simulating Firestore & Storage
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

const MOCK_CHATS: Record<string, Message[]> = {
  'doc-1': [
    { id: 'm1', sender: 'ai', text: 'Hello! I have analyzed "Project Omega Technical Manual". Ask me anything.' },
    { id: 'm2', sender: 'user', text: 'How often do I need to clean the cylinder?' },
    { id: 'm3', sender: 'ai', text: 'The core cylinder requires flushing every 400 operational hours.', referenceId: 2 }
  ]
};

/**
 * MAIN APP COMPONENT
 */
export default function App() {
  // --- State Management ---
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'login' | 'library' | 'community' | 'document'>('login');
  const [documents, setDocuments] = useState<DocumentData[]>(MOCK_DOCS);
  const [activeDoc, setActiveDoc] = useState<DocumentData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Ref for scrolling to specific paragraphs
  const paragraphRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  // --- Simulated Auth Functions ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setUser({ uid: 'user-1', email: 'user@example.com', name: 'Demo User' });
      setView('library');
      setLoading(false);
    }, 800);
  };

  // --- Navigation & Actions ---
  const openDocument = (doc: DocumentData) => {
    setActiveDoc(doc);
    // Load chat history if owner, else empty array
    if (doc.ownerId === user?.uid) {
      setMessages(MOCK_CHATS[doc.id] || [{ id: 'init', sender: 'ai', text: `Ready to discuss ${doc.title}.` }]);
    } else {
      setMessages([{ id: 'init', sender: 'ai', text: `Viewing Public Document: ${doc.title}. Note: You cannot see the owner's private chat history.` }]);
    }
    setView('document');
  };

  const handleUpload = () => {
    // Simulate file upload workflow
    const newDoc: DocumentData = {
      id: `doc-${Date.now()}`,
      title: 'New Uploaded Manual.pdf',
      ownerId: user?.uid || '',
      ownerName: user?.name || '',
      isPublic: false,
      uploadDate: new Date().toISOString().split('T')[0],
      summary: 'Processing...',
      content: [
        "1. Overview: This is a newly uploaded document simulation.",
        "2. Details: The AI is currently processing this text to generate embeddings.",
        "3. Conclusion: Once finished, you can ask questions about this section."
      ]
    };
    setDocuments([newDoc, ...documents]);
    alert("File uploaded! The AI is now processing the document.");
  };

  // --- Components ---

  const AuthScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">DocuMind AI</h1>
          <p className="text-slate-500">Intelligent Document Analysis</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input required type="email" className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="demo@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input required type="password" className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" />
          </div>
          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center">
            {loading ? <Loader2 className="animate-spin mr-2" /> : 'Sign In'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Account handles authentication via Firebase
        </p>
      </div>
    </div>
  );

  const Navbar = () => (
    <nav className="bg-slate-900 text-white p-4 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setView('library')}>
          <BookOpen className="text-blue-400" />
          <span className="font-bold text-xl">DocuMind</span>
        </div>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-6">
          <button onClick={() => setView('library')} className={`${view === 'library' ? 'text-blue-400' : 'text-slate-300'} hover:text-white`}>My Library</button>
          <button onClick={() => setView('community')} className={`${view === 'community' ? 'text-blue-400' : 'text-slate-300'} hover:text-white`}>Community</button>
          <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-slate-700">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
              {user?.name.charAt(0)}
            </div>
            <button onClick={() => setUser(null)} className="text-slate-400 hover:text-red-400"><LogOut size={18} /></button>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 space-y-2 pb-4 border-t border-slate-800 pt-4">
          <button onClick={() => {setView('library'); setMobileMenuOpen(false)}} className="block w-full text-left py-2 px-4 hover:bg-slate-800 rounded">My Library</button>
          <button onClick={() => {setView('community'); setMobileMenuOpen(false)}} className="block w-full text-left py-2 px-4 hover:bg-slate-800 rounded">Community</button>
          <button onClick={() => setUser(null)} className="block w-full text-left py-2 px-4 text-red-400 hover:bg-slate-800 rounded">Sign Out</button>
        </div>
      )}
    </nav>
  );

  const DocumentCard = ({ doc, showOwner }: { doc: DocumentData, showOwner?: boolean }) => (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col h-full">
      <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
        <div className="bg-blue-100 p-2 rounded-lg">
          <FileText className="text-blue-600" size={24} />
        </div>
        {doc.isPublic && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Public</span>}
      </div>
      <div className="p-5 flex-1">
        <h3 className="font-bold text-slate-800 mb-2 line-clamp-1">{doc.title}</h3>
        {showOwner && <p className="text-xs text-slate-500 mb-2 flex items-center"><Users size={12} className="mr-1"/> {doc.ownerName}</p>}
        <p className="text-sm text-slate-600 line-clamp-3">{doc.summary}</p>
      </div>
      <div className="p-4 pt-0 mt-auto">
        <button 
          onClick={() => openDocument(doc)}
          className="w-full py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800 transition flex items-center justify-center"
        >
          Open Document <ChevronRight size={16} className="ml-1" />
        </button>
      </div>
    </div>
  );

  const LibraryView = () => (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">My Library</h2>
          <p className="text-slate-500 mt-1">Manage your uploaded manuals and chats.</p>
        </div>
        <button onClick={handleUpload} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center transition">
          <Upload size={18} className="mr-2" /> Upload New
        </button>
      </div>

      {/* Cache Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-sm text-blue-800 flex items-center">
        <Loader2 className="animate-spin mr-2 h-4 w-4" /> 
        Loading cached data from local storage for faster access...
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.filter(d => d.ownerId === user?.uid).map(doc => (
          <DocumentCard key={doc.id} doc={doc} />
        ))}
      </div>
    </div>
  );

  const CommunityView = () => (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Community Hub</h2>
        <p className="text-slate-500 mt-1">Explore documents shared by other researchers.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.filter(d => d.isPublic && d.ownerId !== user?.uid).map(doc => (
          <DocumentCard key={doc.id} doc={doc} showOwner />
        ))}
      </div>
    </div>
  );

  /**
   * DOCUMENT WORKSPACE
   * Split view: Doc Viewer (Left) + Chat (Right)
   */
  const DocumentWorkspace = () => {
    const [input, setInput] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom of chat
    useEffect(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, [messages]);

    const sendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;

      const newMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
      setMessages(prev => [...prev, newMsg]);
      setInput('');

      // Simulate AI Response with reference jumping
      setTimeout(() => {
        const aiMsg: Message = { 
          id: (Date.now() + 1).toString(), 
          sender: 'ai', 
          text: `I found information relevant to "${newMsg.text}" in section 4.`,
          referenceId: 3 // Hardcoded jump to 4th paragraph (index 3) for demo
        };
        setMessages(prev => [...prev, aiMsg]);
      }, 1000);
    };

    const jumpToParagraph = (index: number) => {
      const element = paragraphRefs.current[index];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('bg-yellow-200');
        setTimeout(() => element.classList.remove('bg-yellow-200'), 2000);
      }
    };

    if (!activeDoc) return null;

    return (
      <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-100">
        {/* Toolbar */}
        <div className="bg-white border-b px-4 py-2 flex justify-between items-center shadow-sm">
          <div className="flex items-center">
            <button onClick={() => setView('library')} className="mr-4 text-slate-500 hover:text-slate-800 font-medium">
              &larr; Back
            </button>
            <h3 className="font-bold text-slate-800">{activeDoc.title}</h3>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            Parsed via Django/Tesseract OCR
          </div>
        </div>

        {/* Workspace Split */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left: PDF/Doc Viewer */}
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50 border-r border-slate-200">
            <div className="max-w-3xl mx-auto bg-white shadow-lg min-h-full p-8 md:p-12 rounded-sm">
              <h1 className="text-3xl font-serif font-bold mb-8 text-black">{activeDoc.title}</h1>
              <div className="space-y-6 font-serif leading-relaxed text-slate-800">
                {activeDoc.content.map((paragraph, idx) => (
                  <p 
                    key={idx} 
                    ref={(el) => paragraphRefs.current[idx] = el}
                    className="transition-colors duration-500 p-2 rounded hover:bg-slate-50"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Right: AI Chat */}
          <div className="w-full md:w-96 lg:w-[450px] flex flex-col bg-white shadow-xl z-10">
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white/20 p-1.5 rounded-lg mr-2">
                  <MessageSquare size={18} />
                </div>
                <span className="font-semibold">AI Assistant</span>
              </div>
              <button onClick={() => setMessages([])} className="text-xs opacity-70 hover:opacity-100 hover:underline">Clear</button>
            </div>

            {/* Messages Area */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-md' 
                      : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                  }`}>
                    <p>{msg.text}</p>
                    
                    {/* Jump Link if reference exists */}
                    {msg.referenceId !== undefined && (
                      <button 
                        onClick={() => jumpToParagraph(msg.referenceId!)}
                        className="mt-2 flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 w-fit transition"
                      >
                        <Highlighter size={12} className="mr-1" /> 
                        Jump to Reference
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="p-3 bg-white border-t border-slate-200">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about the document..."
                  className="w-full pl-4 pr-12 py-3 bg-slate-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 focus:bg-white transition outline-none"
                />
                <button 
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // --- Main Render ---
  if (!user) return <AuthScreen />;

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <Navbar />
      {view === 'library' && <LibraryView />}
      {view === 'community' && <CommunityView />}
      {view === 'document' && <DocumentWorkspace />}
    </div>
  );
}