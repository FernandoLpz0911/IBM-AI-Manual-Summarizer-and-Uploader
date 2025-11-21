import React, { useRef } from 'react';
import { Upload, FileText, Bot, Users, TrendingUp, Clock, Search } from 'lucide-react';
import { User, DocumentData, Theme, ViewState } from '../types';
import { MOCK_HISTORY } from '../constants';

interface DashboardViewProps {
  user: User;
  documents: DocumentData[];
  theme: Theme;
  setView: (view: ViewState) => void;
  onUpload: (file: File) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ user, documents, theme, setView, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
      // Reset value so the same file can be uploaded again if needed
      event.target.value = '';
    }
  };

  const styles = {
    cardBg: theme === 'dark' ? 'bg-[#1e293b]/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm',
    textMain: theme === 'dark' ? 'text-slate-100' : 'text-slate-900',
    textSub: theme === 'dark' ? 'text-slate-400' : 'text-slate-500',
    border: theme === 'dark' ? 'border-slate-700/50' : 'border-slate-200/60',
  };

  // specific color styles for the glowing effects
  const getColorStyles = (color: string) => {
    const isDark = theme === 'dark';
    
    const colors: Record<string, any> = {
      blue: {
        iconBg: isDark ? 'bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-blue-50',
        iconText: isDark ? 'text-blue-300' : 'text-blue-600',
        glow: isDark ? 'hover:shadow-blue-500/20 hover:border-blue-500/40' : 'hover:shadow-blue-500/20 hover:border-blue-200',
        badge: isDark ? 'bg-blue-400/10 text-blue-300' : 'bg-blue-50 text-blue-600'
      },
      emerald: {
        iconBg: isDark ? 'bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-emerald-50',
        iconText: isDark ? 'text-emerald-300' : 'text-emerald-600',
        glow: isDark ? 'hover:shadow-emerald-500/20 hover:border-emerald-500/40' : 'hover:shadow-emerald-500/20 hover:border-emerald-200',
        badge: isDark ? 'bg-emerald-400/10 text-emerald-300' : 'bg-emerald-50 text-emerald-600'
      },
      amber: {
        iconBg: isDark ? 'bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-amber-50',
        iconText: isDark ? 'text-amber-300' : 'text-amber-600',
        glow: isDark ? 'hover:shadow-amber-500/20 hover:border-amber-500/40' : 'hover:shadow-amber-500/20 hover:border-amber-200',
        badge: isDark ? 'bg-amber-400/10 text-amber-300' : 'bg-amber-50 text-amber-600'
      },
      purple: {
        iconBg: isDark ? 'bg-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-purple-50',
        iconText: isDark ? 'text-purple-300' : 'text-purple-600',
        glow: isDark ? 'hover:shadow-purple-500/20 hover:border-purple-500/40' : 'hover:shadow-purple-500/20 hover:border-purple-200',
        badge: isDark ? 'bg-purple-400/10 text-purple-300' : 'bg-purple-50 text-purple-600'
      }
    };

    return colors[color] || colors.blue;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className={`text-3xl font-bold ${styles.textMain} animate-in slide-in-from-bottom duration-700 flex items-center`}>
            Welcome, <span className="text-blue-500 ml-2">{" to DocuMind"}</span>
          </h2>
          <p className={`${styles.textSub} mt-1 animate-in slide-in-from-bottom duration-700 delay-150`}>
            Your intelligent document analysis dashboard is ready.
          </p>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept=".pdf,.doc,.docx,.txt"
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-blue-500/20 flex items-center transition-all duration-300 hover:scale-105 active:scale-95 font-medium text-sm animate-in slide-in-from-right duration-500"
        >
          <Upload size={16} className="mr-2" /> Upload New Manual
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Manuals', val: documents.length.toString(), icon: FileText, change: '+1', color: 'blue' },
          { label: 'AI Conversations', val: '9', icon: Bot, change: '+2', color: 'emerald' }, 
          { label: 'Groups Joined', val: '4', icon: Users, change: 'New', color: 'amber' }, 
          { label: 'Queries Today', val: '45', icon: TrendingUp, change: '+12%', color: 'purple' },
        ].map((stat, i) => {
          const colorStyle = getColorStyles(stat.color);
          
          return (
            <div 
              key={i} 
              className={`${styles.cardBg} p-6 rounded-2xl border ${styles.border} shadow-lg flex flex-col justify-between 
                transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-default animate-in zoom-in duration-500 ${colorStyle.glow}`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3.5 rounded-xl ${colorStyle.iconBg} ${colorStyle.iconText} backdrop-blur-md transition-colors duration-300`}>
                  <stat.icon size={26} />
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${colorStyle.badge}`}>
                  {stat.change}
                </span>
              </div>
              <div>
                <h3 className={`text-3xl font-bold ${styles.textMain} mb-1`}>{stat.val}</h3>
                <p className={`text-sm ${styles.textSub}`}>{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`${styles.cardBg} rounded-2xl border ${styles.border} shadow-sm overflow-hidden animate-in slide-in-from-bottom duration-700 delay-300`}>
        <div className={`p-6 border-b ${styles.border} flex justify-between items-center`}>
          <h3 className={`font-bold ${styles.textMain} flex items-center`}>
            <Clock size={18} className="mr-2 text-blue-500" /> Recent Analysis History
          </h3>
          <button className={`text-xs ${styles.textSub} hover:text-blue-500 transition-colors`}>View All</button>
        </div>
        <div>
          {MOCK_HISTORY.map((item) => (
            <div 
              key={item.id} 
              className={`p-4 flex items-center justify-between hover:bg-white/5 transition border-b ${styles.border} last:border-0 cursor-pointer group`}
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg mr-4 transition-colors group-hover:text-blue-500 ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                  <Search size={16} />
                </div>
                <div>
                  <p className={`text-sm font-medium ${styles.textMain} group-hover:text-blue-400 transition-colors`}>"{item.query}"</p>
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
};

export default DashboardView;