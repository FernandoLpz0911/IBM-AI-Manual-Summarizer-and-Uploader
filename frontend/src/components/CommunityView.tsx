import React from 'react';
import { Users, Hash, Shield, MessageSquare, ArrowRight } from 'lucide-react';
import { Group, Theme } from '../types';
import { MOCK_GROUPS } from '../constants';

interface CommunityViewProps {
  theme: Theme;
  onJoinGroup: (group: Group) => void;
}

const CommunityView: React.FC<CommunityViewProps> = ({ theme, onJoinGroup }) => {
  const styles = {
    cardBg: theme === 'dark' ? 'bg-[#1e293b]/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm',
    textMain: theme === 'dark' ? 'text-slate-100' : 'text-slate-900',
    textSub: theme === 'dark' ? 'text-slate-400' : 'text-slate-500',
    border: theme === 'dark' ? 'border-slate-700/50' : 'border-slate-200/60',
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className={`text-3xl font-bold ${styles.textMain} mb-2 tracking-tight`}>Community Hub</h2>
        <p className={`text-sm ${styles.textSub}`}>Join discussions, share insights, and collaborate with peers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_GROUPS.map((group) => (
          <div 
            key={group.id} 
            className={`${styles.cardBg} border ${styles.border} rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300 group`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${group.type === 'private' ? 'bg-amber-500/10 text-amber-500' : 'bg-purple-500/10 text-purple-500'}`}>
                  {group.type === 'private' ? <Shield size={20} /> : <Hash size={20} />}
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${styles.textMain}`}>{group.name}</h3>
                  <div className="flex items-center space-x-2 text-xs mt-1">
                    <span className={`${styles.textSub} flex items-center`}>
                        <Users size={12} className="mr-1"/> {group.members} members
                    </span>
                    {group.active && <span className="text-emerald-500">• Active now</span>}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => onJoinGroup(group)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${theme === 'dark' ? 'bg-slate-800 hover:bg-blue-600 text-slate-200' : 'bg-slate-100 hover:bg-blue-500 hover:text-white text-slate-700'}`}
              >
                Join
              </button>
            </div>

            <p className={`${styles.textSub} text-sm mb-4`}>{group.description}</p>
            
            <div className={`p-3 rounded-lg mb-4 text-xs flex items-center ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                <FileTextIcon className="w-4 h-4 mr-2 text-blue-500" />
                <span className={styles.textSub}>Linked: <span className="font-medium">{group.relatedDocTitle}</span></span>
            </div>

            <div className="flex gap-2">
                {group.tags?.map(tag => (
                    <span key={tag} className={`text-xs px-2 py-1 rounded-md ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'}`}>
                        #{tag}
                    </span>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper icon for this component
const FileTextIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
);

export default CommunityView;