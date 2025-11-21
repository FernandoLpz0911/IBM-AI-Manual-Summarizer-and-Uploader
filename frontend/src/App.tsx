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
  Moon,
  Sun,
  ArrowLeft,
  CheckCircle,
  Cpu,
  Plus,
  LayoutDashboard,
  TrendingUp,
  Clock,
  Search,
  MessageCircle,
  MoreVertical,
  LifeBuoy,
  HardDrive,
  Shield,
  Activity
} from 'lucide-react';

/**
 * TYPES & INTERFACES
 */
interface User {
  uid: string;
  email: string;
  name: string;
  role: string;
  storageUsed: number; // in MB
  storageLimit: number; // in MB
}

interface Message {
  id: string;
  sender: 'user' | 'ai' | 'other-user' | 'support';
  senderName?: string;
  text: string;
  referenceId?: number; 
  timestamp?: string;
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
  fileSize: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  members: number;
  active: boolean;
}

interface HistoryItem {
  id: string;
  query: string;
  docTitle: string;
  date: string;
  docId: string;
}

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
    fileSize: '2.4 MB',
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
    fileSize: '1.1 MB',
    content: [
      "Executive Summary: Q3 saw a 15% increase in net revenue due to market expansion.",
      "Expenses: Operational costs rose by 5% attributed to new hiring initiatives.",
      "Forecast: We project a flat Q4 due to seasonal supply chain constraints."
    ]
  }
];

const MOCK_GROUPS: Group[] = [
  { id: 'g-1', name: 'Propulsion Safety', description: 'Discussing safety protocols for Class-4 engines.', members: 128, active: true },
  { id: 'g-2', name: 'Financial Compliance', description: 'Q3/Q4 reporting standards and audit prep.', members: 45, active: false },
  { id: 'g-3', name: 'General Engineering', description: 'Open forum for mechanical engineering queries.', members: 342, active: true },
];

const MOCK_CHATS: Record<string, Message[]> = {
  'doc-1': [
    { id: 'm1', sender: 'ai', text: 'Hello! I have analyzed "Project Omega Technical Manual". Ask me anything.' },
    { id: 'm2', sender: 'user', text: 'How often do I need to clean the cylinder?' },
    { id: 'm3', sender: 'ai', text: 'The core cylinder requires flushing every 400 operational hours.', referenceId: 2 }
  ]
};

const MOCK_HISTORY: HistoryItem[] = [
  { id: 'h1', query: 'cleaning cycle frequency', docTitle: 'Project Omega Technical Manual', date: '2 hours ago', docId: 'doc-1' },
  { id: 'h2', query: 'revenue projections Q4', docTitle: 'Q3 Financial Report', date: '1 day ago', docId: 'doc-2' },
  { id: 'h3', query: 'hazmat suit requirements', docTitle: 'Project Omega Technical Manual', date: '3 days ago', docId: 'doc-1' },
];

const MOCK_GROUP_MESSAGES: Record<string, Message[]> = {
  'g-1': [
    { id: 'gm1', sender: 'other-user', senderName: 'Sarah Connors', text: 'Has anyone checked the new flammability standards?', timestamp: '10:30 AM' },
    { id: 'gm2', sender: 'other-user', senderName: 'Mike Ross', text: 'Yes, section 4.2 covers it specifically.', timestamp: '10:32 AM' },
  ]
};

/**
 * AUTH SCREEN
 */
const AuthScreen = ({ onLogin, loading }: { onLogin: (e: React.FormEvent) => void, loading: boolean }) => (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-black"></div>
      
      <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl p-8 w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/50">
            <BookOpen className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white">DocuMind AI</h1>
          <p className="text-blue-200">Intelligent Document Analysis</p>
        </div>
        <form onSubmit={onLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-blue-100">Email</label>
            <input required type="email" className="mt-1 w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none placeholder-slate-400" placeholder="demo@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-100">Password</label>
            <input required type="password" className="mt-1 w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none placeholder-slate-400" placeholder="••••••••" />
          </div>
          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition flex items-center justify-center shadow-lg">
            {loading ? <Loader2 className="animate-spin mr-2" /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
);

/**
 * MAIN APP COMPONENT
 */
export default function App() {
  // --- State ---
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'login' | 'dashboard' | 'library' | 'community' | 'group-chat' | 'upload' | 'doc-read' | 'doc-chat' | 'support'>('login');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [documents, setDocuments] = useState<DocumentData[]>(MOCK_DOCS);
  const [activeDoc, setActiveDoc] = useState<DocumentData | null>(null);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [supportMessages, setSupportMessages] = useState<Message[]>([
    { id: 's1', sender: 'support', text: 'Welcome to DocuMind Support. How can we help you today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const paragraphRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  // --- Actions ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setUser({ 
        uid: 'user-1', 
        email: 'user@example.com', 
        name: 'John Doe',
        role: 'Senior Engineer',
        storageUsed: 450,
        storageLimit: 1000
      });
      setView('dashboard');
      setLoading(false);
    }, 800);
  };

  const openDocument = (doc: DocumentData, initialMode: 'read' | 'chat' = 'read') => {
    setActiveDoc(doc);
    if (doc.ownerId === user?.uid) {
      setMessages(MOCK_CHATS[doc.id] || [{ id: 'init', sender: 'ai', text: `Ready to discuss ${doc.title}.` }]);
    } else {
      setMessages([{ id: 'init', sender: 'ai', text: `Viewing Public Document: ${doc.title}.` }]);
    }
    setView(initialMode === 'read' ? 'doc-read' : 'doc-chat');
  };

  const openGroupChat = (group: Group) => {
    setActiveGroup(group);
    setMessages(MOCK_GROUP_MESSAGES[group.id] || []);
    setView('group-chat');
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // --- Styles Helper ---
  const getThemeClasses = () => {
    const isDark = theme === 'dark';
    return {
      // Animated Wave Background Logic
      bgGradient: isDark 
        ? 'bg-[linear-gradient(-45deg,#020617,#0f172a,#1e1b4b,#0f172a)] animate-gradient-wave' 
        : 'bg-[linear-gradient(-45deg,#f8fafc,#e2e8f0,#dbeafe,#f1f5f9)] animate-gradient-wave',
      cardBg: isDark ? 'bg-[#1e293b]/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm',
      textMain: isDark ? 'text-slate-100' : 'text-slate-900',
      textSub: isDark ? 'text-slate-400' : 'text-slate-500',
      border: isDark ? 'border-slate-700/50' : 'border-slate-200/60',
      navBg: isDark ? 'bg-slate-950/80 backdrop-blur-md' : 'bg-white/80 backdrop-blur-md',
      uploadBar: isDark ? 'bg-slate-800/50 hover:bg-blue-900/30' : 'bg-white hover:bg-blue-50',
    };
  };

  const styles = getThemeClasses();

  // --- Sub-Components ---

  const Navbar = () => (
    <nav className={`${styles.navBg} ${styles.border} border-b sticky top-0 z-50 transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setView('dashboard')}>
            <div className={`p-1.5 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <BookOpen className="text-blue-500" size={20} />
            </div>
            <span className={`font-bold text-lg tracking-tight ${styles.textMain} group-hover:text-blue-500 transition`}>
              DocuMind
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <NavBtn label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={<LayoutDashboard size={16} className="mr-2"/>} />
            <NavBtn label="Library" active={view === 'library'} onClick={() => setView('library')} icon={<FileText size={16} className="mr-2"/>} />
            <NavBtn label="Community" active={view === 'community'} onClick={() => setView('community')} icon={<Users size={16} className="mr-2"/>} />
            <NavBtn label="Support" active={view === 'support'} onClick={() => setView('support')} icon={<LifeBuoy size={16} className="mr-2"/>} />
            
            <div className={`h-6 w-px ${styles.border}`}></div>
            
            <button onClick={toggleTheme} className={`p-2 rounded-full ${styles.textSub} hover:${styles.textMain} transition`}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border border-white/20">
                {user?.name.charAt(0)}
              </div>
              <button onClick={() => setUser(null)} className={`${styles.textSub} hover:text-red-500 transition`}>
                <LogOut size={18} />
              </button>
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center space-x-4">
             <button onClick={toggleTheme} className={`p-2 ${styles.textSub}`}>
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={styles.textMain}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={`md:hidden ${styles.navBg} ${styles.border} border-t p-4 space-y-2 animate-in slide-in-from-top-5`}>
           <MobileNavBtn label="Dashboard" onClick={() => {setView('dashboard'); setMobileMenuOpen(false)}} />
          <MobileNavBtn label="My Library" onClick={() => {setView('library'); setMobileMenuOpen(false)}} />
          <MobileNavBtn label="Community" onClick={() => {setView('community'); setMobileMenuOpen(false)}} />
          <MobileNavBtn label="Support" onClick={() => {setView('support'); setMobileMenuOpen(false)}} />
          <div className={`h-px w-full ${styles.border} my-2`}></div>
          <button onClick={() => setUser(null)} className="w-full text-left py-3 px-4 text-red-400 rounded-lg hover:bg-white/5">Sign Out</button>
        </div>
      )}
    </nav>
  );

  const NavBtn = ({ label, active, onClick, icon }: any) => (
    <button 
      onClick={onClick}
      className={`flex items-center text-sm font-medium transition-colors duration-200 ${active ? 'text-blue-500' : styles.textSub} hover:text-blue-500`}
    >
      {icon}
      {label}
    </button>
  );

  const MobileNavBtn = ({ label, onClick }: any) => (
    <button 
      onClick={onClick} 
      className={`block w-full text-left py-3 px-4 rounded-lg transition ${styles.textMain} hover:bg-white/5`}
    >
      {label}
    </button>
  );

  /**
   * DASHBOARD VIEW
   */
  const DashboardView = () => (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${styles.textMain}`}>Dashboard</h2>
          <p className={styles.textSub}>Welcome back, {user?.name}. Here's what's happening with your manuals.</p>
        </div>
        <button 
          onClick={() => setView('upload')}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-blue-500/20 flex items-center transition font-medium text-sm"
        >
          <Upload size={16} className="mr-2" /> Upload New Manual
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Manuals', val: '124', icon: FileText, change: '+12%', color: 'blue' },
          { label: 'Active Discussions', val: '8', icon: Users, change: '+3', color: 'emerald' },
          { label: 'Queries Today', val: '42', icon: TrendingUp, change: '+5%', color: 'purple' },
        ].map((stat, i) => (
          <div key={i} className={`${styles.cardBg} p-6 rounded-2xl border ${styles.border} shadow-sm flex flex-col justify-between`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${theme === 'dark' ? `bg-${stat.color}-500/10` : `bg-${stat.color}-50`}`}>
                <stat.icon size={24} className={theme === 'dark' ? `text-${stat.color}-400` : `text-${stat.color}-600`} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500`}>
                {stat.change}
              </span>
            </div>
            <div>
              <h3 className={`text-3xl font-bold ${styles.textMain} mb-1`}>{stat.val}</h3>
              <p className={`text-sm ${styles.textSub}`}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent History / Search History */}
      <div className={`${styles.cardBg} rounded-2xl border ${styles.border} shadow-sm overflow-hidden`}>
        <div className={`p-6 border-b ${styles.border} flex justify-between items-center`}>
          <h3 className={`font-bold ${styles.textMain} flex items-center`}>
            <Clock size={18} className="mr-2 text-blue-500" /> Recent Analysis History
          </h3>
          <button className={`text-xs ${styles.textSub} hover:text-blue-500`}>View All</button>
        </div>
        <div>
          {MOCK_HISTORY.map((item, i) => (
            <div 
              key={item.id} 
              className={`p-4 flex items-center justify-between hover:bg-white/5 transition border-b ${styles.border} last:border-0 cursor-pointer`}
              onClick={() => {
                const doc = documents.find(d => d.id === item.docId);
                if (doc) openDocument(doc, 'chat');
              }}
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg mr-4 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <Search size={16} className={styles.textSub} />
                </div>
                <div>
                  <p className={`text-sm font-medium ${styles.textMain}`}>"{item.query}"</p>
                  <p className={`text-xs ${styles.textSub} mt-0.5`}>in {item.docTitle}</p>
                </div>
              </div>
              <span className={`text-xs ${styles.textSub}`}>{item.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /**
   * LIBRARY VIEW - MODIFIED WITH LOGISTICS
   */
  const LibraryView = () => (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className={`text-3xl font-bold ${styles.textMain} mb-1 tracking-tight`}>Library</h2>
          <p className={`text-sm ${styles.textSub}`}>Manage and analyze your technical documentation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* LEFT COLUMN - DOCUMENTS (3 Cols) */}
        <div className="lg:col-span-3 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {documents.filter(d => d.ownerId === user?.uid).map(doc => (
              <div key={doc.id} className={`${styles.cardBg} ${styles.border} border rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group flex flex-col h-full`}>
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                      <FileText size={18} /> 
                    </div>
                    {doc.isPublic && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                        Public
                      </span>
                    )}
                  </div>
                  <h3 className={`font-bold text-base mb-2 ${styles.textMain} line-clamp-1 group-hover:text-blue-500 transition`}>{doc.title}</h3>
                  <p className={`text-xs ${styles.textSub} line-clamp-3 leading-relaxed`}>{doc.summary}</p>
                </div>

                <div className={`p-4 border-t ${styles.border} bg-opacity-50 flex gap-2`}>
                  <button 
                    onClick={() => openDocument(doc, 'read')}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                  >
                    Read
                  </button>
                  <button 
                    onClick={() => openDocument(doc, 'chat')}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition flex items-center justify-center"
                  >
                    <MessageSquare size={12} className="mr-2" /> Discuss
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setView('upload')}
            className={`w-full group relative overflow-hidden rounded-xl border border-dashed ${styles.border} ${styles.uploadBar} p-6 flex flex-col items-center justify-center transition-all duration-300`}
          >
            <div className={`p-3 rounded-full mb-2 transition-transform group-hover:scale-110 duration-300 ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
              <Plus size={24} />
            </div>
            <h3 className={`text-sm font-semibold ${styles.textMain} group-hover:text-blue-500`}>Upload New Document</h3>
          </button>
        </div>

        {/* RIGHT COLUMN - USER LOGISTICS (1 Col) */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Profile Card */}
          <div className={`${styles.cardBg} ${styles.border} border rounded-2xl p-6 shadow-sm`}>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 p-0.5 mb-3 shadow-lg">
                <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-2xl font-bold text-white">
                  {user?.name.charAt(0)}
                </div>
              </div>
              <h3 className={`text-lg font-bold ${styles.textMain}`}>{user?.name}</h3>
              <p className={`text-sm ${styles.textSub}`}>{user?.role}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className={styles.textSub}>Storage Used</span>
                  <span className={`${styles.textMain} font-medium`}>{user?.storageUsed}MB / {user?.storageLimit}MB</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 dark:bg-slate-700 overflow-hidden">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(user!.storageUsed / user!.storageLimit) * 100}%` }}></div>
                </div>
              </div>

              <div className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <div className="flex items-center">
                  <HardDrive size={16} className="text-blue-500 mr-2" />
                  <span className={`text-xs ${styles.textMain}`}>Cloud Sync</span>
                </div>
                <div className="flex items-center text-xs text-emerald-500">
                  <CheckCircle size={12} className="mr-1" /> On
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats / Recent Activity */}
          <div className={`${styles.cardBg} ${styles.border} border rounded-2xl p-6 shadow-sm`}>
            <h4 className={`text-sm font-bold ${styles.textMain} mb-4 flex items-center`}>
              <Activity size={16} className="mr-2 text-blue-500" /> Recent Uploads
            </h4>
            <div className="space-y-4">
              {documents.slice(0, 3).map((doc, idx) => (
                <div key={idx} className="flex items-start">
                  <div className={`mt-0.5 min-w-[4px] h-8 rounded-full ${idx === 0 ? 'bg-blue-500' : 'bg-slate-600'}`}></div>
                  <div className="ml-3">
                    <p className={`text-xs font-medium ${styles.textMain} line-clamp-1`}>{doc.title}</p>
                    <p className={`text-[10px] ${styles.textSub}`}>{doc.fileSize} • {doc.uploadDate}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className={`w-full mt-4 text-xs ${styles.textSub} hover:text-blue-500 transition border-t ${styles.border} pt-3`}>
              View All History
            </button>
          </div>

          {/* Security Status Mock */}
           <div className={`${styles.cardBg} ${styles.border} border rounded-2xl p-6 shadow-sm`}>
             <div className="flex items-center mb-2">
               <Shield size={16} className="text-emerald-500 mr-2" />
               <h4 className={`text-sm font-bold ${styles.textMain}`}>Account Status</h4>
             </div>
             <p className={`text-xs ${styles.textSub}`}>Your account is secure. Last login was from Chicago, IL.</p>
           </div>
        </div>

      </div>
    </div>
  );

  /**
   * COMMUNITY GROUPS VIEW
   */
  const CommunityView = () => (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 animate-in fade-in duration-500">
      <div className="mb-8 text-center">
        <h2 className={`text-3xl font-bold ${styles.textMain} mb-2`}>Community Groups</h2>
        <p className={styles.textSub}>Join discussion channels with other researchers and engineers.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_GROUPS.map((group) => (
          <div key={group.id} className={`${styles.cardBg} ${styles.border} border rounded-2xl p-6 hover:shadow-xl transition group relative overflow-hidden`}>
            <div className={`absolute top-0 right-0 p-4 ${group.active ? 'opacity-100' : 'opacity-0'}`}>
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            
            <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
              <MessageCircle size={24} />
            </div>
            
            <h3 className={`font-bold text-lg ${styles.textMain} mb-2`}>{group.name}</h3>
            <p className={`text-sm ${styles.textSub} mb-4 min-h-[40px]`}>{group.description}</p>
            
            <div className="flex items-center justify-between mt-auto">
              <div className="flex -space-x-2">
                 {[1,2,3].map(i => (
                   <div key={i} className={`w-8 h-8 rounded-full border-2 ${theme === 'dark' ? 'border-slate-800 bg-slate-700' : 'border-white bg-slate-200'} flex items-center justify-center text-[10px]`}>
                     User
                   </div>
                 ))}
                 <div className={`w-8 h-8 rounded-full border-2 ${theme === 'dark' ? 'border-slate-800 bg-slate-800' : 'border-white bg-slate-100'} flex items-center justify-center text-[10px] ${styles.textSub}`}>
                   +{group.members}
                 </div>
              </div>
              <button 
                onClick={() => openGroupChat(group)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Join Chat
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /**
   * SUPPORT VIEW (CONTACT BOX)
   */
  const SupportView = () => {
    const [input, setInput] = useState('');
    const chatRef = useRef<HTMLDivElement>(null);

    const handleSend = (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;
      const newMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
      setSupportMessages(p => [...p, newMsg]);
      setInput('');
      
      // MOCK SUPPORT RESPONSE - Not AI Analysis
      setTimeout(() => {
        setSupportMessages(p => [...p, { 
          id: (Date.now()+1).toString(), 
          sender: 'support', 
          text: 'Thank you for your message. A support ticket (#8821) has been created. An agent will respond shortly.' 
        }]);
      }, 1500);
    };

    return (
      <div className="max-w-3xl mx-auto h-[calc(100vh-100px)] p-4 flex flex-col animate-in slide-in-from-bottom-4">
        <div className="mb-6 text-center">
           <h2 className={`text-2xl font-bold ${styles.textMain}`}>Contact Support</h2>
           <p className={styles.textSub}>Need help with the platform? Chat with our support team.</p>
        </div>

        <div className={`${styles.cardBg} flex-1 rounded-2xl shadow-xl border ${styles.border} flex flex-col overflow-hidden`}>
          <div className={`p-4 border-b ${styles.border} flex items-center`}>
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            <span className={`font-semibold ${styles.textMain} text-sm`}>Support Team Online</span>
          </div>
          
          <div ref={chatRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {supportMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-sm' 
                    : `${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'} ${styles.textMain} rounded-tl-sm border ${styles.border}`
                }`}>
                   <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={`p-4 border-t ${styles.border} ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your issue..."
                className={`w-full pl-4 pr-12 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition 
                  ${theme === 'dark' ? 'bg-slate-950 text-white placeholder-slate-600 border border-slate-800' : 'bg-slate-100 text-slate-900 border border-slate-200'}
                `}
              />
              <button 
                type="submit" 
                disabled={!input.trim()}
                className="absolute right-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  /**
   * GROUP CHAT VIEW
   */
  const GroupChatView = () => {
    if (!activeGroup) return null;
    const [input, setInput] = useState('');
    const chatRef = useRef<HTMLDivElement>(null);

    const handleSend = (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;
      const newMsg: Message = { 
        id: Date.now().toString(), 
        sender: 'user', 
        text: input, 
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
      };
      setMessages(p => [...p, newMsg]);
      setInput('');
      // Simulate reply
      setTimeout(() => {
        setMessages(p => [...p, { 
          id: (Date.now()+1).toString(), 
          sender: 'other-user', 
          senderName: 'Alex Chen',
          text: `Interesting point about ${newMsg.text.split(' ')[0]}...`, 
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
        }]);
      }, 2000);
    };

    return (
      <div className="max-w-5xl mx-auto h-[calc(100vh-100px)] p-4 flex flex-col animate-in slide-in-from-right-4">
        <button onClick={() => setView('community')} className={`mb-4 flex items-center text-sm ${styles.textSub} hover:text-blue-500 self-start`}>
          <ArrowLeft size={16} className="mr-2" /> Back to Groups
        </button>

        <div className={`${styles.cardBg} flex-1 rounded-2xl shadow-xl border ${styles.border} flex flex-col overflow-hidden`}>
          {/* Header */}
          <div className={`p-4 border-b ${styles.border} flex justify-between items-center`}>
            <div>
              <h3 className={`font-bold ${styles.textMain} flex items-center`}>
                <Users size={18} className="mr-2 text-blue-500" /> {activeGroup.name}
              </h3>
              <p className={`text-xs ${styles.textSub}`}>{activeGroup.members} members online</p>
            </div>
            <MoreVertical className={styles.textSub} size={20} />
          </div>

          {/* Messages */}
          <div ref={chatRef} className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg) => {
              const isMe = msg.sender === 'user';
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold mr-2 mt-1">
                      {msg.senderName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    {!isMe && <span className={`text-xs ${styles.textSub} ml-1`}>{msg.senderName}</span>}
                    <div className={`max-w-md rounded-2xl p-3 px-4 shadow-sm mt-1 ${
                      isMe 
                        ? 'bg-blue-600 text-white rounded-tr-sm' 
                        : `${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'} ${styles.textMain} rounded-tl-sm`
                    }`}>
                      <p className="text-sm">{msg.text}</p>
                    </div>
                    <span className={`text-[10px] ${styles.textSub} mt-1 block ${isMe ? 'text-right mr-1' : 'ml-1'}`}>{msg.timestamp}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div className={`p-4 border-t ${styles.border} ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Message #${activeGroup.name}...`}
                className={`w-full pl-4 pr-12 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition 
                  ${theme === 'dark' ? 'bg-slate-950 text-white placeholder-slate-600 border border-slate-800' : 'bg-slate-100 text-slate-900 border border-slate-200'}
                `}
              />
              <button 
                type="submit" 
                disabled={!input.trim()}
                className="absolute right-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const UploadScreen = () => {
    const [dragActive, setDragActive] = useState(false);
    const [processing, setProcessing] = useState(false);

    const startUploadSim = () => {
      setProcessing(true);
      setTimeout(() => {
        const newDoc: DocumentData = {
          id: `doc-${Date.now()}`,
          title: 'New Maintenance Guide.pdf',
          ownerId: user?.uid || '',
          ownerName: user?.name || '',
          isPublic: false,
          uploadDate: new Date().toISOString().split('T')[0],
          fileSize: '0.8 MB',
          summary: 'Processing complete. Document ready for analysis.',
          content: ["1. Introduction: Uploaded successfully."]
        };
        setDocuments([newDoc, ...documents]);
        setProcessing(false);
        setView('library');
      }, 2000);
    };

    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-8 animate-in zoom-in-95 duration-300">
        <button onClick={() => setView('library')} className={`mb-6 flex items-center text-sm ${styles.textSub} hover:text-blue-500 transition`}>
          <ArrowLeft size={16} className="mr-2" /> Back to Library
        </button>

        <div className={`${styles.cardBg} rounded-2xl p-8 shadow-2xl border ${styles.border}`}>
          <div className="text-center mb-8">
            <h2 className={`text-2xl font-bold ${styles.textMain}`}>Upload Document</h2>
            <p className={`mt-2 ${styles.textSub}`}>Supported formats: PDF, DOCX, TXT</p>
          </div>

          <div 
            className={`relative h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300
              ${dragActive ? 'border-blue-500 bg-blue-500/10' : `${styles.border} ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-slate-50'}`}
            `}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); startUploadSim(); }}
          >
            {processing ? (
              <div className="flex flex-col items-center animate-pulse">
                <Cpu size={48} className="text-blue-500 mb-4 animate-bounce" />
                <p className={`font-medium ${styles.textMain}`}>Analyzing Content...</p>
              </div>
            ) : (
              <>
                <div className={`p-4 rounded-full mb-4 ${theme === 'dark' ? 'bg-slate-800' : 'bg-blue-50'}`}>
                  <Upload size={32} className="text-blue-500" />
                </div>
                <button onClick={startUploadSim} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition shadow-lg shadow-blue-500/20">
                  Select File
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const DocumentHeader = () => {
    if (!activeDoc) return null;
    return (
      <div className={`${styles.cardBg} border-b ${styles.border} px-6 py-4 flex flex-col md:flex-row justify-between md:items-center gap-4 sticky top-16 z-40 shadow-sm backdrop-blur-md`}>
        <div className="flex items-center">
          <button onClick={() => setView('library')} className={`mr-4 ${styles.textSub} hover:text-blue-500 transition`}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className={`text-lg font-bold ${styles.textMain} line-clamp-1`}>{activeDoc.title}</h1>
            <p className={`text-xs ${styles.textSub}`}>Last updated {activeDoc.uploadDate}</p>
          </div>
        </div>

        <div className="flex items-center bg-slate-200/10 p-1 rounded-lg border border-slate-500/20 self-start md:self-auto">
          <button onClick={() => setView('doc-read')} className={`flex items-center px-4 py-1.5 rounded-md text-sm font-medium transition ${view === 'doc-read' ? 'bg-blue-600 text-white shadow-md' : `${styles.textSub} hover:${styles.textMain}`}`}>
            <BookOpen size={14} className="mr-2" /> Read
          </button>
          <button onClick={() => setView('doc-chat')} className={`flex items-center px-4 py-1.5 rounded-md text-sm font-medium transition ${view === 'doc-chat' ? 'bg-blue-600 text-white shadow-md' : `${styles.textSub} hover:${styles.textMain}`}`}>
            <MessageSquare size={14} className="mr-2" /> Discuss
          </button>
        </div>
      </div>
    );
  };

  const DocumentReader = () => {
    if (!activeDoc) return null;
    return (
      <div className="max-w-4xl mx-auto p-6 md:p-10 animate-in slide-in-from-bottom-4 duration-500">
        <div className={`${styles.cardBg} shadow-2xl rounded-xl p-8 md:p-16 min-h-[80vh] border ${styles.border}`}>
          <h1 className={`text-3xl md:text-4xl font-serif font-bold mb-10 ${styles.textMain}`}>{activeDoc.title}</h1>
          <div className={`space-y-8 font-serif text-lg leading-relaxed ${styles.textMain}`}>
            {activeDoc.content.map((paragraph, idx) => (
              <p key={idx} ref={(el) => paragraphRefs.current[idx] = el} className={`p-4 rounded-lg transition duration-500 border border-transparent hover:border-blue-500/20 ${theme === 'dark' ? 'hover:bg-blue-500/5' : 'hover:bg-blue-50'}`}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const DiscussionView = () => {
    const [input, setInput] = useState('');
    const chatRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;
      const newMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
      setMessages(p => [...p, newMsg]);
      setInput('');
      setTimeout(() => {
        setMessages(p => [...p, { 
          id: (Date.now()+1).toString(), 
          sender: 'ai', 
          text: `Analyzing "${newMsg.text}"... Based on section 3, this procedure requires authorization.`, 
          referenceId: 2 
        }]);
      }, 1000);
    };

    return (
      <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] p-4 flex flex-col animate-in slide-in-from-right-4 duration-500">
        <div className={`${styles.cardBg} flex-1 rounded-2xl shadow-xl border ${styles.border} flex flex-col overflow-hidden`}>
          <div className={`p-4 border-b ${styles.border} flex justify-between items-center`}>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-3"></div>
              <span className={`font-semibold ${styles.textMain}`}>AI Assistant Online</span>
            </div>
            <button onClick={() => setMessages([])} className={`text-xs ${styles.textSub} hover:text-red-400 transition`}>Clear History</button>
          </div>
          <div ref={chatRef} className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-sm' 
                    : `${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'} ${styles.textMain} rounded-tl-sm border ${styles.border}`
                }`}>
                  <p className="text-sm md:text-base">{msg.text}</p>
                  {msg.referenceId !== undefined && (
                    <button 
                      onClick={() => {setView('doc-read'); setTimeout(() => paragraphRefs.current[msg.referenceId!]?.scrollIntoView({behavior:'smooth', block:'center'}), 100)}}
                      className={`mt-3 flex items-center text-xs font-bold px-3 py-1.5 rounded transition ${msg.sender === 'user' ? 'bg-white/20 hover:bg-white/30' : 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'}`}
                    >
                      <Highlighter size={12} className="mr-1.5" /> Reference found
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className={`p-4 border-t ${styles.border} ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about the manual..."
                className={`w-full pl-5 pr-14 py-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition shadow-inner ${theme === 'dark' ? 'bg-slate-950 text-white placeholder-slate-600 border-slate-800' : 'bg-slate-100 text-slate-900 border-slate-200'} border`}
              />
              <button type="submit" disabled={!input.trim()} className="absolute right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition">
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // --- Main Render Logic ---

  if (!user) {
    return <AuthScreen onLogin={handleLogin} loading={loading} />;
  }

  return (
    <div className={`min-h-screen ${styles.bgGradient} transition-colors duration-500 font-sans`}>
      {/* Dynamic Style Injection for Wave Animation */}
      <style>{`
        @keyframes gradient-wave {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-wave {
          background-size: 400% 400%;
          animation: gradient-wave 15s ease infinite;
        }
      `}</style>

      <Navbar />
      {(view === 'doc-read' || view === 'doc-chat') && <DocumentHeader />}
      <main className="pb-12">
        {view === 'dashboard' && <DashboardView />}
        {view === 'library' && <LibraryView />}
        {view === 'community' && <CommunityView />}
        {view === 'group-chat' && <GroupChatView />}
        {view === 'upload' && <UploadScreen />}
        {view === 'doc-read' && <DocumentReader />}
        {view === 'doc-chat' && <DiscussionView />}
        {view === 'support' && <SupportView />}
      </main>
    </div>
  );
}