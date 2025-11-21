import React, { useState } from 'react';
import { Users, Hash, Shield, FileText, Search, Plus, X, Lock, Globe, Download, UserPlus } from 'lucide-react';
import { Group, Theme, DocumentData } from '../types';

interface CommunityViewProps {
  groups: Group[];
  documents: DocumentData[];
  theme: Theme;
  onJoinGroup: (group: Group) => void;
  onCreateGroup: (newGroup: Group) => void;
}

const CommunityView: React.FC<CommunityViewProps> = ({ groups, documents, theme, onJoinGroup, onCreateGroup }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'public' | 'private'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal Form State
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupDocId, setNewGroupDocId] = useState('');
  const [newGroupType, setNewGroupType] = useState<'public' | 'private'>('public');

  const styles = {
    cardBg: theme === 'dark' ? 'bg-[#1e293b]/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm',
    textMain: theme === 'dark' ? 'text-slate-100' : 'text-slate-900',
    textSub: theme === 'dark' ? 'text-slate-400' : 'text-slate-500',
    border: theme === 'dark' ? 'border-slate-700/50' : 'border-slate-200/60',
    input: theme === 'dark' ? 'bg-slate-800 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900',
  };

  // Filter logic
  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          group.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || group.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const relatedDoc = documents.find(d => d.id === newGroupDocId);
    
    const newGroup: Group = {
        id: `g-${Date.now()}`,
        name: newGroupName,
        description: newGroupDesc,
        members: 1,
        active: true,
        relatedDocId: newGroupDocId,
        relatedDocTitle: relatedDoc?.title || 'Unknown Document',
        type: newGroupType,
        tags: ['new', newGroupType]
    };

    onCreateGroup(newGroup);
    setIsModalOpen(false);
    // Reset form
    setNewGroupName('');
    setNewGroupDesc('');
    setNewGroupDocId('');
  };

  const handleQuickInvite = (e: React.MouseEvent, groupName: string) => {
      e.stopPropagation();
      alert(`Invite link for ${groupName} copied to clipboard!`);
  };

  const handleQuickDownload = (e: React.MouseEvent, docTitle: string) => {
      e.stopPropagation();
      alert(`Downloading ${docTitle}...`);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 animate-in fade-in duration-500 relative">
      
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
        <div>
          <h2 className={`text-3xl font-bold ${styles.textMain} mb-2 tracking-tight`}>Community Hub</h2>
          <p className={`text-sm ${styles.textSub}`}>Join discussions, share insights, and collaborate on documents.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
             {/* Filter Toggle */}
            <div className={`flex p-1 rounded-lg border ${styles.border} ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
                {(['all', 'public', 'private'] as const).map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${
                            filterType === type 
                            ? 'bg-blue-600 text-white shadow-sm' 
                            : `${styles.textSub} hover:bg-slate-100 dark:hover:bg-slate-800`
                        }`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-blue-500/20 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 font-medium text-sm shrink-0"
            >
                <Plus size={18} className="mr-2" /> Create Group
            </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`block w-full pl-10 pr-3 py-3 rounded-xl border leading-5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}
            placeholder="Search for topics, documents, or tags..."
        />
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGroups.length > 0 ? (
            filteredGroups.map((group) => (
            <div 
                key={group.id} 
                onClick={() => onJoinGroup(group)}
                className={`${styles.cardBg} border ${styles.border} rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300 group cursor-pointer flex flex-col justify-between relative overflow-hidden`}
            >
                {/* Gradient Highlight on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                <div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
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
                        
                        {/* Actions */}
                        <div className="flex items-center gap-2">
                             <button 
                                onClick={(e) => handleQuickInvite(e, group.name)}
                                className={`p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition text-slate-400 hover:text-blue-500`} 
                                title="Invite"
                            >
                                <UserPlus size={18} />
                            </button>
                             <button 
                                onClick={(e) => handleQuickDownload(e, group.relatedDocTitle)}
                                className={`p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition text-slate-400 hover:text-blue-500`} 
                                title="Download Doc"
                            >
                                <Download size={18} />
                            </button>
                             <button 
                                className={`ml-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${theme === 'dark' ? 'bg-slate-800 group-hover:bg-blue-600 text-slate-200' : 'bg-slate-100 group-hover:bg-blue-500 group-hover:text-white text-slate-700'}`}
                            >
                                Join
                            </button>
                        </div>
                    </div>

                    <p className={`${styles.textSub} text-sm mb-4 relative z-10`}>{group.description}</p>
                    
                    <div className={`p-3 rounded-lg mb-4 text-xs flex items-center ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-slate-50'} relative z-10`}>
                        <FileText size={16} className="mr-2 text-blue-500" />
                        <span className={styles.textSub}>Linked: <span className="font-medium">{group.relatedDocTitle}</span></span>
                    </div>
                </div>

                <div className="flex gap-2 flex-wrap relative z-10">
                    {group.tags?.map(tag => (
                        <span key={tag} className={`text-xs px-2 py-1 rounded-md ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'}`}>
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>
            ))
        ) : (
            <div className="col-span-full text-center py-20 opacity-50">
                <Search size={48} className="mx-auto mb-4 text-slate-500" />
                <h3 className={`text-xl font-medium ${styles.textMain}`}>No groups found</h3>
                <p className={styles.textSub}>Try adjusting your filters or create a new group.</p>
            </div>
        )}
      </div>

      {/* Create Group Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl ${theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-white'} animate-in zoom-in-95 duration-200`}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-xl font-bold ${styles.textMain}`}>Create New Group</h3>
                    <button onClick={() => setIsModalOpen(false)} className={`${styles.textSub} hover:text-red-500 transition`}>
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${styles.textSub}`}>Group Name</label>
                        <input 
                            required
                            type="text" 
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${styles.input}`}
                            placeholder="e.g. Maintenance Crew A"
                        />
                    </div>
                    
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${styles.textSub}`}>Description</label>
                        <textarea 
                            required
                            value={newGroupDesc}
                            onChange={(e) => setNewGroupDesc(e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${styles.input}`}
                            placeholder="What is this group about?"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${styles.textSub}`}>Linked Document</label>
                        <select 
                            required
                            value={newGroupDocId}
                            onChange={(e) => setNewGroupDocId(e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${styles.input}`}
                        >
                            <option value="" disabled>Select a document...</option>
                            {documents.map(doc => (
                                <option key={doc.id} value={doc.id}>{doc.title}</option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-500 mt-1">Users can view this document within the group.</p>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-2 ${styles.textSub}`}>Privacy Setting</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setNewGroupType('public')}
                                className={`flex items-center justify-center p-3 rounded-xl border transition-all ${newGroupType === 'public' ? 'border-blue-500 bg-blue-500/10 text-blue-500 ring-1 ring-blue-500' : `${styles.border} ${styles.textSub}`}`}
                            >
                                <Globe size={18} className="mr-2" /> Public
                            </button>
                            <button
                                type="button"
                                onClick={() => setNewGroupType('private')}
                                className={`flex items-center justify-center p-3 rounded-xl border transition-all ${newGroupType === 'private' ? 'border-amber-500 bg-amber-500/10 text-amber-500 ring-1 ring-amber-500' : `${styles.border} ${styles.textSub}`}`}
                            >
                                <Lock size={18} className="mr-2" /> Private
                            </button>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all">
                            Create & Join Group
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default CommunityView;