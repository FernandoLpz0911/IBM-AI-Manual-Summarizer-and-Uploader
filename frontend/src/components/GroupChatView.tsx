import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Users, 
  MoreVertical, 
  Hash, 
  Shield,
  FileText,
  Search,
  Download,
  UserPlus,
  CheckCircle2
} from 'lucide-react';
import { Group, Message, Theme, User } from '../types';

interface GroupChatViewProps {
  group: Group;
  currentUser: User;
  theme: Theme;
  onBack: () => void;
}

const GroupChatView: React.FC<GroupChatViewProps> = ({ group, currentUser, theme, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'sys-1', 
      sender: 'support', 
      text: `Welcome to the ${group.name} channel. This group is focused on ${group.relatedDocTitle}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    {
        id: 'msg-1',
        sender: 'other-user',
        senderName: 'Sarah Connors',
        text: 'Has anyone reviewed the latest safety compliance section?',
        timestamp: '10:30 AM'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'copied'>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const styles = {
    bg: theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50',
    panelBg: theme === 'dark' ? 'bg-slate-800/50' : 'bg-white',
    textMain: theme === 'dark' ? 'text-slate-100' : 'text-slate-900',
    textSub: theme === 'dark' ? 'text-slate-400' : 'text-slate-500',
    border: theme === 'dark' ? 'border-slate-700' : 'border-slate-200',
    inputBg: theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50',
    myBubble: 'bg-blue-600 text-white rounded-br-none',
    otherBubble: theme === 'dark' ? 'bg-slate-700 text-slate-100 rounded-bl-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none',
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      senderName: currentUser.name,
      text: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');

    // Simulate reply
    if (Math.random() > 0.7) {
        setTimeout(() => {
            const reply: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'other-user',
                senderName: 'Mike Ross',
                text: 'I agree with that point. The documentation is a bit vague there.',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, reply]);
        }, 2000);
    }
  };

  const handleInvite = () => {
    setInviteStatus('copied');
    // Simulate clipboard copy
    setTimeout(() => setInviteStatus('idle'), 2000);
  };

  const handleDownload = () => {
    // Simulate download
    alert(`Downloading document: ${group.relatedDocTitle}`);
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-64px)] ${styles.bg} animate-in fade-in duration-300`}>
      {/* Header */}
      <div className={`h-16 flex items-center justify-between px-4 border-b ${styles.border} ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} shadow-sm z-10`}>
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className={`p-2 rounded-lg hover:bg-slate-700/20 transition-colors ${styles.textSub}`}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center space-x-2">
                {group.type === 'private' ? <Shield size={16} className="text-amber-500" /> : <Hash size={16} className="text-slate-400" />}
                <h2 className={`font-bold text-lg ${styles.textMain}`}>{group.name}</h2>
            </div>
            <p className={`text-xs ${styles.textSub} flex items-center`}>
                <Users size={10} className="mr-1" /> {group.members} members • <FileText size={10} className="mx-1" /> {group.relatedDocTitle}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2">
           
           <button 
            onClick={handleDownload}
            className={`p-2 rounded-lg hover:bg-slate-700/20 transition-colors ${styles.textSub} hidden sm:block`} 
            title="Download PDF"
           >
            <Download size={18} />
           </button>

           <button 
            onClick={handleInvite}
            className={`p-2 rounded-lg hover:bg-slate-700/20 transition-colors ${inviteStatus === 'copied' ? 'text-emerald-500' : styles.textSub}`} 
            title="Invite People"
           >
            {inviteStatus === 'copied' ? <CheckCircle2 size={18} /> : <UserPlus size={18} />}
           </button>
           
           <div className={`h-4 w-px mx-1 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}></div>

           <button className={`p-2 rounded-lg hover:bg-slate-700/20 transition-colors ${styles.textSub}`} title="Search Messages">
            <Search size={18} />
          </button>
          <button className={`p-2 rounded-lg hover:bg-slate-700/20 transition-colors ${styles.textSub}`}>
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
            {/* Messages List */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-6 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
                {messages.map((msg) => {
                    const isMe = msg.sender === 'user';
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {!isMe && (
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-1 ${
                                    msg.sender === 'support' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'
                                }`}>
                                    {msg.sender === 'support' ? 'S' : msg.senderName?.charAt(0)}
                                </div>
                            )}
                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                                {!isMe && <span className={`text-xs mb-1 ml-1 ${styles.textSub}`}>{msg.senderName || 'System'}</span>}
                                <div className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm ${isMe ? styles.myBubble : styles.otherBubble}`}>
                                    <p>{msg.text}</p>
                                </div>
                                <span className={`text-[10px] mt-1 mx-1 opacity-60 ${styles.textSub}`}>{msg.timestamp}</span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`p-4 border-t ${styles.border} ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
                <form onSubmit={handleSendMessage} className="flex items-end space-x-2 max-w-5xl mx-auto">
                     <div className={`flex-1 relative rounded-xl border transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-700 focus-within:border-blue-500' : 'bg-slate-50 border-slate-200 focus-within:border-blue-500 focus-within:bg-white'}`}>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={`Message #${group.name}...`}
                            className={`w-full pl-4 pr-4 py-3 bg-transparent border-none focus:ring-0 ${styles.textMain} placeholder-slate-500`}
                        />
                     </div>
                     <button 
                        type="submit"
                        disabled={!inputValue.trim()}
                        className={`p-3 rounded-xl transition-all ${
                            inputValue.trim() 
                            ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/25 transform hover:scale-105' 
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>

        {/* Optional Sidebar (Hidden on small screens) */}
        <div className={`hidden lg:block w-64 border-l ${styles.border} ${styles.panelBg} p-4`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${styles.textSub}`}>Active Members</h3>
            <div className="space-y-3">
                {[currentUser, { name: 'Sarah Connors', status: 'online' }, { name: 'Mike Ross', status: 'away' }].map((member, i) => (
                    <div key={i} className="flex items-center space-x-3">
                        <div className="relative">
                            <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center text-white text-xs">
                                {member.name.charAt(0)}
                            </div>
                            {/* @ts-ignore */}
                            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 ${theme === 'dark' ? 'border-slate-800' : 'border-white'} ${member.status === 'away' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                        </div>
                        <span className={`text-sm ${styles.textMain}`}>{member.name}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default GroupChatView;