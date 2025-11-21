import React from 'react';
import { FileText, MoreVertical, Search, Lock, Users as UsersIcon } from 'lucide-react';
import { DocumentData, Theme, ViewState } from '../types';

interface LibraryViewProps {
  documents: DocumentData[];
  theme: Theme;
  onOpenDoc: (doc: DocumentData) => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ documents, theme, onOpenDoc }) => {
  const styles = {
    cardBg: theme === 'dark' ? 'bg-[#1e293b]/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm',
    textMain: theme === 'dark' ? 'text-slate-100' : 'text-slate-900',
    textSub: theme === 'dark' ? 'text-slate-400' : 'text-slate-500',
    border: theme === 'dark' ? 'border-slate-700/50' : 'border-slate-200/60',
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className={`text-3xl font-bold ${styles.textMain} mb-2 tracking-tight`}>My Library</h2>
        <p className={`text-sm ${styles.textSub}`}>Manage and analyze your technical documentation.</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input 
            type="text" 
            className={`block w-full pl-10 pr-3 py-3 rounded-xl border leading-5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}
            placeholder="Search documents by title, content, or tags..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc, idx) => (
          <div 
            key={doc.id}
            onClick={() => onOpenDoc(doc)}
            className={`${styles.cardBg} rounded-xl border ${styles.border} p-5 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group`}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                <FileText size={24} />
              </div>
              <button className={`${styles.textSub} hover:text-blue-500 transition-colors p-1 rounded-full hover:bg-slate-700/20`}>
                <MoreVertical size={18} />
              </button>
            </div>
            
            <h3 className={`font-semibold text-lg ${styles.textMain} mb-2 line-clamp-1 group-hover:text-blue-500 transition-colors`}>{doc.title}</h3>
            
            <div className="flex items-center space-x-2 mb-4">
               <span className={`text-xs px-2 py-0.5 rounded-full border ${theme === 'dark' ? 'border-slate-600 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                {doc.type}
               </span>
               <span className={`text-xs px-2 py-0.5 rounded-full flex items-center ${doc.isPublic ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                 {doc.isPublic ? <UsersIcon size={10} className="mr-1" /> : <Lock size={10} className="mr-1" />}
                 {doc.isPublic ? 'Public' : 'Private'}
               </span>
            </div>

            <p className={`text-sm ${styles.textSub} line-clamp-2 mb-4 h-10`}>
              {doc.summary}
            </p>

            <div className={`pt-4 border-t ${styles.border} flex justify-between items-center text-xs ${styles.textSub}`}>
              <span>{doc.fileSize}</span>
              <span>{doc.uploadDate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LibraryView;