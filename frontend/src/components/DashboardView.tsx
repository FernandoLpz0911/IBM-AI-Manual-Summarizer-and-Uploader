import React from 'react';
import { Upload, FileText, Bot, Users, TrendingUp, Clock, Search } from 'lucide-react';
import { User, DocumentData, Theme, ViewState } from '../types';
import { MOCK_HISTORY } from '../constants';

interface DashboardViewProps {
  user: User;
  documents: DocumentData[];
  theme: Theme;
  setView: (view: ViewState) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ user, documents, theme, setView }) => {
  const styles = {
    cardBg: theme === 'dark' ? 'bg-[#1e293b]/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm',
    textMain: theme === 'dark' ? 'text-slate-100' : 'text-slate-900',
    textSub: theme === 'dark' ? 'text-slate-400' : 'text-slate-500',
    border: theme === 'dark' ? 'border-slate-700/50' : 'border-slate-200/60',
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className={`text-3xl font-bold ${styles.textMain} animate-in slide-in-from-bottom duration-700 flex items-center`}>
            Welcome, <span className="text-blue-500 ml-2">{user.name}</span>
            <span className="inline-block animate-bounce ml-2">👋</span>
          </h2>
          <p className={`${styles.textSub} mt-1 animate-in slide-in-from-bottom duration-700 delay-150`}>
            Your intelligent document analysis dashboard is ready.
          </p>
        </div>
        <button 
          onClick={() => setView('library')}
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
        ].map((stat, i) => (
          <div 
            key={i} 
            className={`${styles.cardBg} p-6 rounded-2xl border ${styles.border} shadow-sm flex flex-col justify-between 
              transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl cursor-default animate-in zoom-in duration-500`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${theme === 'dark' ? `bg-${stat.color}-500/10 text-${stat.color}-400` : `bg-${stat.color}-50 text-${stat.color}-600`}`}>
                <stat.icon size={24} />
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
                <div className={`p-2 rounded-lg mr-4 transition-colors group-hover:text-blue-500 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <Search size={16} className={styles.textSub} />
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