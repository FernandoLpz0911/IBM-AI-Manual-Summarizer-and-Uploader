import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  HelpCircle, 
  ChevronRight, 
  MessageSquare, 
  Search, 
  FileQuestion, 
  CreditCard, 
  Settings,
  ArrowLeft
} from 'lucide-react';
import { Theme, Message } from '../types';

interface SupportViewProps {
  theme: Theme;
  onBack: () => void;
}

const SupportView: React.FC<SupportViewProps> = ({ theme, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'support',
      text: 'Hello! I am the DocuMind Support Assistant. How can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const styles = {
    textMain: theme === 'dark' ? 'text-slate-100' : 'text-slate-900',
    textSub: theme === 'dark' ? 'text-slate-400' : 'text-slate-500',
    cardBg: theme === 'dark' ? 'bg-[#1e293b]/50' : 'bg-white',
    border: theme === 'dark' ? 'border-slate-700' : 'border-slate-200',
    inputBg: theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50',
    chatBubbleUser: 'bg-blue-600 text-white',
    chatBubbleBot: theme === 'dark' ? 'bg-slate-700 text-slate-100' : 'bg-slate-100 text-slate-800',
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const responses = [
        "I understand. Could you provide more details about the specific document you are trying to analyze?",
        "To reset your password, please go to the Settings page and click on 'Security'.",
        "Our OCR engine supports PDF, DOCX, and standard image formats. Are you having trouble with a specific file type?",
        "I can connect you with a human agent if this issue persists. Would you like me to do that?",
        "For billing inquiries, please check the 'Subscription' tab in your dashboard."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const newBotMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'support',
        text: randomResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, newBotMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const FaqItem = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
    <button className={`w-full text-left p-4 rounded-xl border ${styles.border} ${styles.cardBg} hover:border-blue-500 transition-all group flex items-start space-x-4`}>
      <div className={`p-3 rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors`}>
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <h4 className={`font-semibold ${styles.textMain} mb-1 flex items-center justify-between`}>
          {title}
          <ChevronRight size={16} className={`opacity-0 group-hover:opacity-100 transition-opacity ${styles.textSub}`} />
        </h4>
        <p className={`text-xs ${styles.textSub}`}>{desc}</p>
      </div>
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 animate-in fade-in duration-500">
      <div className="mb-8 flex items-center space-x-4">
        <button 
            onClick={onBack}
            className={`p-2 rounded-lg hover:bg-slate-700/20 transition-colors ${styles.textSub}`}
        >
            <ArrowLeft size={24} />
        </button>
        <div>
            <h2 className={`text-3xl font-bold ${styles.textMain} tracking-tight`}>Support Center</h2>
            <p className={`text-sm ${styles.textSub}`}>Get help with your account, documents, or technical issues.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Resources */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input 
                type="text" 
                className={`block w-full pl-10 pr-3 py-3 rounded-xl border leading-5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}
                placeholder="Search help articles..."
            />
          </div>

          <h3 className={`font-semibold ${styles.textMain} px-1`}>Common Topics</h3>
          <FaqItem icon={FileQuestion} title="Upload Issues" desc="Troubleshoot PDF processing errors" />
          <FaqItem icon={CreditCard} title="Billing & Plans" desc="Manage subscriptions and invoices" />
          <FaqItem icon={Settings} title="Account Settings" desc="Password reset and profile management" />
          
          <div className={`mt-8 p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg`}>
            <h4 className="font-bold text-lg mb-2">Need human help?</h4>
            <p className="text-blue-100 text-sm mb-4">Our support team is available Mon-Fri, 9am - 5pm EST.</p>
            <button className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors w-full">
              Contact Support
            </button>
          </div>
        </div>

        {/* Right Column: Chatbot */}
        <div className="lg:col-span-2">
          <div className={`flex flex-col h-[600px] rounded-2xl border ${styles.border} ${styles.cardBg} shadow-xl overflow-hidden`}>
            {/* Chat Header */}
            <div className={`p-4 border-b ${styles.border} flex items-center justify-between bg-slate-50/5`}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-md">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className={`font-bold ${styles.textMain}`}>Support Assistant</h3>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className={`text-xs ${styles.textSub}`}>Online</span>
                  </div>
                </div>
              </div>
              <button className={`p-2 rounded-lg hover:bg-slate-700/10 transition-colors ${styles.textSub}`}>
                <MessageSquare size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-end space-x-2 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.sender === 'user' ? 'bg-indigo-500 text-white' : 'bg-emerald-500 text-white'}`}>
                      {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div>
                      <div className={`px-5 py-3 rounded-2xl text-sm shadow-sm ${
                        msg.sender === 'user' 
                          ? `${styles.chatBubbleUser} rounded-br-none` 
                          : `${styles.chatBubbleBot} rounded-bl-none`
                      }`}>
                        {msg.text}
                      </div>
                      <span className={`text-[10px] mt-1 block ${styles.textSub} ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                   <div className={`flex items-end space-x-2`}>
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-emerald-500 text-white">
                      <Bot size={14} />
                    </div>
                    <div className={`${styles.chatBubbleBot} px-4 py-3 rounded-2xl rounded-bl-none`}>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`p-4 border-t ${styles.border} bg-slate-50/5`}>
              <form onSubmit={handleSendMessage} className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  className={`w-full pl-4 pr-12 py-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${styles.inputBg} ${styles.border} ${styles.textMain}`}
                />
                <button 
                  type="submit"
                  disabled={!inputValue.trim()}
                  className={`absolute right-2 top-2 p-2 rounded-lg transition-all ${
                    inputValue.trim() 
                      ? 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-105' 
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportView;